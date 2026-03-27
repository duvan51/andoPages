import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../hooks/useTenant';
import { MOCK_SERVICES } from '../constants/mockData';

interface Service {
  id: string;
  title: string;
  subtitle?: string;
  heroDescription?: string;
  imageUrl?: string;
}

interface ServicesProps {
  onServiceSelect: (id: string) => void;
  onShowAll: () => void;
}

const Services: React.FC<ServicesProps> = ({ onServiceSelect, onShowAll }) => {
  const { tenant } = useTenant();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) {
      fetchServices();
    }
  }, [tenant]);

  const fetchServices = async () => {
    if (tenant?.id === 'preview-id') {
      setServices(MOCK_SERVICES as any);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('company_id', tenant?.id)
      .eq('active', true)
      .limit(6);

    if (!error && data) {
      setServices(data);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (services.length === 0) return null; // Or show a default section if you prefer

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Nuestros Pilares</h2>
        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Servicios para su Bienestar</h3>
        <p className="text-lg text-slate-600">
          Descubra soluciones personalizadas diseñadas específicamente para sus necesidades.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {services.slice(0, 3).map((service) => (
          <div
            key={service.id}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            onClick={() => onServiceSelect(service.id)}
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={service.imageUrl || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000'}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            <div className="p-8">
              <p className="text-sm font-bold text-emerald-600 mb-2 uppercase tracking-wide">{service.subtitle || 'Servicio Premium'}</p>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h4>
              <p className="text-slate-500 mb-8 leading-relaxed line-clamp-3">
                {service.heroDescription || 'Experimente un nivel superior de atención y resultados con nuestros especialistas.'}
              </p>
              <button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceSelect(service.id);
                }}
              >
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onShowAll}
          className="inline-flex items-center gap-2 bg-white text-emerald-700 border-2 border-emerald-100 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-100/20 group"
        >
          Ver Todos los Servicios
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Services;
