
import React from 'react';
import { useTenant } from '../hooks/useTenant';

const TrustSection: React.FC = () => {
  const { tenant } = useTenant();

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <div>
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Compromiso {tenant?.name || 'PROMEDID'}</h2>
            <h3 className="text-4xl font-bold text-slate-900 leading-tight">
              Excelencia, Integridad y Empatía en cada tratamiento
            </h3>
          </div>

          <p className="text-lg text-slate-600 leading-relaxed">
            Nuestra misión es ofrecer tratamientos innovadores que no solo alivien síntomas, sino que transformen vidas. Creemos en una medicina que escucha al paciente y busca la armonía total del ser.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Enfoque Holístico", desc: "Tratamos la raíz del problema, no solo la superficie." },
              { title: "Diagnóstico Preciso", desc: "Equipos de última generación para planes personalizados." },
              { title: "Tecnología Humana", desc: "Lo último en innovación médica con trato cercano." },
              { title: "Curación Real", desc: "Promovemos la recuperación de adentro hacia afuera." }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="bg-emerald-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
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
