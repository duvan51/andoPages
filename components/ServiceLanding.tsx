import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ELITE_SERVICES } from '../constants/services';
import { useServices } from '../hooks/useServices';
import { getWhatsAppLeadUrl } from '../utils/whatsapp';
import { supabase } from '../lib/supabase';
import { formatPriceCOP } from '../utils/format';
import ReviewsSection from './ReviewsSection';
import OptimizedImage from './shared/OptimizedImage';
import BundleCard, { BundleModal } from './shared/BundleCard';
import { X, ChevronLeft, ChevronRight, Play, Gift, Share2, Check } from 'lucide-react';

interface GalleryLightboxProps {
  media: { url: string; type: 'image' | 'video' }[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const GalleryLightbox: React.FC<GalleryLightboxProps> = ({ media, initialIndex, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  if (!isOpen) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % media.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);

  const currentMedia = media[currentIndex];
  
  const isYoutube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = (url: string) => url.includes('vimeo.com');

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all active:scale-95"
        >
          <X size={24} />
        </button>

        {media.length > 1 && (
          <>
            <button 
              onClick={prev} 
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md transition-all active:scale-95"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={next} 
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md transition-all active:scale-95"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        <div className="w-full h-full flex items-center justify-center">
          {currentMedia.type === 'video' ? (
            isYoutube(currentMedia.url) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(currentMedia.url)}?autoplay=1`}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : isVimeo(currentMedia.url) ? (
              <iframe
                src={`https://player.vimeo.com/video/${currentMedia.url.split('/').pop()}?autoplay=1`}
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                src={currentMedia.url} 
                controls 
                autoPlay 
                className="max-h-full max-w-full object-contain"
              />
            )
          ) : (
            <OptimizedImage 
              src={currentMedia.url} 
              alt={`Gallery item ${currentIndex + 1}`} 
              className="max-h-full max-w-full"
              style={{ objectFit: 'contain' }}
            />
          )}
        </div>

        {/* Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-white font-bold text-sm">
          {currentIndex + 1} / {media.length}
        </div>
      </div>
    </div>,
    document.body
  );
};

interface ServiceLandingProps {
  serviceId: string;
  onBack: () => void;
  onGoToOffers?: () => void;
}

const ServiceLanding: React.FC<ServiceLandingProps> = ({ serviceId, onBack, onGoToOffers }) => {
  const { treatments, supplements, loading: servicesLoading } = useServices();
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [relatedBundles, setRelatedBundles] = useState<any[]>([]);
  const [suggestedBundles, setSuggestedBundles] = useState<any[]>([]);
  const [isHeroOfferOpen, setIsHeroOfferOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; initialIndex: number }>({ isOpen: false, initialIndex: 0 });

  useEffect(() => {
    fetchReviews();
    fetchRelatedBundles();
    fetchSuggestedBundles();
  }, [serviceId]);

  const fetchSuggestedBundles = async () => {
    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .limit(10);
    
    if (!error && data) {
      const filtered = data.filter((b: any) => b.product_id !== serviceId).slice(0, 4);
      setSuggestedBundles(filtered);
    }
  };

  const fetchRelatedBundles = async () => {
    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .eq('product_id', serviceId);
    
    if (!error && data) {
      setRelatedBundles(data);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('treatment_id', serviceId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setReviewsLoading(false);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const loading = servicesLoading;

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
          <OptimizedImage 
            src={service.imageUrl} 
            className="w-full h-full" 
            alt={service.title} 
            priority={true}
          />
          <div className="absolute inset-0 bg-emerald-950/80"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              Volver
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-medium transition-all"
            >
              {isCopied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
              {isCopied ? 'Enlace copiado' : 'Compartir'}
            </button>
          </div>

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
                  {formatPriceCOP(service.price)}
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
                {relatedBundles.length > 0 ? (
                  <button
                    onClick={() => setIsHeroOfferOpen(true)}
                    className="bg-emerald-100 hover:bg-white text-emerald-900 border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 shadow-xl shadow-emerald-100/10"
                  >
                    <Gift size={20} />
                    Ver Oferta Disponible
                  </button>
                ) : (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm"
                  >
                    Hablar con un Especialista
                  </a>
                )}
              </div>
            </div>

            {/* Galería Secundaria o Imagen Principal */}
            <div className="animate-scale-in">
              {(() => {
                const galleryItems: { url: string; type: 'image' | 'video' }[] = [
                  { url: service.imageUrl, type: 'image' },
                  ...(service.secondary_images || []).map((url: string) => ({ url, type: 'image' as const })),
                  ...(service.videos || []).map((url: string) => ({ url, type: 'video' as const }))
                ];

                const openGallery = (index: number) => {
                  setLightbox({ isOpen: true, initialIndex: index });
                };

                return (
                  <>
                    {service.secondary_images && service.secondary_images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className="col-span-2 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl aspect-[16/9] mb-2 cursor-pointer group hover:border-emerald-500/50 transition-all"
                          onClick={() => openGallery(0)}
                        >
                          <OptimizedImage 
                            src={service.imageUrl} 
                            alt={service.title} 
                            className="w-full h-full transition-transform duration-700 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white">
                               <ChevronRight size={32} />
                             </div>
                          </div>
                        </div>
                        
                        {/* Secondary Thumbnails */}
                        {galleryItems.slice(1, 3).map((item, i) => (
                          <div 
                            key={i} 
                            className="rounded-2xl overflow-hidden border border-white/10 shadow-xl aspect-square cursor-pointer group relative"
                            onClick={() => openGallery(i + 1)}
                          >
                            {item.type === 'video' ? (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                                <Play size={32} className="text-emerald-400 fill-emerald-400" />
                              </div>
                            ) : (
                              <OptimizedImage 
                                src={item.url} 
                                alt={`Gallery item ${i + 1}`} 
                                className="w-full h-full transition-transform duration-700 group-hover:scale-110" 
                              />
                            )}
                            {i === 1 && galleryItems.length > 3 && (
                              <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center text-white font-black text-xl">
                                +{galleryItems.length - 3}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div 
                        className="rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl aspect-square max-w-md mx-auto lg:ml-auto cursor-pointer group hover:border-emerald-500/50 transition-all relative"
                        onClick={() => openGallery(0)}
                      >
                        <OptimizedImage 
                          src={service.imageUrl} 
                          alt={service.title} 
                          className="w-full h-full transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white">
                               <ChevronRight size={32} />
                             </div>
                        </div>
                      </div>
                    )}

                    <GalleryLightbox 
                      isOpen={lightbox.isOpen} 
                      media={galleryItems} 
                      initialIndex={lightbox.initialIndex} 
                      onClose={() => setLightbox({ ...lightbox, isOpen: false })} 
                    />
                  </>
                );
              })()}
              
              {/* Star Rating Summary below images */}
              <div className="mt-6 flex items-center justify-center lg:justify-end gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-fit ml-auto">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      className={`w-5 h-5 ${s <= Math.round(reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 5) ? 'text-emerald-400 fill-emerald-400' : 'text-emerald-950 fill-emerald-950'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-emerald-400 font-bold">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}</span>
                <span className="text-emerald-200/60 text-sm">({reviews.length} opiniones)</span>
              </div>
            </div>
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

        {/* Ofertas Especiales (Venta Cruzada directa) movida bajo Detalles */}
        {relatedBundles.length > 0 && (
          <div className="mt-16 bg-emerald-50/60 p-8 md:p-12 rounded-[3rem] border border-emerald-100 shadow-xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-2">Promoción Especial Activa</h2>
              <h3 className="text-3xl font-bold text-slate-900 leading-tight">Aproveche esta oferta junto a su tratamiento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
              {relatedBundles.map(bundle => (
                  <div key={bundle.id} className="max-w-sm mx-auto w-full">
                      <BundleCard offer={bundle} isFashion={false} />
                  </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      <ReviewsSection 
        treatmentId={serviceId} 
        reviews={reviews} 
        onReviewAdded={fetchReviews} 
      />

      {/* Sugerencias de Paquetes Ofertados */}
      {suggestedBundles.length > 0 && (
        <div className="bg-slate-50 py-20 border-t border-slate-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Sugerencias Adicionales</h2>
                <h3 className="text-3xl font-bold text-slate-900 leading-tight">Productos o paquetes que te pueden interesar</h3>
              </div>
              {onGoToOffers && (
                <button onClick={onGoToOffers} className="text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-2 group">
                  Ver más paquetes <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-center">
               {suggestedBundles.map(bundle => (
                   <BundleCard key={bundle.id} offer={bundle} isFashion={false} />
               ))}
            </div>
          </div>
        </div>
      )}

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
                    <OptimizedImage 
                      src={sup.imageUrl} 
                      className="w-32 h-32 rounded-2xl shadow-lg" 
                      alt={sup.title} 
                      width={128}
                      height={128}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white">
                      +
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{sup.title}</h4>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-grow">{sup.description}</p>
                  <div className="pt-4 border-t border-slate-50 w-full mt-auto">
                    <p className="text-emerald-700 font-bold text-lg mb-4">{formatPriceCOP(sup.price)}</p>
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

      {relatedBundles.length > 0 && (
        <BundleModal 
          offer={relatedBundles[0]} 
          isFashion={false} 
          isOpen={isHeroOfferOpen} 
          onClose={() => setIsHeroOfferOpen(false)} 
        />
      )}
    </div>
  );
};

export default ServiceLanding;
