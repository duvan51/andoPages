import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../hooks/useTenant';
import { Tag, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { MOCK_OFFERS } from '../constants/mockData';

interface Bundle {
    id: string;
    title: string;
    description: string;
    bundle_price: string;
    original_total?: string;
    imageUrl?: string;
    expiry_date?: string;
}

const SpecialOffers: React.FC = () => {
    const { tenant } = useTenant();
    const [offers, setOffers] = useState<Bundle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (tenant) {
            fetchOffers();
        }
    }, [tenant]);

    const fetchOffers = async () => {
        if (tenant?.id === 'preview-id') {
            setOffers(MOCK_OFFERS);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const { data, error } = await supabase
            .from('bundles')
            .select('*')
            .eq('company_id', tenant.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOffers(data);
        }
        setIsLoading(false);
    };

    if (isLoading || offers.length === 0) return null;

    const isFashion = tenant?.business_type === 'fashion';

    return (
        <section id="ofertas" className={`py-24 ${isFashion ? 'bg-slate-50' : 'bg-emerald-50/30'}`}>
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className={isFashion ? 'text-slate-900' : 'text-emerald-600'} size={20} />
                            <span className={`text-sm font-black uppercase tracking-[0.2em] ${isFashion ? 'text-slate-500' : 'text-emerald-600'}`}>
                                Promociones Exclusivas
                            </span>
                        </div>
                        <h2 className={`text-4xl md:text-5xl font-black leading-tight ${isFashion ? 'font-serif text-slate-900' : 'text-slate-900'}`}>
                            {isFashion ? 'Ofertas de Temporada' : 'Paquetes de Bienestar'}
                        </h2>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {offers.map((offer) => (
                        <div
                            key={offer.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Offer Image */}
                            {offer.imageUrl && (
                                <div className="md:w-1/3 relative shrink-0 overflow-hidden h-48 md:h-auto border-b md:border-b-0 md:border-r border-slate-100">
                                    <img
                                        src={offer.imageUrl}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={offer.title}
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-white via-transparent to-transparent opacity-100 md:opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                </div>
                            )}

                            {/* Decorative accent */}
                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-150 ${isFashion ? 'bg-slate-900' : 'bg-emerald-600'}`}></div>

                            <div className="relative z-10 flex flex-col h-full flex-grow p-8 md:p-12">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`p-4 rounded-2xl ${isFashion ? 'bg-slate-100 text-slate-900' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <Tag size={28} />
                                    </div>
                                    {offer.expiry_date && (
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                                            <Clock size={12} />
                                            <span>Expira: {new Date(offer.expiry_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow">
                                    <h3 className={`text-3xl font-black mb-4 leading-tight ${isFashion ? 'font-serif' : ''}`}>{offer.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                        {offer.description}
                                    </p>
                                </div>

                                <div className="flex items-end justify-between pt-8 border-t border-slate-50 mt-auto">
                                    <div>
                                        <div className="flex items-baseline gap-3">
                                            <span className={`text-4xl font-black ${isFashion ? 'text-slate-900' : 'text-emerald-600'}`}>
                                                ${Number(offer.bundle_price).toLocaleString()}
                                            </span>
                                            {offer.original_total && (
                                                <span className="text-lg font-bold text-slate-300 line-through">
                                                    ${Number(offer.original_total).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Precio por tiempo limitado</p>
                                    </div>
                                    <button
                                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all active:scale-95 ${isFashion
                                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/20'
                                            }`}
                                    >
                                        Adquirir <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SpecialOffers;
