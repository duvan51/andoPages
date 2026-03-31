
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
    setTenant?: (tenant: Company | null) => void; 
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
            console.log('--- DETECCIÓN: Paso 1 (Inicio) ---');
            setIsLoading(true);
            const hostname = window.location.hostname;
            const cleanHostname = hostname.replace(/^www\./, '');

            const adminDomains = [
                'localhost',
                'admin.' + window.location.hostname.split('.').slice(-2).join('.'),
                window.location.hostname.split('.').slice(-2).join('.'),
                'www.' + window.location.hostname.split('.').slice(-2).join('.')
            ];

            const isMain = adminDomains.includes(hostname) || adminDomains.includes(cleanHostname);
            console.log('--- DETECCIÓN: Paso 2 (Hostname) ---', hostname, isMain);

            try {
                let data = null;
                
                // 1. Dominio Custom o Localhost
                if (!isMain || hostname === 'localhost') {
                    console.log('--- DETECCIÓN: Paso 3 (Buscando en DB por dominio) ---');
                    const { data: customDomainData, error: err1 } = await supabase
                        .from('companies')
                        .select('*')
                        .in('custom_domain', [hostname, cleanHostname])
                        .maybeSingle();
                    if (err1) console.error('Error en Paso 3:', err1);
                    data = customDomainData;
                }

                // 2. Subdominios
                if (!data) {
                    console.log('--- DETECCIÓN: Paso 4 (Buscando por subdominio) ---');
                    const parts = hostname.split('.');
                    if (parts.length >= 2 && !isMain) {
                        const slug = parts[0];
                        const { data: subdomainData, error: err2 } = await supabase
                            .from('companies')
                            .select('*')
                            .eq('slug', slug)
                            .maybeSingle();
                        if (err2) console.error('Error en Paso 4:', err2);
                        data = subdomainData;
                    }
                }

                // 3. Fallback: Path segments
                if (!data && isMain) {
                    console.log('--- DETECCIÓN: Paso 5 (Buscando por path slug) ---');
                    const pathSegments = window.location.pathname.split('/').filter(Boolean);
                    if (pathSegments.length > 0) {
                        const pathSlug = pathSegments[0];
                        const protectedPaths = ['admin', 'login', 'api', 'assets', 'static', 'dashboard', 'home'];
                        if (!protectedPaths.includes(pathSlug.toLowerCase())) {
                            const { data: pathData, error: err3 } = await supabase
                                .from('companies')
                                .select('*')
                                .eq('slug', pathSlug)
                                .maybeSingle();
                            if (err3) console.error('Error en Paso 5:', err3);
                            data = pathData;
                        }
                    }
                }

                // 4. Master default
                if (!data && isMain) {
                    console.log('--- DETECCIÓN: Paso 6 (Buscando Master) ---');
                    const { data: masterData, error: err4 } = await supabase
                        .from('companies')
                        .select('*')
                        .eq('slug', 'master')
                        .maybeSingle();
                    if (err4) console.error('Error en Paso 6:', err4);
                    data = masterData;
                }

                console.log('--- DETECCIÓN: FINALIZADA ---', data ? 'Empresa encontrada' : 'No se encontró empresa');

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
            } catch (err) {
                console.error('--- ERROR EN IDENTIFYTENANT ---', err);
                setIsError(true);
            } finally {
                console.log('--- DETECCIÓN: Cargando finalizado (setIsLoading false) ---');
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
