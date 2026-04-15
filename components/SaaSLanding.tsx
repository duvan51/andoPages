
import React from 'react';
import { 
    Globe, 
    ShieldCheck, 
    Zap, 
    BarChart, 
    Layout, 
    ArrowRight, 
    CheckCircle2, 
    Users, 
    Smartphone, 
    Rocket,
    Clock,
    Star
} from 'lucide-react';
import SaaSHeader from './SaaSHeader';

interface SaaSLandingProps {
    onLoginClick: () => void;
}

const SaaSLanding: React.FC<SaaSLandingProps> = ({ onLoginClick }) => {
    return (
        <div className="bg-white selection:bg-emerald-100 selection:text-emerald-900">
            <SaaSHeader onLoginClick={onLoginClick} />

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 overflow-hidden bg-mesh">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-emerald-50/30 rounded-full blur-[120px] -z-10 -mt-[400px]"></div>

                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider mb-10 animate-fade-in border border-emerald-200/50">
                            <Rocket size={14} /> La Plataforma N°1 para Clínicas y MedSpas
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.95] mb-8 animate-slide-up">
                            Diseña tu clínica <br />
                            <span className="text-emerald-600">en tiempo récord</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium mb-12 animate-slide-up delay-100 leading-relaxed">
                            AndoPages es el sistema operativo visual para clínicas modernas. Gestiona sedes, servicios y ofertas con una web que enamora a tus pacientes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up delay-200">
                            <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-900/30 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg group">
                                Crear mi Web Gratis
                                <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />
                            </button>
                            <button
                                onClick={onLoginClick}
                                className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 font-black rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2 text-lg"
                            >
                                Acceso Admin
                            </button>
                        </div>
                    </div>

                    {/* Mockup Preview - Dashboard Moderno */}
                    <div className="mt-24 relative animate-float transition-all group">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] -z-10 group-hover:bg-emerald-500/20 transition-colors"></div>
                        <div className="p-2 sm:p-4 bg-slate-200/50 rounded-[3rem] border border-white backdrop-blur shadow-[0_0_50px_rgba(0,0,0,0.05)]">
                            <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[16/10] sm:aspect-[16/8] flex flex-col">
                                {/* Dashboard UI Mockup */}
                                <div className="h-12 border-b border-slate-800 flex items-center px-6 gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                    </div>
                                    <div className="flex-grow flex justify-center">
                                        <div className="bg-slate-800 rounded-md px-4 py-1 flex items-center gap-2">
                                            <Globe size={12} className="text-slate-500" />
                                            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">tu-clinica.andopages.com</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-grow flex p-6 gap-6">
                                    <div className="w-48 hidden lg:flex flex-col gap-3">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className={`h-10 rounded-xl ${i === 1 ? 'bg-emerald-600' : 'bg-slate-800/50'} flex items-center px-4 gap-3`}>
                                                <div className={`w-4 h-4 rounded ${i === 1 ? 'bg-white/20' : 'bg-slate-700'}`}></div>
                                                <div className={`h-2.5 rounded-full ${i === 1 ? 'bg-white/40' : 'bg-slate-700'} ${i % 2 === 0 ? 'w-20' : 'w-12'}`}></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-grow grid grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1,2,3,4,5,6].map(i => (
                                            <div key={i} className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 flex flex-col justify-between">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                                                        <Zap size={18} className="text-emerald-400" />
                                                    </div>
                                                    <div className="h-6 w-12 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full flex items-center justify-center">+24%</div>
                                                </div>
                                                <div>
                                                    <div className="h-3 w-20 bg-slate-700 rounded-full mb-2"></div>
                                                    <div className="h-2 w-12 bg-slate-800 rounded-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof Marks - Marquee */}
            <div className="py-20 border-y border-slate-50 overflow-hidden bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Confiado por clínicas líderes</p>
                </div>
                <div className="flex gap-20 animate-scroll whitespace-nowrap">
                    {[1, 2, 1, 2].map((_, idx) => (
                        <div key={idx} className="flex gap-20 items-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                            <span className="text-2xl font-black tracking-tighter text-slate-900 border-2 border-slate-900 px-4 py-1 rounded-sm">CLINIC NOVA</span>
                            <span className="text-2xl font-black italic tracking-tight text-slate-900">Estética Vital</span>
                            <span className="text-2xl font-serif text-slate-800">MedSkin Hub</span>
                            <span className="text-3xl font-black uppercase text-slate-900 tracking-widest underline decoration-emerald-500 underline-offset-8">BioAge</span>
                            <span className="text-2xl font-bold font-mono text-slate-900 px-6 bg-slate-200">LUX•MED</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <section id="features" className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24 max-w-3xl mx-auto">
                        <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Todo lo que necesitas <br /> para escalar tu negocio</h2>
                        <p className="text-lg font-medium text-slate-500 leading-relaxed">
                            Hemos eliminado la fricción tecnológica para que te enfoques en lo que mejor haces: cuidar a tus pacientes y crecer tu marca.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 hover:-translate-y-2 transition-all duration-500">
                                <div className={`w-16 h-16 bg-slate-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-sm`}>
                                    <f.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-6">{f.title}</h3>
                                <p className="text-lg text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-32 bg-slate-900 text-white rounded-[4rem] mx-4 sm:mx-8 mb-32 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
                <div className="max-w-7xl mx-auto px-10 relative z-10">
                    <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-8">
                        <div>
                            <h2 className="text-5xl font-black mb-6 tracking-tight">Tu presencia digital <br /><span className="text-emerald-400">lista en 3 pasos</span></h2>
                            <p className="text-slate-400 text-lg font-medium">Sin programadores, sin esperas, sin complicaciones.</p>
                        </div>
                        <button className="px-8 py-4 bg-emerald-500 text-slate-900 font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-white transition-all">
                            Empezar ahora
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Crea tu Cuenta', desc: 'Regístrate y personaliza tu dominio en segundos. Elige tus colores de marca.' },
                            { step: '02', title: 'Carga tus Sedes', desc: 'Añade tus servicios, especialistas y ofertas especiales desde un panel intuitivo.' },
                            { step: '03', title: 'Lanza y Vende', desc: 'Tu web optimizada para móviles ya está en línea esperando a tus pacientes.' }
                        ].map((s, i) => (
                            <div key={i} className="relative pt-12">
                                <span className="absolute top-0 left-0 text-7xl font-black text-slate-800 select-none">{s.step}</span>
                                <h4 className="text-2xl font-black relative mb-4">{s.title}</h4>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Lo que dicen <br /> nuestros líderes</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Empoderando dueños de clínicas en todo el mundo</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-slate-50 p-10 rounded-[3rem] relative border border-slate-100 italic">
                                <div className="flex text-emerald-500 mb-6 gap-1">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-slate-700 text-lg leading-relaxed font-medium mb-10">"{t.content}"</p>
                                <div className="flex items-center gap-4 not-italic">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-emerald-600 border border-slate-200 shadow-sm">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <h5 className="font-black text-slate-900">{t.name}</h5>
                                        <p className="text-sm text-slate-500 font-bold">{t.role} - <span className="text-emerald-600">{t.clinic}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing / Ready to start */}
            <section id="pricing" className="py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tight">Planes para cada etapa</h2>
                    <p className="text-xl text-slate-500 font-medium mb-16 max-w-2xl mx-auto">
                        Soluciones adaptadas al tamaño de tu negocio, desde clínicas independientes hasta franquicias internacionales.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            { name: 'Basic', features: ['1 Sede', 'Hasta 10 Servicios', 'Landing de Ofertas', 'Soporte vía Email'] },
                            { name: 'Professional', features: ['Hasta 3 Sedes', 'Servicios Ilimitados', 'Landing Pages Pro', 'Dominio Personalizado', 'Soporte Prioritario'], highlight: true },
                            { name: 'Enterprise', features: ['Sedes Ilimitadas', 'Gestión de Franquicias', 'Analíticas Avanzadas', 'API de Integración', 'Account Manager Dedicado'] }
                        ].map((plan, i) => (
                            <div key={i} className={`p-12 rounded-[3.5rem] flex flex-col items-start text-left transition-all ${
                                plan.highlight 
                                    ? 'bg-slate-900 text-white shadow-2xl scale-105 relative z-10' 
                                    : 'bg-white border border-slate-200'
                            }`}>
                                <h4 className={`text-2xl font-black mb-6 ${plan.highlight ? 'text-emerald-400' : 'text-slate-900'}`}>{plan.name}</h4>
                                <ul className="space-y-4 mb-12 flex-grow">
                                    {plan.features.map((f, idx) => (
                                        <li key={idx} className="flex items-center gap-3 font-bold text-sm">
                                            <CheckCircle2 size={18} className={plan.highlight ? 'text-emerald-400' : 'text-emerald-500'} />
                                            <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-5 rounded-2xl font-black transition-all ${
                                    plan.highlight 
                                        ? 'bg-emerald-500 text-slate-900 hover:bg-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white'
                                }`}>
                                    Consultar Plan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer SaaS */}
            <footer className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between gap-16 mb-20">
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl">A</div>
                                <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">AndoPages</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                Elevando el estándar digital para la industria de la salud y el bienestar.
                            </p>
                            <div className="flex gap-4">
                                {[1,2,3].map(i => <div key={i} className="w-10 h-10 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-100 flex items-center justify-center"><Globe size={18} className="text-slate-400" /></div>)}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 flex-grow">
                            <div>
                                <h6 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-xs">Producto</h6>
                                <ul className="space-y-4">
                                    {['Características', 'Mockups', 'Seguridad', 'Versión Móvil'].map(item => (
                                        <li key={item}><a href="#" className="text-slate-500 font-bold hover:text-emerald-600 transition-colors text-sm">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h6 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-xs">Empresa</h6>
                                <ul className="space-y-4">
                                    {['Nosotros', 'Testimonios', 'Blog', 'Carreras'].map(item => (
                                        <li key={item}><a href="#" className="text-slate-500 font-bold hover:text-emerald-600 transition-colors text-sm">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h6 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-xs">Soporte</h6>
                                <ul className="space-y-4">
                                    {['Centro Ayuda', 'Documentación', 'Estado API', 'Contacto'].map(item => (
                                        <li key={item}><a href="#" className="text-slate-500 font-bold hover:text-emerald-600 transition-colors text-sm">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-slate-100 flex flex-col md:row items-center justify-between gap-6">
                        <p className="text-slate-400 text-sm font-bold">© 2026 AndoPages SaaS. Hecho con pasión por el crecimiento saludable.</p>
                        <div className="flex gap-8 text-sm font-bold text-slate-400">
                            <a href="#" className="hover:text-slate-900 transition-colors">Privacidad</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Términos</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const features = [
    {
        title: "Multi-Sede Inteligente",
        desc: "Gestiona múltiples ubicaciones físicas desde un solo panel. Horarios, cupos y personal sincronizado en tiempo real.",
        icon: Users
    },
    {
        title: "Landing Pages de Alta Conversión",
        desc: "Lanza campañas de ofertas especiales en minutos con nuestro constructor optimizado visualmente para vender más.",
        icon: Layout
    },
    {
        title: "Analíticas Exclusivas",
        desc: "Visualiza el rendimiento real de tu negocio con KPIs diseñados específicamente para el sector médico y estético.",
        icon: BarChart
    },
    {
        title: "Control móvil total",
        desc: "Tu dashboard administrativo se adapta perfectamente a tu smartphone para que siempre tengas el control de tu clínica.",
        icon: Smartphone
    },
    {
        title: "Infraestructura Cloud",
        desc: "Basado en AWS y Supabase para garantizar la máxima velocidad y seguridad de los datos de tu empresa.",
        icon: ShieldCheck
    },
    {
        title: "Dominios Propios",
        desc: "Conecta tu propio dominio (.com, .com.co, etc) con certificados SSL automáticos y gratuitos en cada landing.",
        icon: Globe
    }
];

const testimonials = [
    {
        name: "Dra. Elena Rivas",
        role: "Directora Médica",
        clinic: "Clinic Nova",
        content: "Desde que usamos AndoPages, aumentamos nuestras reservas directas en un 40%. La facilidad para crear landings de ofertas es increíble."
    },
    {
        name: "Arnaldo Pérez",
        role: "CEO & Fundador",
        clinic: "Estética Vital",
        content: "Gestionar nuestras 3 sedes era un caos hasta que llegó Ando. Ahora todo está centralizado y luce espectacular."
    },
    {
        name: "Dra. Sofía Castro",
        role: "Head of Esthetics",
        clinic: "MedSkin Hub",
        content: "Lo mejor es que todo funciona perfecto en el móvil. Administro mi clínica desde el celular mientras viajo con total seguridad."
    }
];

export default SaaSLanding;
