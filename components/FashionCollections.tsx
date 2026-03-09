
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../hooks/useTenant';
import { MOCK_PRODUCTS } from '../constants/mockData';

interface FashionCollectionsProps {
    onSelect: (id: string) => void;
}

const FashionCollections: React.FC<FashionCollectionsProps> = ({ onSelect }) => {
    const { tenant } = useTenant();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (tenant) {
            fetchProducts();
        }
    }, [tenant]);

    const fetchProducts = async () => {
        if (tenant?.id === 'preview-id') {
            setProducts(MOCK_PRODUCTS);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const { data, error } = await supabase
            .from('treatments')
            .select('*')
            .eq('company_id', tenant.id)
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (!error && data) setProducts(data);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="py-32 bg-white flex justify-center">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <section id="colecciones" className="py-32 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-4xl md:text-6xl font-serif text-slate-900 mb-6">
                            {tenant?.template_id === 'fashion-streetwear' ? 'Nuestro Inventario' : 'Nuestras Colecciones'}
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {tenant?.template_id === 'fashion-streetwear'
                                ? 'Prendas diseñadas para resistir el paso del tiempo y el uso rudo, sin perder el estilo.'
                                : 'Diseños pensados para cada momento de tu vida. Desde la comodidad del día a día hasta la elegancia de una noche inolvidable.'}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => onSelect(p.id)}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] mb-6 bg-slate-50">
                                {p.imageUrl ? (
                                    <img
                                        src={p.imageUrl}
                                        alt={p.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                        <Package size={64} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black -translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                                        <ArrowUpRight size={32} />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{p.title}</h3>
                            <p className="text-sm font-bold text-slate-400 capitalize tracking-widest">{p.category || 'Categoría'}</p>
                            <div className="mt-2 text-lg font-black text-slate-900">
                                ${Number(p.price).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FashionCollections;
