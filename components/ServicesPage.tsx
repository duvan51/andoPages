
import React, { useState, useEffect } from 'react';
import { getWhatsAppLeadUrl } from '../utils/whatsapp';
import { useServices } from '../hooks/useServices';
import { useTenant } from '../hooks/useTenant';
import { supabase } from '../lib/supabase';

interface ServicesPageProps {
    onServiceSelect: (id: string) => void;
    onBack: () => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onServiceSelect, onBack }) => {
    const { tenant } = useTenant();
    const { treatments, loading: servicesLoading } = useServices();
    const [activeCategory, setActiveCategory] = useState<string>('Todos');
    const [categories, setCategories] = useState<string[]>(['Todos']);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const isFashion = tenant?.business_type === 'fashion';
    const primaryColor = isFashion ? 'slate-900' : 'emerald-600';

    useEffect(() => {
        if (tenant) {
            fetchCategories();
        }
    }, [tenant]);

    const fetchCategories = async () => {
        setIsLoadingCategories(true);
        const { data, error } = await supabase
            .from('categories')
            .select('name')
            .eq('company_id', tenant?.id);

        if (!error && data) {
            const catNames = data.map(c => c.name);
            setCategories(['Todos', ...catNames]);
        }
        setIsLoadingCategories(false);
    };

    const filteredTreatments = activeCategory === 'Todos'
        ? treatments
        : treatments.filter(t => t.category === activeCategory);

    if (servicesLoading || isLoadingCategories) {
        return (
            <div className="pt-40 pb-20 flex flex-col items-center justify-center min-h-screen">
                <div className={`w-16 h-16 border-4 border-${isFashion ? 'slate-900' : 'emerald-600'} border-t-transparent rounded-full animate-spin mb-4`}></div>
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 animate-fade-in bg-slate-50 min-h-screen">
            {/* Hero Header */}
            <div className="bg-white border-b border-slate-200 py-16 mb-12 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-1/2 h-full bg-${isFashion ? 'slate-50' : 'emerald-50'}/50 -skew-x-12 transform translate-x-1/4`}></div>
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <button
                        onClick={onBack}
                        className={`flex items-center gap-2 text-${primaryColor} font-bold mb-6 hover:opacity-80 transition-all`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Volver al inicio
                    </button>
                    <div className="max-w-4xl">
                        <h1 className={`text-4xl md:text-6xl font-bold text-slate-900 mb-6 ${isFashion ? 'font-serif' : ''}`}>
                            {isFashion ? 'Nuestras Colecciones' : 'Nuestros Servicios'}
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed mb-4">
                            {isFashion
                                ? 'Explora nuestra selección exclusiva de prendas diseñadas para resaltar tu estilo único.'
                                : 'Descubra nuestras soluciones integrales para su salud. Combinamos medicina alternativa con tecnología de vanguardia.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6">
                {/* Categories Bar */}
                <div className="flex flex-wrap gap-2 mb-12 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                                ? `bg-${isFashion ? 'slate-900' : 'emerald-600'} text-white shadow-lg`
                                : 'bg-transparent text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Categories Headers specifically for Sueroterapia (Only for Medical) */}
                {!isFashion && activeCategory === 'Sueroterapia' && (
                    <div className="mb-10 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-emerald-800 font-bold">✨ Nota Especial Sueroterapia:</p>
                        <p className="text-emerald-700 mt-1">Todos los sueros individuales cuestan entre $190.000 - $210.000. ¡Pregunte por nuestro <span className="underline font-bold">Paquete x4 por solo $680.000</span>!</p>
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTreatments.map((treatment) => (
                        <div
                            key={treatment.id}
                            className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col h-full"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-square overflow-hidden bg-slate-100">
                                <img
                                    src={treatment.imageUrl}
                                    alt={treatment.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                    <span className="bg-white/90 backdrop-blur-sm text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 shadow-sm">
                                        {treatment.tag}
                                    </span>
                                    {treatment.price && (
                                        <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                            {treatment.price}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-1">{treatment.subtitle}</p>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">{treatment.title}</h3>
                                </div>

                                <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-grow line-clamp-3">
                                    {treatment.description}
                                </p>

                                {treatment.packagePrice && (
                                    <div className="mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Ahorro Garantizado</p>
                                        <p className="text-xs font-bold text-emerald-700">{treatment.packagePrice}</p>
                                    </div>
                                )}

                                {treatment.notes && (
                                    <div className="mb-4 flex gap-2 items-start">
                                        <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-[10px] font-bold flex-shrink-0">!</div>
                                        <p className="text-[10px] text-slate-400 italic leading-tight">{treatment.notes}</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-50 mt-auto">
                                    <button
                                        onClick={() => onServiceSelect(treatment.id)}
                                        className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                                    >
                                        Ver Detalles
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredTreatments.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-500 text-lg">No se encontraron servicios en esta categoría.</p>
                        <button onClick={() => setActiveCategory('Todos')} className="text-emerald-600 font-bold mt-4 hover:underline">Ver todos los servicios</button>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div className="container mx-auto px-4 md:px-6 pt-20">
                <div className="bg-emerald-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="absolute inset-0 bg-pattern opacity-10"></div>
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-3xl font-bold mb-4">¿Busca un tratamiento personalizado?</h2>
                        <p className="text-emerald-50 text-lg opacity-90">Contamos con más de 15 años de experiencia diseñando planes de salud a medida para cada paciente.</p>
                    </div>
                    <div className="relative z-10">
                        <a
                            href={getWhatsAppLeadUrl({ customMessage: "Consulta General" })}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-block bg-white text-${isFashion ? 'slate-900' : 'emerald-700'} px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all shadow-xl`}
                        >
                            Consultar con Especialista
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
