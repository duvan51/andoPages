
import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface AdminAuthProps {
    onLogin: (email: string, password: string, remember: boolean) => void;
    onGoogleLogin: () => void;
    error?: string;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onLogin, onGoogleLogin, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password, rememberMe);
    };

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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Acceso Administrador</h1>
                    <p className="text-slate-500 font-semibold mt-2 px-8">Bienvenido de nuevo. Ingresa tus credenciales para administrar tu proyecto.</p>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm font-semibold text-slate-900"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña de Acceso</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-11 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-2xl transition-all text-sm font-semibold text-slate-900"
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200 group-hover:border-emerald-400'}`}>
                                    {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="text-xs font-bold text-slate-500 mt-0.5">Recordar mi sesión</span>
                            </label>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            Iniciar Sesión
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">O continuar con</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onGoogleLogin}
                            className="w-full bg-white border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-bold py-4 rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                    </form>
                </div>

                <p className="text-center mt-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Desarrollado por <span className="text-emerald-600">Advanced Agentic Coding</span>
                </p>
            </div>
        </div>
    );
};

export default AdminAuth;
