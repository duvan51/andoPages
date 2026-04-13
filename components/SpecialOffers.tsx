import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../hooks/useTenant';
import { Tag, Clock, ArrowRight, Sparkles } from 'lucide-react';
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

interface SpecialOffersProps {
    onServiceSelect?: (id: string) => void;
}

const SpecialOffers: React.FC<SpecialOffersProps> = ({ onServiceSelect }) => {
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
            </div>
        </section>
    );
};

export default SpecialOffers;
