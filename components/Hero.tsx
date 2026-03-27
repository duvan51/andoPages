
import React from 'react';
import { useTenant } from '../hooks/useTenant';

interface HeroProps {
  onServiceSelect: (id: string) => void;
  onTreatmentsClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onServiceSelect, onTreatmentsClick }) => {
  const { tenant } = useTenant();
  const template = tenant?.template_id;
  const isDark = template === 'medical-dark' || template === 'services-tech';
  const config = (tenant as any)?.config?.hero || {};

  return (
    <div className={`relative min-h-[90vh] flex items-center overflow-hidden pt-20 transition-all duration-700 ${template === 'medical-dark' ? 'bg-slate-950' :
      template === 'services-tech' ? 'bg-[#0a0c10]' :
        template === 'fitness-pro' ? 'bg-orange-50' : 'bg-emerald-50'
      }`}>
      {/* Background elements */}
      <div className={`absolute top-0 right-0 w-1/3 h-full -skew-x-12 transform translate-x-1/4 opacity-50 ${isDark ? 'bg-slate-900' : 'bg-emerald-100/50'
        }`}></div>

      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8 animate-fade-in">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${template === 'medical-dark' ? 'bg-amber-500/10 text-amber-500' :
            template === 'services-tech' ? 'bg-cyan-500/10 text-cyan-400' :
              'bg-emerald-100 text-emerald-700'
            }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${template === 'medical-dark' ? 'bg-amber-500' :
              template === 'services-tech' ? 'bg-cyan-400' : 'bg-emerald-500'
              }`}></span>
            {config.subtitle || (template === 'services-tech' ? 'Innovación Digital' : `Bienvenido a ${tenant?.name || 'PROMEDID'}`)}
          </div>

          <h1 className={`text-5xl md:text-7xl font-bold leading-tight ${isDark ? 'text-white' : 'text-emerald-950'}`}>
            {config.title ? (
              config.title
            ) : (
              <>
                {template === 'services-tech' ? 'Transformando el' : 'Descubra el poder de la'}{' '}
                <span className={
                  template === 'medical-dark' ? 'text-amber-500' :
                    template === 'services-tech' ? 'text-cyan-400' : 'text-emerald-600'
                }>
                  {template === 'services-tech' ? 'futuro digital' : 'salud integral'}
                </span>
                {' '}{template === 'services-tech' ? 'con precisión' : `en ${tenant?.name || 'nuestras manos'}`}
              </>
            )}
          </h1>

          <p className={`text-lg max-w-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {config.description || (
              `${tenant?.name || 'PROMEDID'}, líderes en soluciones de ${template === 'services-tech' ? 'tecnología y software' : 'bienestar'}. Transformamos su calidad de vida con ${template === 'services-tech' ? 'código de vanguardia' : 'atención humana'}.`
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onServiceSelect('analizador-cuantico')}
              className={`px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl flex items-center justify-center gap-2 group ${template === 'medical-dark' ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20' :
                template === 'services-tech' ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20' :
                  'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
            >
              {config.buttonText || (template === 'services-tech' ? 'Comenzar Proyecto' : 'Agendar Analizador Cuántico')}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={onTreatmentsClick}
              className={`px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 border-2 ${isDark ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white hover:bg-slate-50 text-emerald-700 border-emerald-100'
                }`}
            >
              {config.secondaryButtonText || 'Ver Portafolio'}
            </button>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/${i + 20}/100/100`}
                  className="w-12 h-12 rounded-full border-4 border-emerald-50"
                  alt="Patient"
                />
              ))}
            </div>
            <div className="text-sm">
              <p className="font-bold text-emerald-950">+15,000 Pacientes</p>
              <p className="text-slate-500">Han renovado su salud con nosotros</p>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={config.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000"}
              alt={tenant?.name || "Bienestar Integral"}
              className="w-full h-auto object-cover aspect-[4/5]"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-slate-950/40' : 'from-emerald-950/40'} to-transparent`}></div>
          </div>

          {/* Decorative floating cards */}
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-20 animate-bounce-slow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Certificación</p>
                <p className="text-sm font-bold text-slate-800">Calidad Médica 100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
