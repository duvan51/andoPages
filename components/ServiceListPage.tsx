
import React from 'react';
import { ELITE_SERVICES } from '../constants/services';

interface ServiceListPageProps {
    onServiceSelect: (id: string) => void;
    onBack: () => void;
}

const ServiceListPage: React.FC<ServiceListPageProps> = ({ onServiceSelect, onBack }) => {
    return (
        <div className="pt-24 pb-20 animate-fade-in">
            {/* Hero Section */}
            <div className="bg-emerald-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-20"></div>
                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-emerald-400 font-bold mb-8 hover:text-emerald-300 transition-colors mx-auto"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Volver al inicio
                    </button>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Nuestros Servicios</h1>
                    <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto">
                        Descubra nuestro portafolio completo de medicina alternativa y tratamientos de vanguardia para su bienestar integral.
                    </p>
                </div>
            </div>

            {/* Services List Grid */}
            <div className="container mx-auto px-4 md:px-6 py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ELITE_SERVICES.map((service) => (
                        <div
                            key={service.id}
                            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                        >
                            <div className="relative h-60 overflow-hidden">
                                <img
                                    src={service.imageUrl}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4">
                                    <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 backdrop-blur-sm shadow-lg text-emerald-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-emerald-600/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                        {service.subtitle}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-grow">
                                <h4 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h4>
                                <p className="text-slate-500 mb-8 leading-relaxed flex-grow">
                                    {service.heroDescription}
                                </p>
                                <button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                                    onClick={() => onServiceSelect(service.id)}
                                >
                                    Ver Detalles y Beneficios
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Section Mini */}
            <div className="bg-slate-50 py-20">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12">¿Por qué confiar en PROMEDID?</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        {[
                            { title: "Tecnología Médica", desc: "Equipos de última generación para diagnósticos precisos." },
                            { title: "Atención Humana", desc: "Médicos comprometidos con su salud y bienestar emocional." },
                            { title: "Resultados Reales", desc: "Miles de pacientes han recuperado su vitalidad con nosotros." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-6 font-bold text-xl">{i + 1}</div>
                                <h4 className="text-xl font-bold text-emerald-950 mb-3">{item.title}</h4>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceListPage;
