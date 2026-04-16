
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from './admin/layout/AdminLayout';
import WebsiteManager from './admin/sections/WebsiteManager';
import ProductsManager from './admin/sections/Products';
import LandingsManager from './admin/sections/Landings';
import MediaLibrary from './admin/sections/MediaLibrary';
import AnalyticsDashboard from './admin/sections/Analytics';
import CompanyManager from './admin/sections/CompanyManager';
import LocationsManager from './admin/sections/Locations';
import BundlesManager from './admin/sections/Bundles';
import AdminAuth from './admin/shared/AdminAuth';
import ReviewsManager from './admin/sections/ReviewsManager';
import FormsManager from './admin/sections/FormsManager';
import { AdminTab } from './admin/layout/Sidebar';

const AdminDashboard: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<AdminTab>('website');
    const [error, setError] = useState('');
    const [currentCompanyId, setCurrentCompanyId] = useState<string | undefined>(() => localStorage.getItem('promedid_admin_company') || undefined);
    const [managedCompany, setManagedCompany] = useState<any>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {

        // Listen for Supabase Auth changes (for Google Login)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

            
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
                const email = session.user.email || null;
                setUserEmail(email);


                // 1. Verificar si es el ÚNICO Super Admin
                const superAdmins = ['aponteramirezduvan@gmail.com'];
                const isSuper = superAdmins.includes(email || '');

                if (isSuper) {
                    console.log('Acceso concedido como ÚNICO Super Admin');
                    setIsSuperAdmin(true);
                    setIsLoggedIn(true);
                    localStorage.setItem('promedid_admin_session', 'active');
                    localStorage.setItem('promedid_admin_role', 'superadmin');
                } else {

                    // 2. Verificar Administradores Organizacionales en la tabla companies
                    try {
                        const { data: company, error: dbError } = await supabase
                            .from('companies')
                            .select('*')
                            .eq('admin_email', email)
                            .maybeSingle();

                        if (company) {

                            setIsSuperAdmin(false);
                            setIsLoggedIn(true);
                            setCurrentCompanyId(company.id);
                            localStorage.setItem('promedid_admin_session', 'active');
                            localStorage.setItem('promedid_admin_role', 'tenant');
                            localStorage.setItem('promedid_admin_company', company.id);
                        } else {
                            console.log('Acceso denegado: Correo no vinculado a ninguna empresa.');
                            setError('Tu correo no tiene permisos para acceder a ninguna empresa.');
                            await supabase.auth.signOut();
                        }
                    } catch (err) {
                        console.error('Error al validar cuenta:', err);
                        setError('Error al verificar tus credenciales.');
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setIsLoggedIn(false);
                setIsSuperAdmin(false);
                setUserEmail(null);
            }
        });

        // Restore session from localStorage if available
        const session = localStorage.getItem('promedid_admin_session');
        const role = localStorage.getItem('promedid_admin_role');
        const companyId = localStorage.getItem('promedid_admin_company');

        if (session === 'active') {
            setIsLoggedIn(true);
            setIsSuperAdmin(role === 'superadmin');
            if (companyId) setCurrentCompanyId(companyId);
        }

        return () => subscription.unsubscribe();
    }, []);

    const handleCompanySelect = (id: string) => {
        setCurrentCompanyId(id);
        localStorage.setItem('promedid_admin_company', id);
    };

    useEffect(() => {
        const fetchManagedCompany = async () => {
            if (!currentCompanyId) return;
            try {
                const { data } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', currentCompanyId)
                    .maybeSingle();
                if (data) {
                    setManagedCompany(data);
                }
            } catch (err) {
                console.error('Error fetching company info:', err);
            }
        };

        if (isLoggedIn) {
            fetchManagedCompany();
        }
    }, [isLoggedIn, currentCompanyId]);

    // Auto-select first company for Super Admin if none selected
    useEffect(() => {
        const autoSelectFirstCompany = async () => {
            if (isLoggedIn && isSuperAdmin && !currentCompanyId) {
                const { data: companies } = await supabase
                    .from('companies')
                    .select('id')
                    .order('created_at', { ascending: true })
                    .limit(1);
                
                if (companies && companies.length > 0) {
                    handleCompanySelect(companies[0].id);
                }
            }
        };
        autoSelectFirstCompany();
    }, [isLoggedIn, isSuperAdmin, currentCompanyId]);

    const handleGoogleLogin = async () => {
        try {
            setError('');
            const redirectTo = `${window.location.origin}/`;
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    }
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión con Google.');
        }
    };

    const handleLogin = async (email: string, pass: string, remember: boolean) => {
        // 1. Master Login for Super Admin
        if (email === 'aponteramirezduvan@gmail.com' && pass === '000000') {
            setIsSuperAdmin(true);
            setIsLoggedIn(true);
            if (remember) {
                localStorage.setItem('promedid_admin_session', 'active');
                localStorage.setItem('promedid_admin_role', 'superadmin');
            }
            
            // Try to auto-select ProMedid or first company
            const { data: promedid } = await supabase
                .from('companies')
                .select('id')
                .eq('slug', 'promedid')
                .single();
            
            if (promedid) {
                handleCompanySelect(promedid.id);
            } else {
                const { data: first } = await supabase
                    .from('companies')
                    .select('id')
                    .limit(1);
                if (first && first.length > 0) handleCompanySelect(first[0].id);
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

    const handleRegister = async (email: string, pass: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password: pass,
                options: {
                    emailRedirectTo: `${window.location.origin}${window.location.pathname}#admin`
                }
            });

            if (error) throw error;

            if (data?.user) {
                alert('Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta.');
            }
        } catch (err: any) {
            setError(err.message || 'Error al registrar usuario.');
        }
    };


    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setIsSuperAdmin(false);
        setUserEmail(null);
        localStorage.removeItem('promedid_admin_session');
        localStorage.removeItem('promedid_admin_role');
        localStorage.removeItem('promedid_admin_company');
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
    };

    const getPreviewUrl = () => {
        if (!managedCompany) return '/';
        return `/${managedCompany.slug}`;
    };

    if (!isLoggedIn) {
        return (
            <AdminAuth 
                onLogin={handleLogin} 
                onRegister={handleRegister} 
                onGoogleLogin={handleGoogleLogin} 
                error={error} 
            />
        );
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
            {activeTab === 'media' && <MediaLibrary companyId={currentCompanyId} />}
            {activeTab === 'analytics' && <AnalyticsDashboard companyId={currentCompanyId} />}
            {activeTab === 'locations' && <LocationsManager companyId={currentCompanyId} />}
            {activeTab === 'landings' && <LandingsManager companyId={currentCompanyId} />}
            {activeTab === 'products' && <ProductsManager companyId={currentCompanyId} />}
            {activeTab === 'packages' && <BundlesManager companyId={currentCompanyId} />}
            {activeTab === 'offers' && <BundlesManager companyId={currentCompanyId} />}
            {activeTab === 'reviews' && <ReviewsManager companyId={currentCompanyId} />}
            {activeTab === 'forms' && <FormsManager companyId={currentCompanyId} />}
            {activeTab === 'companies' && isSuperAdmin && (
                <CompanyManager
                    onSelectCompany={handleCompanySelect}
                    currentCompanyId={currentCompanyId}
                />
            )}

            {activeTab === 'settings' && (
                <div className="max-w-4xl mx-auto py-10 px-6">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mi Perfil</h2>
                                <p className="text-slate-500 font-bold mt-2">Configuración y seguridad de la cuenta</p>
                            </div>
                            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-600/20">
                                {userEmail?.[0].toUpperCase() || 'A'}
                            </div>
                        </div>
                        
                        <div className="p-10 space-y-10">
                            {/* Información de Usuario */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Correo Electrónico</label>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="font-bold text-slate-900">{userEmail || 'Cargando...'}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nivel de Acceso</label>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${isSuperAdmin ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'}`}>
                                            {isSuperAdmin ? 'Super Administrador' : 'Administrador de Empresa'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Gestión de Empresa */}
                            <div className="space-y-6 pt-6 border-t border-slate-50">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                    Empresa bajo control
                                </h3>
                                
                                <div className="p-8 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2rem] text-white relative overflow-hidden shadow-2xl shadow-emerald-600/30">
                                    <div className="relative z-10">
                                        <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Portal Administrativo</p>
                                        <h4 className="text-3xl font-black mb-6 tracking-tight uppercase">{managedCompany?.name || 'Empresa No Identificada'}</h4>
                                        <div className="flex flex-wrap gap-3 mt-4">
                                            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold border border-white/10">ID: {currentCompanyId}</span>
                                            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold border border-white/10 uppercase tracking-widest">{managedCompany?.business_type || 'Servicios'}</span>
                                            <span className="bg-emerald-400/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold border border-emerald-400/20 text-emerald-100 italic">ESTADO: ACTIVO</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <div className="w-48 h-48 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-xs font-semibold px-4 italic">
                                    {isSuperAdmin 
                                        ? "Nota: Como Super Admin, puedes cambiar la empresa que estás viendo actualmente desde el gestor global de empresas."
                                        : "Acceso Restringido: Tu cuenta está vinculada estrictamente a esta organización."
                                    }
                                </p>
                            </div>

                            {/* Botón de Salida */}
                            <div className="pt-10 flex justify-end">
                                <button 
                                    onClick={handleLogout}
                                    className="bg-red-50 text-red-600 font-black px-8 py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all text-xs uppercase flex items-center gap-3 shadow-sm hover:shadow-xl hover:shadow-red-600/20 group"
                                >
                                    Cerrar sesión de forma segura
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
