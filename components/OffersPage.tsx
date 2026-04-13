import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../hooks/useTenant';
import { Tag, Clock, ArrowRight, ArrowLeft, Sparkles, PackageSearch } from 'lucide-react';
import { MOCK_OFFERS } from '../constants/mockData';
import { formatPriceCOP } from '../utils/format';
import BundleCard from './shared/BundleCard';

interface Bundle {
    id: string;
    title: string;
    description: string;
    bundle_price: string;
    original_total?: string;
    imageUrl?: string;
    expiry_date?: string;
    product_id?: string;
}

interface OffersPageProps {
    onBack: () => void;
    onServiceSelect?: (id: string) => void;
}

const OffersPage: React.FC<OffersPageProps> = ({ onBack, onServiceSelect }) => {
    const { tenant } = useTenant();
    const [offers, setOffers] = useState<Bundle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
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

    const isFashion = tenant?.business_type === 'fashion';

    return (
        <div className={`min-h-screen pt-24 pb-20 ${isFashion ? 'bg-slate-50' : 'bg-slate-50'}`}>
            <div className="container mx-auto px-6">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold mb-8 group"
                >
                    <div className="p-2 bg-white rounded-full group-hover:bg-emerald-50 transition-colors border border-slate-100 group-hover:border-emerald-100">
                        <ArrowLeft size={16} />
                    </div>
                    Volver al inicio
                </button>

                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className={isFashion ? 'text-slate-900' : 'text-emerald-600'} size={20} />
                            <span className={`text-sm font-black uppercase tracking-[0.2em] ${isFashion ? 'text-slate-500' : 'text-emerald-600'}`}>
                                Catálogo Completo
                            </span>
                        </div>
                        <h1 className={`text-4xl md:text-6xl font-black leading-tight ${isFashion ? 'font-serif text-slate-900' : 'text-slate-900'}`}>
                            {isFashion ? 'Todas Nuestras Promociones' : 'Explora Nuestros Paquetes'}
                        </h1>
                        <p className="text-slate-500 font-medium text-lg mt-6 max-w-xl">
                            Hemos diseñado estas combinaciones exclusivas pensadas en obtener los mejores resultados al mejor costo.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => <div key={i} className="h-96 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)}
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
                        <Tag size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No hay paquetes disponibles</h3>
                        <p className="text-slate-500">Pronto agregaremos nuevas ofertas especiales para ti.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {offers.map((offer) => (
                            <BundleCard 
                                key={offer.id} 
                                offer={offer} 
                                isFashion={isFashion} 
                                onServiceSelect={onServiceSelect} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffersPage;
