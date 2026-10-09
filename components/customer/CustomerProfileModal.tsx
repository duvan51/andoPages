import React from 'react';
import { X, Crown, LogOut, ShoppingBag, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useTenant } from '../../hooks/useTenant';
import { useCart } from '../../context/CartContext';
import { formatPriceCOP } from '../../utils/format';

export const CustomerProfileModal: React.FC = () => {
  const { customer, isProfileModalOpen, setIsProfileModalOpen, logout } = useCustomerAuth();
  const { tenant } = useTenant();
  const { setIsCartOpen, totalItems } = useCart();

  if (!isProfileModalOpen || !customer) return null;

  const initials = customer.full_name
    ? customer.full_name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'VIP';

  const rewardValue = customer.points * 1000;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsProfileModalOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-up border border-slate-100">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button 
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-amber-500/20">
              {initials}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                <Crown size={12} />
                Socio {customer.tier}
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">{customer.full_name}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Mail size={12} /> {customer.email}
              </p>
              {customer.phone && (
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <Phone size={12} /> +57 {customer.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tarjeta de Fidelización Gold VIP */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-200/80 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black tracking-wider uppercase text-amber-800">
                  Saldo de Fidelización
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-slate-900">{customer.points}</span>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Puntos VIP</span>
                </div>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-700">
                <Award size={26} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60">
              <p className="text-xs font-bold text-slate-700">
                ✨ Canjeable por hasta <span className="text-emerald-700 font-black">{formatPriceCOP(rewardValue)}</span> en tus próximas compras.
              </p>
              <div className="w-full bg-amber-200/60 h-2 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '50%' }} />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                Faltan 50 puntos para ascender a nivel Plata (Envío Gratis ilimitado)
              </span>
            </div>
          </div>

          {/* Accesos Rápidos */}
          <div className="space-y-2">
            <button
              onClick={() => {
                setIsProfileModalOpen(false);
                setIsCartOpen(true);
              }}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-xs text-slate-700">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Mi Bolsa de Compras</div>
                  <div className="text-[11px] text-slate-500">{totalItems} prendas guardadas</div>
                </div>
              </div>
              <span className="text-slate-400 font-bold text-base">›</span>
            </button>
          </div>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={logout}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileModal;
