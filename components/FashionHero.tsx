
import React from 'react';
import { ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { useTenant } from '../hooks/useTenant';

interface FashionHeroProps {
    onShopClick: () => void;
}

const FashionHero: React.FC<FashionHeroProps> = ({ onShopClick }) => {
    const { tenant } = useTenant();
    const config = (tenant as any)?.config?.hero || {};

    return (
        <div className="relative min-h-screen flex items-center bg-[#faf9f6] pt-20 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f3f0e8] -skew-x-6 transform translate-x-1/4"></div>

            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-10 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        <Star size={12} className="fill-current text-white" /> {config.subtitle || 'Nueva Colección 2026'}
                    </div>

                    <h1 className="text-6xl md:text-8xl font-serif text-slate-900 leading-[1.1] tracking-tight">
                        {config.title ? (
                            config.title
                        ) : (
                            <>
                                {tenant?.name || 'Moda'} que <br />
                                <span className="italic text-slate-500">define tu esencia</span>
                            </>
                        )}
                    </h1>

                    <p className="text-lg text-slate-500 max-w-md font-medium leading-relaxed">
                        {config.description || 'Explora nuestra curaduría exclusiva de prendas de alta calidad, diseñadas para quienes buscan distinción, durabilidad y estilo superior.'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <button
                            onClick={onShopClick}
                            className="group px-10 py-5 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-all flex items-center gap-3 shadow-2xl shadow-slate-900/20"
                        >
                            {config.buttonText || 'Explorar Colección'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                            <div className="text-left">
                                <p className="text-2xl font-black text-slate-900 leading-none">Nueva</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Llegada Semanal</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="relative z-10 animate-float">
                        <img
                            src={config.imageUrl || (tenant?.slug === 'camisas-crist'
                                ? "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1000"
                                : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000"
                            )}
                            alt="Fashion Collection"
                            className="w-full h-auto rounded-[4rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
                        />
                        {/* Interactive Tag */}
                        <div className="absolute top-20 -left-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl animate-bounce-slow border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Destacado</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {tenant?.slug === 'camisas-crist' ? 'Camisa Heavy Oxford' : 'Vestido Gala Silk'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Decorative Pattern */}
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-slate-200/50 rounded-full blur-3xl -z-10"></div>
                </div>
            </div>

            {/* Side Label */}
            <div className="absolute left-10 bottom-20 vertical-text hidden xl:block">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">{tenant?.name || 'Moda'} • Premium Quality</span>
            </div>
        </div>
    );
};

export default FashionHero;
