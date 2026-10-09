import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useTenant } from '../../hooks/useTenant';

export const CustomerAuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, isLoading } = useCustomerAuth();
  const { tenant } = useTenant();
  const isFashion = tenant?.business_type === 'fashion';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Por favor ingresa tu correo y contraseña');
        return;
      }
      setIsSubmitting(true);
      const res = await login(email, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Error al iniciar sesión');
      }
    } else {
      if (!fullName.trim()) {
        setErrorMessage('Por favor escribe tu nombre completo');
        return;
      }
      if (!email.trim()) {
        setErrorMessage('Por favor ingresa tu correo electrónico');
        return;
      }
      if (!phone.trim() || phone.trim().length < 7) {
        setErrorMessage('Por favor ingresa un número de celular válido');
        return;
      }
      if (!password.trim() || password.length < 6) {
        setErrorMessage('La contraseña debe tener mínimo 6 caracteres');
        return;
      }

      setIsSubmitting(true);
      const res = await register(fullName, email, phone, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Error al registrar la cuenta');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-up border border-slate-100">
        
        {/* Banner de Fidelización */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white relative">
          <button 
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-2">
            <Sparkles size={13} className="text-yellow-300" />
            Club VIP {tenant?.name || 'Exclusivo'}
          </div>
          <h3 className="text-2xl font-black tracking-tight leading-tight">
            {mode === 'login' ? 'Bienvenida de Nuevo' : 'Únete y Gana 50 Puntos'}
          </h3>
          <p className="text-white/90 text-xs mt-1 leading-relaxed">
            {mode === 'login' 
              ? 'Ingresa para consultar tus puntos acumulados y tus compras.'
              : '🎁 Recibe 50 Puntos ($50.000 COP) de bienvenida para futuras compras.'}
          </p>
        </div>

        {/* Tabs de cambio rápido */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 p-1.5">
          <button
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all ${
              mode === 'login' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all ${
              mode === 'register' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Crear Cuenta VIP
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Camila Restrepo"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Celular (WhatsApp)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: 320 462 1623"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`w-full py-3.5 rounded-2xl font-black text-sm text-white tracking-wide uppercase transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 ${
              isFashion 
                ? 'bg-slate-900 hover:bg-black shadow-slate-900/20' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              'Ingresar a mi Cuenta'
            ) : (
              'Crear mi Cuenta VIP 🎉'
            )}
          </button>
        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          Tus datos están protegidos y te permitirán comprar sin fricción.
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthModal;
