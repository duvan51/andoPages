import React from 'react';
import { ELITE_SERVICES } from '../constants/services';
import { useServices } from '../hooks/useServices';
import { getWhatsAppLeadUrl } from '../utils/whatsapp';

interface ServiceLandingProps {
  serviceId: string;
  onBack: () => void;
}

const ServiceLanding: React.FC<ServiceLandingProps> = ({ serviceId, onBack }) => {
  const { treatments, supplements, loading } = useServices();

  // Combinar ambos tipos de datos (Services + Treatments)
  const service = (ELITE_SERVICES.find(s => s.id === serviceId) || treatments.find(t => t.id === serviceId)) as any;

  if (loading) return (
    <div className="pt-40 flex flex-col items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!service) return null;

  const whatsappUrl = getWhatsAppLeadUrl({ serviceTitle: service.title });

  // Buscar suplementos recomendados
  const recommendedSupplements = supplements.filter(sup =>
    sup.matchingTreatments.includes(serviceId) || sup.matchingTreatments.includes(service.id)
  );

  return (
    <div className="pt-24 pb-20 animate-fade-in">
      {/* Hero Section Landing */}
      <div className="relative bg-emerald-950 text-white overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 opacity-30">
          <img src={service.imageUrl} className="w-full h-full object-cover" alt={service.title} />
          <div className="absolute inset-0 bg-emerald-950/80"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-emerald-400 font-bold mb-8 hover:text-emerald-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Volver
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-bold mb-6 uppercase tracking-widest">
                {service.subtitle}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                {service.title}
              </h1>
              <p className="text-lg md:text-xl text-emerald-100/80 leading-relaxed mb-4">
                {service.description || service.heroDescription}
              </p>
              {service.price && (
                <p className="text-3xl font-bold text-emerald-400 mb-10 flex items-center gap-2">
                  ${Number(service.price).toLocaleString()}
                  {service.packagePrice && <span className="text-sm text-emerald-200/60 font-medium">({service.packagePrice})</span>}
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/20"
                >
                  Agendar Valoración Ahora
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm"
                >
                  Hablar con un Especialista
                </a>
              </div>
            </div>

            {/* Galería Secundaria */}
            {service.secondary_images && service.secondary_images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 animate-scale-in">
                {service.secondary_images.map((img: string, i: number) => (
                  <div key={i} className={`rounded-3xl overflow-hidden border border-white/10 shadow-2xl ${i === 2 ? 'col-span-2 aspect-[21/9]' : 'aspect-square'}`}>
                    <img src={img} alt={`${service.title} perspective ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">¿Por qué elegir este tratamiento?</h2>
            <div className="space-y-6">
              {service.benefits.map((benefit: string, i: number) => (
                <div key={i} className="flex gap-4 items-start bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {i + 1}
                  </div>
                  <p className="text-lg text-slate-700 font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Detalles del Procedimiento</h3>
            <div className="space-y-8">
              {service.components ? (
                service.components.map((comp: any, i: number) => (
                  <div key={i} className="group">
                    <h4 className="text-xl font-bold text-emerald-600 mb-2">{comp.name}</h4>
                    <p className="text-slate-600 leading-relaxed">{comp.desc}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-6">
                  <p className="text-slate-600 leading-relaxed">
                    Nuestros tratamientos se enfocan en la raíz del problema celular, utilizando componentes de alta calidad y tecnología de punta.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Supplements Strategy Section */}
      {recommendedSupplements.length > 0 && (
        <div className="bg-slate-50 py-20 border-t border-slate-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Maximice sus Resultados</h2>
              <h3 className="text-4xl font-bold text-slate-900 leading-tight">Suplementación Coadyuvante</h3>
              <p className="text-slate-500 mt-4 leading-relaxed">Para una mejoría pronta y duradera, recomendamos acompañar este tratamiento con los siguientes productos nutricionales.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedSupplements.map((sup) => (
                <div key={sup.id} className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <img src={sup.imageUrl} className="w-32 h-32 rounded-2xl object-cover shadow-lg" alt={sup.title} />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white">
                      +
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{sup.title}</h4>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-grow">{sup.description}</p>
                  <div className="pt-4 border-t border-slate-50 w-full mt-auto">
                    <p className="text-emerald-700 font-bold text-lg mb-4">{sup.price}</p>
                    <a
                      href={getWhatsAppLeadUrl({ customMessage: `Interés en ${sup.title}` })}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      Ficha Técnica y Pedido
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final CTA Landing */}
      <div id="agendar" className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-4xl mx-auto bg-slate-900 p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-5"></div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 relative z-10">Empiece hoy su proceso de renovación</h2>
            <p className="text-lg text-emerald-100/70 mb-12 relative z-10">
              Estamos listos para brindarle una atención humana, profesional y con resultados garantizados.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-6 px-12 rounded-2xl text-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 relative z-10"
            >
              Confirmar mi cita ahora
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceLanding;
