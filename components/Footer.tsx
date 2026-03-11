import React from 'react';
import { useTenant } from '../hooks/useTenant';
import { Instagram, Facebook, Smartphone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { tenant } = useTenant();
  const config = (tenant as any)?.config || {};
  const footer = config.footer || {};
  const contact = config.contact || {};
  const isDark = tenant?.template_id === 'medical-dark' || tenant?.template_id === 'services-tech';

  return (
    <footer className={`${isDark ? 'bg-slate-950 text-white' : 'bg-emerald-950 text-white'} py-20`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {tenant?.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-emerald-950 font-bold text-xl">P</div>
              )}
              <span className="text-2xl font-bold tracking-tight uppercase">{tenant?.name || 'PROMEDID'}</span>
            </div>
            <p className="text-emerald-100/60 leading-relaxed text-sm">
              {footer.description || 'Líderes en salud holística y medicina alternativa en Colombia. Transformamos vidas a través de la renovación celular y el equilibrio sistémico.'}
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
            <h5 className="font-bold text-lg mb-8">Servicios Top</h5>
            <ul className="space-y-4 text-emerald-100/60 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Barrido Arterial</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Sueroterapia Personalizada</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Salud Digestiva</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terapia Neural</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Detox Iónico</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-8">Contacto</h5>
            <ul className="space-y-4 text-emerald-100/60 text-sm">
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
            <h5 className="font-bold text-lg mb-8">Suscríbete</h5>
            <p className="text-sm text-emerald-100/60 mb-6">Recibe consejos de salud y ofertas exclusivas en tratamientos.</p>
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

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] uppercase tracking-widest text-emerald-100/40 font-bold">
          <p>© {new Date().getFullYear()} {footer.copyright || `${tenant?.name || 'PROMEDID Colombia'}. Todos los derechos reservados.`}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Términos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
