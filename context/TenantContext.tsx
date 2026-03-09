
import React, { createContext, useContext, useState, useEffect } from 'react';
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
    setTenant?: (tenant: Company | null) => void; // For preview purposes
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode; previewTenant?: Company }> = ({ children, previewTenant }) => {
    const [tenant, setTenant] = useState<Company | null>(previewTenant || null);
    const [isLoading, setIsLoading] = useState(!previewTenant);
    const [isError, setIsError] = useState(false);
    const [isMainDomain, setIsMainDomain] = useState(false);

    useEffect(() => {
        if (previewTenant) {
            setTenant(previewTenant);
            setIsLoading(false);
            return;
        }

        const identifyTenant = async () => {
            setIsLoading(true);
            const hostname = window.location.hostname;
            const cleanHostname = hostname.replace(/^www\./, '');

            // Administrative domains that show the SaaS landing vs administrative tools
            const adminDomains = ['localhost', 'promedid.com', 'admin.promedid.com'];

            try {
                // 1. Try finding by exact custom domain
                let { data } = await supabase
                    .from('companies')
                    .select('*')
                    .or(`custom_domain.eq.${hostname},custom_domain.eq.${cleanHostname}`)
                    .single();

                // 2. Try subdomains (e.g. clinic.promeid.com)
                if (!data) {
                    const parts = hostname.split('.');
                    // Check if it's a subdomain of the main platform (not a custom domain)
                    if (parts.length >= 2 && !adminDomains.includes(hostname)) {
                        const slug = parts[0];
                        const { data: subdomainData } = await supabase
                            .from('companies')
                            .select('*')
                            .eq('slug', slug)
                            .single();
                        data = subdomainData;
                    }
                }

                // 3. Check if it's the main administrative/SaaS domain
                const isMain = adminDomains.includes(hostname) || adminDomains.includes(cleanHostname);

                // If we are on a main domain and no company custom domain matched it directly,
                // we check if we should show the "Master" tenant site or the SaaS landing.
                if (!data && isMain) {
                    const { data: masterData } = await supabase
                        .from('companies')
                        .select('*')
                        .eq('slug', 'master')
                        .single();
                    data = masterData;
                }

                // Set isMainDomain: true ONLY if we are on a platform domain AND 
                // we haven't matched a custom domain explicitly.
                const isMatchedByCustomDomain = data && (data.custom_domain === hostname || data.custom_domain === cleanHostname);
                const isShowingSaaSLanding = isMain && !isMatchedByCustomDomain;
                setIsMainDomain(isShowingSaaSLanding);

                if (data) {
                    setTenant(data);
                    document.documentElement.style.setProperty('--primary-color', data.primary_color);
                } else if (!isMain) {
                    setIsError(true);
                }
            } catch (err) {
                console.error('Tenant detection error:', err);
                setIsError(true);
            } finally {
                setIsLoading(false);
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
