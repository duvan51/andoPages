import React from 'react';
import { useTenant } from '../hooks/useTenant';
import { Instagram, Facebook, Smartphone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { tenant } = useTenant();
  const config = (tenant as any)?.config || {};
  const footer = config.footer || {};
  const contact = config.contact || {};
  const isDark = tenant?.template_id === 'medical-dark' || tenant?.template_id === 'services-tech';
  const isFashion = tenant?.business_type === 'fashion';

  const footerBg = isFashion ? 'bg-black text-white' : isDark ? 'bg-slate-950 text-white' : 'bg-emerald-950 text-white';
  const accentColor = isFashion ? 'emerald-500' : 'emerald-500'; // Keep emerald as accent or adapt

  const defaultDesc = isFashion 
    ? `Exclusividad y diseño en cada prenda. ${tenant?.name || 'Nuestra marca'} redefine la moda femenina con elegancia y lujo.` 
    : 'Líderes en servicios profesionales. Transformamos la experiencia de nuestros clientes a través de la excelencia y el compromiso.';

  const servicesLabel = isFashion ? 'Colecciones' : 'Servicios Top';
  const subscribeTitle = isFashion ? 'Únete al Círculo' : 'Suscríbete';
  const subscribeDesc = isFashion ? 'Recibe antes que nadie nuestras nuevas colecciones y eventos exclusivos.' : 'Recibe consejos y ofertas exclusivas directamente en tu correo.';

  return (
    <footer className={`${footerBg} py-20`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {tenant?.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-auto object-contain" />
              ) : (
                <div className={`w-10 h-10 bg-${accentColor} rounded-lg flex items-center justify-center text-slate-950 font-bold text-xl`}>
                    {tenant?.name?.charAt(0) || 'P'}
                </div>
              )}
              <span className="text-2xl font-bold tracking-tight uppercase">{tenant?.name}</span>
            </div>
            <p className="opacity-60 leading-relaxed text-sm">
              {footer.description || defaultDesc}
            </p>
            <div className="flex gap-4">
              {footer.socialLinks?.facebook && (
                <a href={footer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer">
                  <Facebook size={18} />
                </a>
              )}
              {footer.socialLinks?.instagram && (
                <a href={footer.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer">
                  <Instagram size={18} />
                </a>
              )}
              {footer.socialLinks?.whatsapp && (
                <a href={`https://wa.me/${footer.socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer">
                  <Smartphone size={18} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-8">{servicesLabel}</h5>
            <ul className="space-y-4 opacity-60 text-sm">
              <li><a href="#inventory" className="hover:text-emerald-400 transition-colors">{isFashion ? 'Nueva Colección' : 'Consultoría'}</a></li>
              <li><a href="#inventory" className="hover:text-emerald-400 transition-colors">{isFashion ? 'Lookbook' : 'Servicios'}</a></li>
              <li><a href="#inventory" className="hover:text-emerald-400 transition-colors">{isFashion ? 'Accesorios' : 'Paquetes'}</a></li>
              {isFashion && <li><a href="#inventory" className="hover:text-emerald-400 transition-colors">Best Sellers</a></li>}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-8">Contacto</h5>
            <ul className="space-y-4 opacity-60 text-sm">
              {contact.address && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-3">
                  <Smartphone size={16} className="text-emerald-500 shrink-0" />
                  <span>{contact.phone}</span>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-emerald-500 shrink-0" />
                  <span>{contact.email}</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-8">{subscribeTitle}</h5>
            <p className="text-sm opacity-60 mb-6">{subscribeDesc}</p>
            <div className="relative">
              <input
                type="email"
                placeholder="Tu correo"
                className="w-full bg-white/10 border-transparent focus:bg-white/20 focus:border-emerald-500 rounded-xl px-5 py-4 text-sm outline-none transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-emerald-500 text-emerald-950 font-bold px-4 rounded-lg text-xs hover:bg-emerald-400 transition-colors">
                Unirme
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] uppercase tracking-widest opacity-40 font-bold">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p>© {new Date().getFullYear()} {footer.copyright || `${tenant?.name}. Todos los derechos reservados.`}</p>
            <span className="hidden md:inline text-white/10 opacity-20">•</span>
            <p className="flex items-center gap-1.5">
              Hecho con ❤️ por <a href="https://desarrollandoando.fun/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">www.andopages.com</a>
            </p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
