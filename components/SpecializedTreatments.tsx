import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../hooks/useTenant';
import { MOCK_SERVICES } from '../constants/mockData';
import OptimizedImage from './shared/OptimizedImage';

interface Treatment {
  id: string;
  title: string;
  tag?: string;
  description?: string;
}

interface SpecializedTreatmentsProps {
  onServiceSelect: (id: string) => void;
  onShowAll: () => void;
}

const SpecializedTreatments: React.FC<SpecializedTreatmentsProps> = ({ onServiceSelect, onShowAll }) => {
  const { tenant } = useTenant();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const isFashion = tenant?.business_type === 'fashion';
  const isTech = tenant?.template_id === 'services-tech';

  useEffect(() => {
    if (tenant) {
      fetchTreatments();
    }
  }, [tenant]);

  const fetchTreatments = async () => {
    if (tenant?.id === 'preview-id') {
      setTreatments(MOCK_SERVICES as any);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('company_id', tenant?.id)
      .eq('active', true);

    if (!error && data) {
      setTreatments(data);
    }
    setLoading(false);
  };

  if (loading) return null;
  if (treatments.length === 0) return null;

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Tratamientos Avanzados</h2>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            {isFashion ? 'Nuestra' : isTech ? 'Nuestra' : 'Tratamientos'} <br className="hidden md:block" /> {isFashion ? 'Selección' : isTech ? 'Metodología' : 'Avanzados'}
          </h2>
        </div>
        <div className="pb-2">
          <button
            onClick={onShowAll}
            className="text-emerald-600 font-bold hover:underline flex items-center gap-2"
          >
            Ver catálogo completo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treatments.slice(0, 6).map((t, i) => (
          <div
            key={i}
            className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer flex flex-col h-full"
            onClick={() => onServiceSelect(t.id)}
          >
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full mb-4 uppercase tracking-wider w-fit">
              {t.tag || 'Destacado'}
            </span>
            <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
              {t.title}
            </h4>
            <p className="text-slate-500 leading-relaxed text-sm line-clamp-3 mb-4 flex-grow">
              {t.description || 'Consulta los detalles de este tratamiento avanzado.'}
            </p>
            <span className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1">
              Ver más
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-20 bg-emerald-950 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="relative z-10 space-y-6 flex-1">
          <h4 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            ¿Listo para dar el primer paso hacia su <span className="text-emerald-400">transformación</span>?
          </h4>
          <p className="text-emerald-100/70 text-lg">
            {isFashion ? 'Nuestros looks son especiales para esos momentos donde debes brillar.' :
             isTech ? 'Nuestros expertos están listos para diseñar una solución a su medida.' :
             'Nuestros especialistas están listos para diseñar un plan de tratamiento único para usted.'}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => onServiceSelect('analizador-cuantico')}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-8 py-4 rounded-xl font-bold transition-all shadow-lg"
            >
              Agendar Diagnóstico
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all backdrop-blur-sm">
              {isFashion ? 'Hablar con una asesora' : 'Hablar con un Especialista'}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 relative hidden lg:block">
          <div className="w-80 h-80 rounded-full border-[12px] border-emerald-900/50 overflow-hidden">
            <OptimizedImage src="https://picsum.photos/seed/doctor-1/400/400" alt="Doctor" width={400} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-emerald-950 px-6 py-2 rounded-full font-bold shadow-xl">
            {isFashion ? 'Asesoría VIP' : isTech ? 'Soporte Senior' : 'Médicos Expertos'}
          </div>
        </div>
      </div>
          <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-emerald-950 px-6 py-2 rounded-full font-bold shadow-xl">
            {isFashion ? 'Asesoría VIP' : isTech ? 'Soporte Senior' : 'Médicos Expertos'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecializedTreatments;
