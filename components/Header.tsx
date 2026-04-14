
import React, { useState, useEffect } from 'react';
import { useTenant } from '../hooks/useTenant';
import { supabase } from '../lib/supabase';
import { formatPriceCOP } from '../utils/format';
import { Menu, X, Home, Sparkles, Gift, Clock } from 'lucide-react';
import { UrgencyBadge } from './shared/UrgencyBadge';

interface HeaderProps {
  onHomeClick: () => void;
  onServicesClick: () => void;
  onTreatmentsClick: () => void;
  onBookingClick: () => void;
  onOffersClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onServicesClick, onTreatmentsClick, onBookingClick, onOffersClick }) => {
  const { tenant } = useTenant();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isFashion = tenant?.business_type === 'fashion';

  const [announcementBundles, setAnnouncementBundles] = useState<any[]>([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  useEffect(() => {
    const fetchBundles = async () => {
      if (!tenant?.id) return;
      const { data } = await supabase
        .from('bundles')
        .select('*')
        .eq('company_id', tenant.id)
        .limit(5);
      if (data && data.length > 0) setAnnouncementBundles(data);
    };
    fetchBundles();
  }, [tenant?.id]);

  useEffect(() => {
    if (announcementBundles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentAnnouncementIndex(prev => (prev + 1) % announcementBundles.length);
    }, 60000);
    return () => clearInterval(timer);
  }, [announcementBundles]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#home', action: onHomeClick, icon: Home },
    { name: isFashion ? 'Lookbook' : 'Tratamientos', href: isFashion ? '#lookbook' : '#tratamientos', action: onTreatmentsClick, icon: Sparkles },
    { name: 'Paquetes', href: '#ofertas-page', action: onOffersClick, icon: Gift }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
          }`}
      >
        {/* Ofertas Premium Carousel (Announcement Bar) */}
        {announcementBundles.length > 0 && (
          <div className="hidden md:block bg-slate-900 border-b border-white/5 h-10 w-full overflow-hidden relative cursor-pointer" onClick={() => onOffersClick && onOffersClick()}>
            {announcementBundles.map((bundle, index) => (
              <div 
                key={bundle.id}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out px-4 w-full ${
                  index === currentAnnouncementIndex 
                    ? 'opacity-100 translate-y-0' 
                    : index < currentAnnouncementIndex 
                      ? 'opacity-0 -translate-y-full' 
                      : 'opacity-0 translate-y-full'
                }`}
              >
                <div className="flex items-center gap-3 max-w-full">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black tracking-widest uppercase text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded shadow-sm whitespace-nowrap">
                    <span>OFERTAS</span>
                    <span className="text-emerald-400/50">|</span>
                    <UrgencyBadge expiryDate={bundle.expiry_date} redAlertClass="text-red-400 font-extrabold" staticSize={12} />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white truncate tracking-wide">
                    {bundle.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      <div className={`container mx-auto px-4 md:px-6 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'}`}>
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onHomeClick}
        >
          <div className={`w-10 h-10 ${isFashion ? 'bg-slate-900' : 'bg-emerald-600'} rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform`}>
            {tenant?.name?.charAt(0) || 'P'}
          </div>
          <span className={`text-2xl font-bold tracking-tight ${isFashion ? 'text-slate-900 uppercase' : 'text-emerald-900'}`}>
            {tenant?.name || 'PROMEDID'}
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
              if (link.name === 'Inicio' || link.name === 'Tratamientos' || link.name === 'Paquetes' || isFashion) {
                  // For simplicity in this demo, let them scroll normal if not handling complex SPA actions
                  if (link.action) {
                    e.preventDefault();
                    link.action();
                  }
                }
              }}
              className={`text-sm font-medium ${isScrolled ? 'text-slate-600' : 'text-slate-900'} hover:text-emerald-600 transition-colors`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={onBookingClick}
            className={`hidden md:block ${isFashion ? 'bg-slate-900 hover:bg-black' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-lg active:scale-95`}
          >
            {isFashion ? 'Ver Tienda' : 'Agenda Cita'}
          </button>
          
          <button 
            className={`lg:hidden p-2 rounded-xl border backdrop-blur-sm transition-all ${isScrolled ? 'text-slate-800 border-slate-200' : 'text-current border-white/20 bg-white/10 hover:bg-white/20'}`}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
      </header>

      {/* Mobile Menu Left Drawer - FUERA DEL HEADER PARA EVITAR CONFLICTOS DE CSS CONTAINMENT */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          {/* Backdrop oscuro */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer contenedor izquierdo */}
          <div className="absolute top-0 bottom-0 left-0 w-[75%] max-w-sm bg-white shadow-2xl flex flex-col animate-fade-in z-10">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onHomeClick(); setIsMobileMenuOpen(false); }}>
                <div className={`w-9 h-9 ${isFashion ? 'bg-slate-900' : 'bg-emerald-600'} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                  {tenant?.name?.charAt(0) || 'P'}
                </div>
                <span className={`text-xl font-bold tracking-tight ${isFashion ? 'text-slate-900 uppercase' : 'text-emerald-900'}`}>
                  {tenant?.name || 'PROMEDID'}
                </span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-6 p-6 flex-grow overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      if (link.action) {
                        e.preventDefault();
                        link.action();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 text-xl font-black text-slate-800 border-b border-slate-50 pb-4 hover:text-emerald-600 transition-colors group"
                  >
                    <Icon size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    {link.name}
                  </a>
                );
              })}

              {/* Ofertas destacadas en menú móvil */}
              {announcementBundles.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">
                    Ofertas Exclusivas
                  </span>
                  <div className="flex flex-col gap-3">
                    {announcementBundles.slice(0, 3).map(bundle => (
                      <div 
                        key={bundle.id} 
                        className="flex gap-3 items-center bg-white border border-slate-100 p-2 rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-transform"
                        onClick={() => {
                          if (onOffersClick) onOffersClick();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center relative border border-slate-100">
                            {bundle.imageUrl ? (
                                <img src={bundle.imageUrl} alt={bundle.title} className="w-full h-full object-cover" />
                            ) : (
                                <Gift size={20} className="text-emerald-300" />
                            )}
                        </div>
                        <div className="flex flex-col overflow-hidden w-full">
                           <h4 className="text-sm font-bold text-slate-800 line-clamp-1 truncate">{bundle.title}</h4>
                           <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-emerald-500 font-black text-sm">{formatPriceCOP(bundle.sale_price || bundle.bundle_price)}</span>
                             {(bundle.original_total || bundle.bundle_price > bundle.sale_price) && (
                                <span className="text-red-500 font-bold text-[10px] line-through">
                                  {formatPriceCOP(bundle.original_total || bundle.bundle_price)}
                                </span>
                             )}
                           </div>
                           <div className="flex items-center gap-1 mt-1 font-bold text-amber-600 bg-amber-50 w-fit px-1.5 py-0.5 rounded shadow-sm border border-amber-100 text-[9px] uppercase tracking-widest">
                             <UrgencyBadge expiryDate={bundle.expiry_date} redAlertClass="text-red-500 font-extrabold" staticSize={10} />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 mt-auto shrink-0">
              <button
                onClick={() => {
                  onBookingClick();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex justify-center items-center ${isFashion ? 'bg-slate-900' : 'bg-emerald-600'} text-white px-5 py-4 rounded-xl font-bold text-base active:scale-95 transition-all shadow-xl shadow-emerald-600/20`}
              >
                {isFashion ? 'Ver Tienda' : 'Agenda Cita'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
