
import React, { useState, useEffect } from 'react';
import AdminLayout from './admin/layout/AdminLayout';
import AdminAuth from './admin/shared/AdminAuth';
import MediaLibrary from './admin/sections/MediaLibrary';
import AnalyticsDashboard from './admin/sections/Analytics';
import LocationsManager from './admin/sections/Locations';
import CompanyManager from './admin/sections/CompanyManager';
import LandingsManager from './admin/sections/Landings';
import ProductsManager from './admin/sections/Products';
import BundlesManager from './admin/sections/Bundles';
import WebsiteManager from './admin/sections/WebsiteManager';
import { AdminTab } from './admin/layout/Sidebar';
import { useTenant } from '../hooks/useTenant';
import { supabase } from '../lib/supabase';

// Note: In progress - we are refactoring the following sections into standalone components
// For now, these are basic placeholders or will keep their logic here until fully migrated

const AdminDashboard: React.FC = () => {
    const { tenant, isMainDomain } = useTenant();
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('promedid_admin_session') === 'active');
    const [isSuperAdmin, setIsSuperAdmin] = useState(() => localStorage.getItem('promedid_admin_role') === 'superadmin');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<AdminTab>('website');
    const [error, setError] = useState('');
    const [currentCompanyId, setCurrentCompanyId] = useState<string | undefined>(() => localStorage.getItem('promedid_admin_company') || undefined);
    const [managedCompany, setManagedCompany] = useState<any>(null);

    useEffect(() => {
        if (tenant && !currentCompanyId) {
            setCurrentCompanyId(tenant.id);
        }
    }, [tenant, currentCompanyId]);

    useEffect(() => {
        const fetchManagedCompany = async () => {
            if (!currentCompanyId) return;
            const { data } = await supabase
                .from('companies')
                .select('*')
                .eq('id', currentCompanyId)
                .single();
            if (data) setManagedCompany(data);
        };
        fetchManagedCompany();
    }, [currentCompanyId]);

    const getPreviewUrl = () => {
        if (!managedCompany) return undefined;

        const hostname = window.location.hostname;
        const port = window.location.port;

        // Development mode: Always use the internal slug for preview
        if (hostname === 'localhost' || hostname.includes('localhost')) {
            return `http://${managedCompany.slug}.localhost:${port || '5173'}`;
        }

        // Production mode: Always use the platform's internal subdomain for Preview
        // This allows organizing content without it being "publicly" visible on the custom domain yet
        return `https://${managedCompany.slug}.promedid.com`;
    };



    const handleLogin = async (email: string, pass: string, remember: boolean) => {
        // 1. Master Login for Super Admin
        if (email === 'aponteramirezduvan@gmail.com' && pass === '000000') {
            setIsSuperAdmin(true);
            setIsLoggedIn(true);
            if (tenant) setCurrentCompanyId(tenant.id); // Add this
            if (remember) {
                localStorage.setItem('promedid_admin_session', 'active');
                localStorage.setItem('promedid_admin_role', 'superadmin');
            }
            setError('');
            return;
        }

        // 2. Tenant Login
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('id, admin_email, admin_password')
                .eq('admin_email', email)
                .eq('admin_password', pass)
                .single();

            if (data) {
                // 1. Identify if it's a Super Admin by email
                const isMasterUser = data.admin_email === 'aponteramirezduvan@gmail.com';

                // 2. Security logic: 
                // IF we are on the main portal (promedid.com), allow ANY valid account.
                // IF we are on a customer domain (cliente.com), ONLY allow accounts for that company.
                if (!isMasterUser && !isMainDomain && tenant && data.id !== tenant.id) {
                    setError('Esta cuenta no pertenece a este proyecto.');
                    return;
                }

                setIsSuperAdmin(false);
                setIsLoggedIn(true);
                setCurrentCompanyId(data.id);

                if (remember) {
                    localStorage.setItem('promedid_admin_session', 'active');
                    localStorage.setItem('promedid_admin_role', 'tenant');
                    localStorage.setItem('promedid_admin_company', data.id);
                }
                setError('');
            } else {
                setError('Credenciales incorrectas.');
            }
        } catch (err) {
            setError('Error de conexión.');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsSuperAdmin(false);
        localStorage.removeItem('promedid_admin_session');
        localStorage.removeItem('promedid_admin_role');
    };

    if (!isLoggedIn) {
        return <AdminAuth onLogin={handleLogin} error={error} />;
    }

    return (
        <AdminLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            companyName={managedCompany?.name || "Cargando..."}
            isSuperAdmin={isSuperAdmin}
            previewUrl={getPreviewUrl()}
        >
            {activeTab === 'website' && <WebsiteManager companyId={currentCompanyId} />}
            {activeTab === 'analytics' && <AnalyticsDashboard companyId={currentCompanyId} />}
            {activeTab === 'media' && <MediaLibrary companyId={currentCompanyId} />}
            {activeTab === 'locations' && <LocationsManager companyId={currentCompanyId} />}
            {activeTab === 'landings' && <LandingsManager companyId={currentCompanyId} />}
            {activeTab === 'products' && <ProductsManager companyId={currentCompanyId} />}
            {activeTab === 'packages' && <BundlesManager companyId={currentCompanyId} />}
            {activeTab === 'offers' && <BundlesManager companyId={currentCompanyId} />}
            {activeTab === 'companies' && (
                <CompanyManager
                    onSelectCompany={setCurrentCompanyId}
                    currentCompanyId={currentCompanyId}
                />
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
