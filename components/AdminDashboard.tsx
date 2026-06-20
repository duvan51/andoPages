
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
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

    // Password Recovery States
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Onboarding Form States
    const [onboardingName, setOnboardingName] = useState('');
    const [onboardingSlug, setOnboardingSlug] = useState('');
    const [onboardingType, setOnboardingType] = useState('medical');
    const [onboardingColor, setOnboardingColor] = useState('#10b981');
    const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);

    // Change Password States (under Settings tab)
    const [changePassword, setChangePassword] = useState('');
    const [confirmChangePassword, setConfirmChangePassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showConfirmChangePassword, setShowConfirmChangePassword] = useState(false);
    const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
    const [changePasswordError, setChangePasswordError] = useState('');


    useEffect(() => {
        // Detect if URL contains password recovery hash
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) {
            setIsRecoveryMode(true);
        }

        // Listen for Supabase Auth changes (for Google Login & Password Recovery)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryMode(true);
                if (session) {
                    setUserEmail(session.user.email || null);
                }
                return;
            }
            
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
                            console.log('Usuario nuevo: Redirigiendo a onboarding.');
                            setIsSuperAdmin(false);
                            setIsLoggedIn(true);
                            setCurrentCompanyId(undefined);
                            localStorage.setItem('promedid_admin_session', 'active');
                            localStorage.setItem('promedid_admin_role', 'onboarding');
                            localStorage.removeItem('promedid_admin_company');
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
            if (role === 'superadmin') {
                setUserEmail('aponteramirezduvan@gmail.com');
            } else {
                const storedEmail = localStorage.getItem('promedid_admin_email');
                if (storedEmail) setUserEmail(storedEmail);
            }
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
                    if (!userEmail && data.admin_email) {
                        setUserEmail(data.admin_email);
                        localStorage.setItem('promedid_admin_email', data.admin_email);
                    }
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

    const handleForgotPassword = async (email: string) => {
        try {
            setError('');
            const redirectTo = `${window.location.origin}${window.location.pathname}`;
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Error al enviar el correo de recuperación.');
            throw err;
        }
    };

    const handleLogin = async (email: string, pass: string, remember: boolean) => {
        setError('');
        let supabaseAuthErrorMsg = '';

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

        // 2. Try Supabase Auth Login first (For newly registered or migrated users)
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password: pass
            });

            if (!authError && authData.session) {
                setError('');
                return;
            } else if (authError) {
                supabaseAuthErrorMsg = authError.message;
            }
        } catch (authErr: any) {
            console.log('Supabase Auth login failed, falling back to direct DB check...', authErr);
        }

        // 3. Fallback: Tenant Login via direct DB check (For legacy accounts with plain text passwords)
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
                setUserEmail(data.admin_email);
                localStorage.setItem('promedid_admin_email', data.admin_email);

                if (remember) {
                    localStorage.setItem('promedid_admin_session', 'active');
                    localStorage.setItem('promedid_admin_role', 'tenant');
                    localStorage.setItem('promedid_admin_company', data.id);
                }
                setError('');
            } else {
                if (supabaseAuthErrorMsg) {
                    if (supabaseAuthErrorMsg.toLowerCase().includes('confirm') || supabaseAuthErrorMsg.toLowerCase().includes('verified')) {
                        setError('Debes confirmar tu correo electrónico. Por favor revisa tu bandeja de entrada.');
                    } else if (supabaseAuthErrorMsg.toLowerCase().includes('invalid login credentials')) {
                        setError('Credenciales incorrectas (verifica tu correo y contraseña).');
                    } else {
                        setError(supabaseAuthErrorMsg);
                    }
                } else {
                    setError('Credenciales incorrectas o cuenta no registrada.');
                }
            }
        } catch (err) {
            if (supabaseAuthErrorMsg) {
                if (supabaseAuthErrorMsg.toLowerCase().includes('confirm') || supabaseAuthErrorMsg.toLowerCase().includes('verified')) {
                    setError('Debes confirmar tu correo electrónico. Por favor revisa tu bandeja de entrada.');
                } else if (supabaseAuthErrorMsg.toLowerCase().includes('invalid login credentials')) {
                    setError('Credenciales incorrectas (verifica tu correo y contraseña).');
                } else {
                    setError(supabaseAuthErrorMsg);
                }
            } else {
                setError('Error de conexión o credenciales incorrectas.');
            }
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

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onboardingName || !onboardingSlug) {
            alert('Por favor completa todos los campos.');
            return;
        }

        setIsOnboardingSubmitting(true);
        setError('');

        const cleanSlug = onboardingSlug
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        try {
            // 1. Check if slug is unique
            const { data: existing } = await supabase
                .from('companies')
                .select('id')
                .eq('slug', cleanSlug)
                .maybeSingle();

            if (existing) {
                setError('El subdominio ya está en uso. Por favor elige otro.');
                setIsOnboardingSubmitting(false);
                return;
            }

            const email = userEmail || (await supabase.auth.getUser()).data.user?.email;

            if (!email) {
                setError('No se pudo identificar tu sesión de usuario. Por favor vuelve a iniciar sesión.');
                setIsOnboardingSubmitting(false);
                return;
            }

            // 2. Insert new company
            const payload = {
                name: onboardingName,
                slug: cleanSlug,
                business_type: onboardingType,
                template_id: onboardingType === 'medical' ? 'medical-modern' : onboardingType === 'fashion' ? 'fashion-luxury' : 'services-clean',
                admin_email: email,
                admin_password: '', // Authenticating through Supabase Auth/OAuth
                primary_color: onboardingColor,
                status: 'active',
                config: {
                    hero: {
                        title: `Bienvenido a ${onboardingName}`,
                        subtitle: onboardingType === 'medical' ? 'Renovación y Bienestar' : onboardingType === 'fashion' ? 'Nueva Colección' : 'Servicios Profesionales',
                        description: 'Estamos comprometidos con tu bienestar y satisfacción.',
                        buttonText: 'Ver Servicios',
                        secondaryButtonText: 'Contáctanos'
                    },
                    contact: {
                        email: email,
                        phone: '+57 300 000 0000',
                        address: 'Dirección Principal'
                    },
                    metadata: {
                        title: `${onboardingName} | Sitio Oficial`,
                        faviconUrl: ''
                    }
                }
            };

            const { data: newCompany, error: insertError } = await supabase
                .from('companies')
                .insert([payload])
                .select()
                .single();

            if (insertError) throw insertError;

            if (newCompany) {
                alert('¡Tu sitio web ha sido creado con éxito!');
                
                // Update session state
                setCurrentCompanyId(newCompany.id);
                localStorage.setItem('promedid_admin_session', 'active');
                localStorage.setItem('promedid_admin_role', 'tenant');
                localStorage.setItem('promedid_admin_company', newCompany.id);
                
                // Clear onboarding inputs
                setOnboardingName('');
                setOnboardingSlug('');
                setOnboardingType('medical');
                setOnboardingColor('#10b981');
            }
        } catch (err: any) {
            setError(err.message || 'Error al crear la empresa.');
        } finally {
            setIsOnboardingSubmitting(false);
        }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetting(true);
        setError('');

        try {
            const { data, error: authError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (authError) throw authError;

            const email = data?.user?.email || userEmail;

            if (email) {
                // Update password in companies table (plain-text admin_password)
                const { error: dbError } = await supabase
                    .from('companies')
                    .update({ admin_password: newPassword })
                    .eq('admin_email', email);

                if (dbError) {
                    console.error('Error syncing database password:', dbError);
                }
            }

            alert('Contraseña actualizada con éxito. Por favor inicia sesión con tu nueva contraseña.');
            
            await supabase.auth.signOut();
            setIsRecoveryMode(false);
            setIsLoggedIn(false);
            setIsSuperAdmin(false);
            localStorage.removeItem('promedid_admin_session');
            localStorage.removeItem('promedid_admin_role');
            localStorage.removeItem('promedid_admin_company');
            setNewPassword('');
            
            // Clean hash URL
            window.history.pushState({}, '', '/admin');
            window.dispatchEvent(new Event('popstate'));
        } catch (err: any) {
            setError(err.message || 'Error al restablecer la contraseña.');
        } finally {
            setIsResetting(false);
        }
    };

    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!changePassword || !confirmChangePassword) {
            setChangePasswordError('Por favor completa todos los campos.');
            return;
        }
        if (changePassword !== confirmChangePassword) {
            setChangePasswordError('Las contraseñas no coinciden.');
            return;
        }
        if (changePassword.length < 6) {
            setChangePasswordError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsChangingPassword(true);
        setChangePasswordError('');
        setChangePasswordSuccess('');

        try {
            // 1. Try to update user password in Supabase Auth (if active session exists)
            const sessionResult = await supabase.auth.getSession();
            let authErrorOccurred = false;
            
            if (sessionResult.data.session) {
                const { error: authError } = await supabase.auth.updateUser({
                    password: changePassword
                });
                if (authError) {
                    console.error('Error updating password in Supabase Auth:', authError);
                    authErrorOccurred = true;
                }
            }

            // 2. Update password in companies table (plain-text admin_password) for sync / fallback login
            const email = userEmail || sessionResult.data.session?.user?.email || localStorage.getItem('promedid_admin_email');
            
            if (email) {
                const { error: dbError } = await supabase
                    .from('companies')
                    .update({ admin_password: changePassword })
                    .eq('admin_email', email);

                if (dbError) {
                    throw new Error('Error al actualizar la contraseña en la base de datos: ' + dbError.message);
                }
            } else if (authErrorOccurred) {
                throw new Error('No se pudo identificar la cuenta para cambiar la contraseña.');
            }

            setChangePasswordSuccess('¡Contraseña actualizada con éxito!');
            setChangePassword('');
            setConfirmChangePassword('');
        } catch (err: any) {
            setChangePasswordError(err.message || 'Error al actualizar la contraseña.');
        } finally {
            setIsChangingPassword(false);
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
        localStorage.removeItem('promedid_admin_email');
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
    };

    const getPreviewUrl = () => {
        if (!managedCompany) return '/';
        return `/${managedCompany.slug}`;
    };

    if (isRecoveryMode) {
        return (
            <div className="min-h-screen bg-emerald-50/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full -mr-64 -mt-64 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full -ml-64 -mb-64 blur-3xl"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-xl shadow-emerald-600/30 animate-float">
                            P
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            Restablecer Contraseña
                        </h1>
                        <p className="text-slate-500 font-semibold mt-2 px-8">
                            Ingresa tu nueva contraseña para actualizar tu cuenta.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-slate-100">
                        <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        required
                                        type={showResetPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-11 pr-11 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm font-semibold text-slate-900"
                                        placeholder="••••••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowResetPassword(!showResetPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-shake">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isResetting}
                                className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {isResetting ? 'Guardando...' : 'Actualizar Contraseña'}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <AdminAuth 
                onLogin={handleLogin} 
                onRegister={handleRegister} 
                onGoogleLogin={handleGoogleLogin} 
                onForgotPassword={handleForgotPassword}
                error={error} 
            />
        );
    }

    if (isLoggedIn && !currentCompanyId && !isSuperAdmin) {
        return (
            <div className="min-h-screen bg-emerald-50/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full -mr-64 -mt-64 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full -ml-64 -mb-64 blur-3xl"></div>

                <div className="w-full max-w-2xl relative z-10 animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-xl shadow-emerald-600/30 animate-float">
                            A
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            ¡Bienvenido a AndoPages!
                        </h1>
                        <p className="text-slate-500 font-semibold mt-2 px-8">
                            Vamos a configurar tu primer sitio web. Rellena los datos básicos a continuación para comenzar.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-emerald-900/10 border border-slate-100">
                        <form onSubmit={handleCreateCompany} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial de la Empresa</label>
                                <input
                                    required
                                    type="text"
                                    value={onboardingName}
                                    onChange={(e) => {
                                        setOnboardingName(e.target.value);
                                        const clean = e.target.value
                                            .toLowerCase()
                                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                                            .replace(/[^a-z0-9\s-]/g, '')
                                            .trim()
                                            .replace(/\s+/g, '-');
                                        setOnboardingSlug(clean);
                                    }}
                                    className="block w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm font-semibold text-slate-900"
                                    placeholder="Ej: Clínica Dental San José"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Giro de Negocio</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'medical', label: '🏥 Clínica / SPA', desc: 'Consultorios, Estética' },
                                        { id: 'fashion', label: '👗 Tienda de Moda', desc: 'Boutique, Ropa' },
                                        { id: 'services', label: '🛠️ Servicios', desc: 'Software, Asesoría' }
                                    ].map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => setOnboardingType(t.id)}
                                            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center justify-center ${onboardingType === t.id ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' : 'border-slate-100 hover:border-slate-200 bg-white text-slate-500'}`}
                                        >
                                            <span className="text-sm font-bold leading-snug">{t.label}</span>
                                            <span className="text-[9px] text-slate-400 font-semibold mt-1">{t.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subdominio (URL de tu sitio)</label>
                                    <input
                                        required
                                        type="text"
                                        value={onboardingSlug}
                                        onChange={(e) => setOnboardingSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        className="block w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm font-semibold text-slate-900"
                                        placeholder="ej: dental-sanjose"
                                    />
                                    <p className="text-[10px] text-slate-400 font-semibold ml-1">
                                        URL: <span className="text-emerald-600 font-bold">{onboardingSlug || 'empresa'}.andopages.com</span>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Color de Marca</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={onboardingColor}
                                            onChange={(e) => setOnboardingColor(e.target.value)}
                                            className="w-14 h-14 rounded-2xl border-none p-0 overflow-hidden cursor-pointer shrink-0"
                                        />
                                        <input
                                            type="text"
                                            value={onboardingColor}
                                            onChange={(e) => setOnboardingColor(e.target.value)}
                                            className="block w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm font-mono font-bold text-slate-900 uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
                                >
                                    Cerrar Sesión
                                </button>
                                <button
                                    type="submit"
                                    disabled={isOnboardingSubmitting}
                                    className="flex-[2] bg-slate-900 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isOnboardingSubmitting ? 'Configurando...' : 'Crear mi Sitio Web'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
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

                            {/* Cambiar Contraseña */}
                            <div className="space-y-6 pt-6 border-t border-slate-50">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                    Seguridad de la Cuenta
                                </h3>

                                <form onSubmit={handleChangePasswordSubmit} className="space-y-6 max-w-xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nueva Contraseña</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <Lock size={16} />
                                                </div>
                                                <input
                                                    required
                                                    type={showChangePassword ? 'text' : 'password'}
                                                    value={changePassword}
                                                    onChange={(e) => setChangePassword(e.target.value)}
                                                    className="block w-full pl-11 pr-11 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm font-semibold text-slate-900"
                                                    placeholder="Nueva contraseña"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowChangePassword(!showChangePassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showChangePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Confirmar Nueva Contraseña</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <Lock size={16} />
                                                </div>
                                                <input
                                                    required
                                                    type={showConfirmChangePassword ? 'text' : 'password'}
                                                    value={confirmChangePassword}
                                                    onChange={(e) => setConfirmChangePassword(e.target.value)}
                                                    className="block w-full pl-11 pr-11 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm font-semibold text-slate-900"
                                                    placeholder="Confirmar contraseña"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmChangePassword(!showConfirmChangePassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showConfirmChangePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {changePasswordError && (
                                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-shake">
                                            {changePasswordError}
                                        </div>
                                    )}

                                    {changePasswordSuccess && (
                                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">
                                            {changePasswordSuccess}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="bg-slate-900 hover:bg-emerald-600 text-white font-black px-6 py-4 rounded-2xl transition-all text-xs uppercase flex items-center gap-2 shadow-sm hover:shadow-xl hover:shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {isChangingPassword ? 'Guardando...' : 'Cambiar Contraseña'}
                                    </button>
                                </form>
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

