
import React from 'react';
import { useTenant } from '../hooks/useTenant';
import OptimizedImage from './shared/OptimizedImage';

const FashionCollage: React.FC = () => {
    const { tenant } = useTenant();
    const config = (tenant as any)?.config?.collage || {};
    
    // Default images if none configured
    const defaultImages = [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1539109139745-f6011a277370?q=80&w=1974&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2074&auto=format&fit=crop"
    ];

    const images = defaultImages.map((def, i) => config.images?.[i] || def);
    const title = config.title || "L'Art de Vive";
    const subtitle = config.subtitle || "Nuestra Inspiración";

    if (config.enabled === false) return null;

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block animate-fade-in">
                        {subtitle}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight">
                        {title}
                    </h2>
                </div>

                {/* Luxury Masonry Collage */}
                <div className="grid grid-cols-12 gap-4 md:gap-6 h-[600px] md:h-[800px]">
                    {/* Item 1: Main Large */}
                    <div className="col-span-12 md:col-span-6 h-full group relative overflow-hidden rounded-[2rem]">
                        <OptimizedImage 
                            src={images[0]} 
                            alt="Fashion focus 1"
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-center gap-4">
                            {config.labels?.[0] && (
                                <p className="text-white text-2xl font-serif text-center px-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {config.labels[0]}
                                </p>
                            )}
                            <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] border border-white/40 px-6 py-3 backdrop-blur-md rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
                                Ver Detalles
                            </span>
                        </div>
                    </div>

                    {/* Right Column Grid */}
                    <div className="hidden md:grid col-span-6 grid-rows-2 gap-6 h-full">
                        <div className="grid grid-cols-2 gap-6">
                             {/* Item 2 */}
                             <div className="h-full group relative overflow-hidden rounded-[2rem]">
                                <OptimizedImage src={images[1]} alt="Fashion focus 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                {config.labels?.[1] && (
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-serif">{config.labels[1]}</p>
                                    </div>
                                )}
                             </div>
                             {/* Item 3 */}
                             <div className="h-full group relative overflow-hidden rounded-[2rem]">
                                <OptimizedImage src={images[2]} alt="Fashion focus 3" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                {config.labels?.[2] && (
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-serif">{config.labels[2]}</p>
                                    </div>
                                )}
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-12 gap-6 h-full">
                            {/* Item 4 */}
                            <div className="col-span-7 h-full group relative overflow-hidden rounded-[2rem]">
                                <OptimizedImage src={images[3]} alt="Fashion focus 4" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                {config.labels?.[3] && (
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-serif">{config.labels[3]}</p>
                                    </div>
                                )}
                            </div>
                            {/* Item 5 */}
                            <div className="col-span-5 h-full group relative overflow-hidden rounded-[2rem] bg-slate-50 flex items-center justify-center p-8">
                                <OptimizedImage src={images[4]} alt="Fashion focus 5" className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 group-hover:opacity-40" />
                                <div className="relative z-10 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">Colección</p>
                                    <p className="text-xl font-serif text-slate-900">{config.labels?.[4] || "Summer '24"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FashionCollage;
