
import React from 'react';
import { Globe, ShieldCheck, Zap, BarChart, Layout, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SaaSLandingProps {
    onLoginClick: () => void;
}

const SaaSLanding: React.FC<SaaSLandingProps> = ({ onLoginClick }) => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-emerald-50/50 rounded-full blur-3xl -z-10 -mt-96"></div>

                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider mb-8 animate-fade-in">
                        <Zap size={14} /> La Plataforma N°1 para Clínicas y MedSpas
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8 animate-slide-up">
                        Crea la web de tu clínica <br />
                        <span className="text-emerald-600">en cuestión de minutos</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium mb-12 animate-slide-up delay-100">
                        La herramienta todo-en-uno para gestionar tus sedes, servicios, ofertas y vender más con landing pages de alto impacto.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
                        <button className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2">
                            Empieza Gratis ahora <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={onLoginClick}
                            className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-2"
                        >
                            Acceso Admin
                        </button>
                    </div>

                    {/* Mockup Preview */}
                    <div className="mt-20 relative p-4 bg-slate-100 rounded-[3rem] border border-slate-200 shadow-2xl animate-float">
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm aspect-[16/9] flex items-center justify-center text-slate-300">
                            <Layout size={80} strokeWidth={1} />
                            <p className="absolute bottom-10 font-bold uppercase tracking-widest text-[10px]">Preview de tu Dashboard Shopify-Style</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Todo lo que necesitas para crecer</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Escalabilidad total para tu negocio médico</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                                <div className={`w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors`}>
                                    <f.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trusted Domains Section */}
            <div className="py-24 border-t border-slate-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">
                                Tu marca, <br /> tu propio dominio
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    'Usa subdominios gratuitos .promedid.com',
                                    'Conecta dominios propios .com, .es, .co',
                                    'Certificado SSL automático y gratuito',
                                    'Infraestructura optimizada en AWS/Supabase'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-bold text-slate-600">
                                        <CheckCircle2 className="text-emerald-500" size={20} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="w-full bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                </div>
                                <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
                                    <span className="text-emerald-400 font-mono text-sm">https://www.tu-clinica-medica.com</span>
                                    <Globe size={18} className="text-slate-400" />
                                </div>
                                <div className="mt-8 space-y-4">
                                    <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse delay-75"></div>
                                    <div className="h-4 w-5/6 bg-slate-700 rounded animate-pulse delay-150"></div>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer SaaS */}
            <footer className="py-12 bg-slate-950 text-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-bold">P</div>
                        <span className="font-black text-xl tracking-tighter uppercase">Promedid</span>
                    </div>
                    <p className="text-slate-500 text-sm font-bold">© 2026 Promedid SaaS. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

const features = [
    {
        title: "Multi-Sede Inteligente",
        desc: "Gestiona múltiples ubicaciones físicas desde un solo panel. Horarios, cupos y personal sincronizado.",
        icon: ShieldCheck
    },
    {
        title: "Landing Pages de Venta",
        desc: "Crea páginas de ofertas especiales en segundos con nuestro constructor optimizado para conversión.",
        icon: Layout
    },
    {
        title: "Analíticas de Avanzada",
        desc: "Visualiza el rendimiento de tus sedes y servicios con gráficos intuitivos y KPIs financieros.",
        icon: BarChart
    },
    {
        title: "Biblioteca Media Cloud",
        desc: "Sube imágenes y videos de tus tratamientos una sola vez y úsalos en todas tus landings.",
        icon: Globe
    },
    {
        title: "Diseño Shopify-Style",
        desc: "Una experiencia de administración elegante, rápida y 100% responsive para que gestiones desde el móvil.",
        icon: Zap
    },
    {
        title: "Dominio Personalizado",
        desc: "Conecta tu propio dominio comprado en cualquier registrador con un solo clic.",
        icon: Globe
    }
];

export default SaaSLanding;
