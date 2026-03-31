
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface Company {
    id: string;
    name: string;
    slug: string;
    custom_domain?: string;
    logo_url?: string;
    primary_color: string;
    business_type: string;
    template_id?: string;
    config: any;
    status: string;
}

interface TenantContextType {
    tenant: Company | null;
    isLoading: boolean;
    isError: boolean;
    isMainDomain: boolean;
    setTenant?: (tenant: Company | null) => void; 
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode; previewTenant?: Company }> = ({ children, previewTenant }) => {
    const [tenant, setTenant] = useState<Company | null>(previewTenant || null);
    const [isLoading, setIsLoading] = useState(!previewTenant);
    const [isError, setIsError] = useState(false);
    const [isMainDomain, setIsMainDomain] = useState(false);
    
    const identifyingRef = useRef(false);

    useEffect(() => {
        if (previewTenant) {
            setTenant(previewTenant);
            setIsLoading(false);
            return;
        }

        const identifyTenant = async (retryCount = 0) => {
            if (identifyingRef.current && retryCount === 0) return;
            identifyingRef.current = true;

            if (retryCount === 0) await new Promise(r => setTimeout(r, 100));

            const hostname = window.location.hostname;
            const cleanHostname = hostname.replace(/^www\./, '');
            const adminDomains = ['localhost', 'desarrollandoando.fun'];
            const isMain = adminDomains.some(d => hostname.includes(d));

            try {
                setIsLoading(true);
                let data = null;
                
                // 1. Dominio Custom
                if (!isMain || hostname.includes('localhost')) {
                    const { data: d, error } = await supabase
                        .from('companies')
                        .select('*')
                        .in('custom_domain', [hostname, cleanHostname])
                        .maybeSingle();
                    if (!error) data = d;
                    else if (error.message.includes('AbortError')) throw error;
                }

                // 2. Path Slug (/promedid)
                if (!data && isMain) {
                    const pathSegments = window.location.pathname.split('/').filter(Boolean);
                    if (pathSegments.length > 0) {
                        const pathSlug = pathSegments[0];
                        const protectedPaths = ['admin', 'login', 'dashboard', 'api', 'assets', 'static', 'home'];
                        if (!protectedPaths.includes(pathSlug.toLowerCase())) {
                            const { data: d, error } = await supabase
                                .from('companies')
                                .select('*')
                                .eq('slug', pathSlug)
                                .maybeSingle();
                            if (error && error.message.includes('AbortError')) throw error;
                            data = d;
                        }
                    }
                }

                // 3. Master default
                if (!data && isMain) {
                    const { data: d, error } = await supabase
                        .from('companies')
                        .select('*')
                        .eq('slug', 'master')
                        .maybeSingle();
                    if (error && error.message.includes('AbortError')) throw error;
                    data = d;
                }

                const pathSegments = window.location.pathname.split('/').filter(Boolean);
                const isPathTenant = pathSegments.length > 0 && data && data.slug === pathSegments[0];
                const isMatchedByCustomDomain = data && (data.custom_domain === hostname || data.custom_domain === cleanHostname);
                const isShowingSaaSLanding = isMain && !isPathTenant && !isMatchedByCustomDomain;
                
                setIsMainDomain(isShowingSaaSLanding);

                if (data) {
                    setTenant(data);
                    document.documentElement.style.setProperty('--primary-color', data.primary_color);
                } else if (!isMain) {
                    setIsError(true);
                }
                
                setIsLoading(false);
                identifyingRef.current = false;

            } catch (err: any) {
                if (err.message?.includes('AbortError') && retryCount < 3) {
                    identifyingRef.current = false;
                    setTimeout(() => identifyTenant(retryCount + 1), 200);
                } else {
                    console.error('Error fatal en detección:', err);
                    setIsError(true);
                    setIsLoading(false);
                    identifyingRef.current = false;
                }
            }
        };

        identifyTenant();
    }, [previewTenant]);

    return (
        <TenantContext.Provider value={{ tenant, isLoading, isError, isMainDomain }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenantContext = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenantContext must be used within a TenantProvider');
    }
    return context;
};
