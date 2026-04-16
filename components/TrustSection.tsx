
import React from 'react';
import { useTenant } from '../hooks/useTenant';

const TrustSection: React.FC = () => {
  const { tenant } = useTenant();

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${
              tenant?.template_id === 'services-tech' ? 'text-cyan-400' : 'text-emerald-600'
            }`}>Compromiso {tenant?.name || 'PROMEDID'}</h2>
            <h3 className={`text-4xl font-bold leading-tight ${
              tenant?.template_id === 'services-tech' ? 'text-white' : 'text-slate-900'
            }`}>
              {tenant?.template_id === 'services-tech' 
                ? 'Innovación, Eficiencia y Escalabilidad en cada solución' 
                : 'Excelencia, Integridad y Empatía en cada tratamiento'}
            </h3>
          </div>

          <p className={`text-lg leading-relaxed ${
            tenant?.template_id === 'services-tech' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {tenant?.template_id === 'services-tech'
              ? 'Nuestra misión es desarrollar software de alto impacto que no solo optimice procesos, sino que transforme negocios. Creemos en una tecnología que potencia el ingenio humano y busca la agilidad operativa total.'
              : 'Nuestra misión es ofrecer tratamientos innovadores que no solo alivien síntomas, sino que transformen vidas. Creemos en una medicina que escucha al paciente y busca la armonía total del ser.'}
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: tenant?.template_id === 'services-tech' ? "Arquitectura Sólida" : "Enfoque Holístico", desc: tenant?.template_id === 'services-tech' ? "Código limpio y mantenible diseñado para el crecimiento." : "Tratamos la raíz del problema, no solo la superficie." },
              { title: tenant?.template_id === 'services-tech' ? "Metodología Ágil" : "Diagnóstico Preciso", desc: tenant?.template_id === 'services-tech' ? "Entregas continuas para mayor visibilidad y rapidez." : "Equipos de última generación para planes personalizados." },
              { title: tenant?.template_id === 'services-tech' ? "Seguridad Digital" : "Tecnología Humana", desc: tenant?.template_id === 'services-tech' ? "Protección de datos y cifrado de nivel empresarial." : "Lo último en innovación médica con trato cercano." },
              { title: tenant?.template_id === 'services-tech' ? "Soporte Continuo" : "Curación Real", desc: tenant?.template_id === 'services-tech' ? "Acompañamiento técnico 24/7 en cada fase del despliegue." : "Promovemos la recuperación de adentro hacia afuera." }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                  tenant?.template_id === 'services-tech' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className={`font-bold ${tenant?.template_id === 'services-tech' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                  <p className={`text-sm ${tenant?.template_id === 'services-tech' ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className={`rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl ${
            tenant?.template_id === 'services-tech' ? 'bg-[#11141d] shadow-cyan-900/20 border border-white/5' : 'bg-emerald-600 shadow-emerald-900/20'
          }`}>
            {/* Abstract glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-700/50 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center space-y-8">
              <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-sm font-bold mb-4">
                ¿Por qué Sueroterapia?
              </div>
              <h4 className="text-5xl md:text-6xl font-extrabold">20 Veces</h4>
              <p className="text-2xl font-light opacity-90">más potentes que los suplementos orales</p>

              <div className="h-px bg-white/20 w-full"></div>

              <p className="text-lg opacity-80 leading-relaxed italic">
                "Al ir directo al torrente sanguíneo, la absorción es del 100%, garantizando que cada célula de su cuerpo reciba la nutrición que necesita para sanar de inmediato."
              </p>

              <div className="flex justify-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2">💊</div>
                  <span className="text-xs uppercase opacity-70">Oral (5-10%)</span>
                </div>
                <div className="flex items-center text-white/40 text-2xl mx-4">→</div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-2 text-emerald-600 text-xl font-bold">100</div>
                  <span className="text-xs uppercase font-bold">Intravenoso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSection;
