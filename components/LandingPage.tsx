import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import ContactFormV2 from './ContactFormV2';

interface LandingPageProps {
    slug?: string;
    previewData?: any;
    isMobilePreview?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ slug, previewData, isMobilePreview }) => {
    const [fetchedLanding, setFetchedLanding] = useState<any>(null);
    const landing = previewData || fetchedLanding;

    const [ctaItem, setCtaItem] = useState<any>(null);
    const [loading, setLoading] = useState(!previewData);
    const [isScrolled, setIsScrolled] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [sessionId] = useState(() => {
        if (typeof window === 'undefined') return '';
        let sid = sessionStorage.getItem('promedid_sid');
        if (!sid) {
            sid = 'sid_' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('promedid_sid', sid);
        }
        return sid;
    });

    const trackEvent = async (type: string, name?: string, metadata: any = {}) => {
        if (previewData) return; // Don't track previews
        try {
            await supabase.from('analytics_events').insert({
                landing_id: slug || landing?.slug,
                event_type: type,
                event_name: name,
                session_id: sessionId,
                metadata: {
                    ...metadata,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                }
            });
        } catch (err) {
            console.error('Analytics error:', err);
        }
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

        // Track Page View
        if (landing?.slug || slug) {
            trackEvent('view');
        }

        // Track Session End
        const startTime = Date.now();
        const handleBeforeUnload = () => {
            const duration = Math.round((Date.now() - startTime) / 1000);
            const data = JSON.stringify({
                landing_id: slug || landing?.slug,
                event_type: 'session_end',
                session_id: sessionId,
                metadata: { duration_seconds: duration }
            });
            // Use sendBeacon for reliable tracking on exit
            const blob = new Blob([data], { type: 'application/json' });
            navigator.sendBeacon(`${(supabase as any).supabaseUrl}/rest/v1/analytics_events`, blob);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [landing?.slug, slug]);

    useEffect(() => {
        if (previewData) {
            setLoading(false);
            return;
        }

        const fetchLanding = async () => {
            if (!slug) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('landings')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .maybeSingle();

            if (error) {
                console.error('Error fetching landing:', error);
            }

            if (data) {
                // Initialize default config if fields are missing
                const config = {
                    pas: {
                        problem1: '¿Sientes que tu energía no es la misma de antes?',
                        problem2: '¿El estrés diario afecta tu rendimiento y descanso?',
                        problem3: '¿Buscas una solución efectiva y profesional?',
                        ...data.config?.pas
                    },
                    benefits: data.config?.benefits || [],
                    solutions: data.config?.solutions || [
                        { title: 'Tecnología de Vanguardia', text: 'Usamos equipos de última generación para diagnósticos precisos.', image: 'https://images.unsplash.com/photo-1576091160550-217359f49a4c?auto=format&fit=crop&q=80&w=800' },
                        { title: 'Atención Personalizada', text: 'Cada paciente es único. Diseñamos planes a tu medida.', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800' }
                    ],
                    carousel: { images: [], height: { mobile: '250px', desktop: '400px' }, ...data.config?.carousel },
                    collage: { images: [], height: { mobile: 'auto', desktop: 'auto' }, ...data.config?.collage },
                    pricing: { title: 'Planes y Precios', subtitle: '', plans: [], ...data.config?.pricing },
                    faq: { title: 'Preguntas Frecuentes', subtitle: '', items: [], ...data.config?.faq },
                    socialProof: {
                        testimonials: [
                            { name: 'Andrea M.', text: 'Excelente atención, los resultados se notan desde la primera sesión.' },
                            { name: 'Ricardo G.', text: 'El equipo médico es muy profesional y las instalaciones son impecables.' }
                        ],
                        logos: [
                            'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_de_la_Organizaci%C3%B3n_Mundial_de_la_Salud.svg',
                            'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' // Placeholder logos
                        ],
                        ...data.config?.socialProof
                    },
                    header: { buttonText: 'RESERVA AHORA', buttonColor: '#10b981', ...data.config?.header },
                    hero: { title: data.title, subtitle: '', imageUrl: '', buttonText: '¡Quiero mi Valoración!', buttonColor: '#0f172a', ...data.config?.hero },
                    cta: { id: '', urgencyText: '⚠️ Quedan pocos cupos para esta semana', buttonText: '¡Quiero mi cita!', buttonColor: '#10b981', ...data.config?.cta },
                    floatingAction: { type: 'whatsapp', style: 'circle', label: '¡Hablemos! 👋', color: '#25D366', ...data.config?.floatingAction },
                    order: data.config?.order || ['hero', 'pas', 'solutions', 'carousel', 'collage', 'pricing', 'faq', 'socialProof', 'cta', 'footer'],
                    visibility: {
                        hero: true,
                        pas: true,
                        solutions: true,
                        carousel: true,
                        collage: true,
                        pricing: true,
                        faq: true,
                        socialProof: true,
                        cta: true,
                        footer: true,
                        whatsapp: true,
                        floatingAction: true,
                        ...data.config?.visibility
                    }
                };

                const enrichedLanding = { ...data, config };
                setFetchedLanding(enrichedLanding);

                // Fetch CTA Item
                if (config.cta.id) {
                    const isBundle = config.cta.id.toString().length > 10;
                    const table = isBundle ? 'bundles' : 'treatments';
                    const { data: itemData } = await supabase
                        .from(table)
                        .select('*')
                        .eq('id', config.cta.id)
                        .single();
                    setCtaItem(itemData);
                }
            }
            setLoading(false);
        };

        fetchLanding();
    }, [slug, previewData]);

    const handleAction = (type: 'whatsapp' | 'link' | 'scroll', config: any = {}) => {
        const actionType = type || config.type || 'whatsapp';

        if (actionType === 'whatsapp') {
            trackEvent('click', 'WhatsApp');
            const number = config.number || landing.config?.whatsapp_number || '573112345678';
            const defaultMessage = `Hola! Vengo de la página ${landing?.title}. Quiero reservar mi cita.`;
            const message = config.message || landing.config?.whatsapp_message || defaultMessage;
            window.open(`https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        } else if (actionType === 'link') {
            trackEvent('click', 'Action Link');
            if (config.url) window.open(config.url, '_blank');
        } else if (actionType === 'scroll') {
            trackEvent('click', 'Scroll');
            document.getElementById(config.target || 'cta-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleWhatsApp = () => handleAction('whatsapp');

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!landing) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
                <p className="text-slate-500 mb-8">Oferta no disponible.</p>
                <a href="/" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl">Volver al inicio</a>
            </div>
        );
    }

    const visibility = landing.config?.visibility || {
        hero: true, pas: true, solutions: true, socialProof: true, cta: true, footer: true, whatsapp: true
    };

    // Helper para obtener tamaños de fuente
    const getFontSize = (val: any, device: 'mobile' | 'desktop', def: string) => {
        if (!val) return def;
        if (typeof val === 'string') return val;
        if (typeof val === 'object') return val[device] || val.mobile || val.desktop || def;
        return def;
    };

    // Helper para visibilidad inteligente (Desktop/Mobile)
    const getVisClass = (fieldKey: string) => {
        const vis = landing.config?.visibility?.[fieldKey];
        if (!vis) return ''; // Visible por defecto

        const desktop = vis.desktop !== false;
        const mobile = vis.mobile !== false;

        // Si estamos en el editor (previewData existe), usamos visibilidad binaria inmediata
        if (previewData) {
            if (isMobilePreview) return mobile ? 'block' : 'hidden';
            return desktop ? 'block' : 'hidden';
        }

        // Comportamiento responsivo normal para producción
        if (!desktop && !mobile) return 'hidden';
        if (desktop && !mobile) return 'hidden md:block';
        if (!desktop && mobile) return 'block md:hidden';

        // Fallback especial para el botón flotante si se usa la key antigua
        if (fieldKey === 'floatingAction' && !landing.config?.visibility?.floatingAction && landing.config?.visibility?.whatsapp) {
            return getVisClass('whatsapp');
        }

        return '';
    };

    const getItemVisClass = (vis: any) => {
        if (!vis) return '';
        const desktop = vis.desktop !== false;
        const mobile = vis.mobile !== false;

        if (previewData) {
            if (isMobilePreview) return mobile ? 'block' : 'hidden';
            return desktop ? 'block' : 'hidden';
        }

        if (!desktop && !mobile) return 'hidden';
        if (desktop && !mobile) return 'hidden md:block';
        if (!desktop && mobile) return 'block md:hidden';
        return '';
    };

    // Helper para manejar clases de Tailwind responsivas en el editor
    const cn = (...classes: any[]) => {
        const processed = classes.flatMap(c => {
            if (!c) return [];
            if (typeof c === 'object' && !Array.isArray(c)) {
                return Object.entries(c)
                    .filter(([_, v]) => v)
                    .map(([k]) => k);
            }
            return Array.isArray(c) ? c : [c.toString()];
        }).filter(Boolean).join(' ');

        if (!isMobilePreview) return processed;

        // Si estamos en preview móvil, quitamos los prefijos de escritorio para que no rompan el layout
        return processed.split(' ')
            .filter(c => !c.startsWith('md:') && !c.startsWith('lg:') && !c.startsWith('xl:') && !c.startsWith('2xl:'))
            .join(' ');
    };

    // Helper para disposición Flex (Horizontal/Vertical)
    const getFlexClass = (sectionKey: string, defaultMobile: string = 'flex-col', defaultDesktop: string = 'md:flex-row') => {
        const layout = landing.config?.styles?.[`${sectionKey}Layout`];
        if (!layout) return `${defaultMobile} ${defaultDesktop}`;

        const mobile = layout.mobile || 'col';
        const desktop = layout.desktop || 'row';

        if (isMobilePreview) {
            return mobile === 'row' ? 'flex-row' : 'flex-col';
        }

        const mClass = mobile === 'row' ? 'flex-row' : 'flex-col';
        const dClass = desktop === 'row' ? 'md:flex-row' : 'md:flex-col';

        return `${mClass} ${dClass}`;
    };

    // Helper para obtener estilo de fuente responsivo o forzado
    const getAlignment = (val: any, defaultAlign: string = 'center') => {
        const mobile = (typeof val === 'object' ? val.mobile : val) || defaultAlign;
        const desktop = (typeof val === 'object' ? val.desktop : val) || defaultAlign;

        const mobileFlex = mobile === 'center' ? 'items-center text-center' : mobile === 'left' ? 'items-start text-left' : 'items-end text-right';
        const desktopFlex = desktop === 'center' ? 'md:items-center md:text-center' : desktop === 'left' ? 'md:items-start md:text-left' : 'md:items-end md:text-right';

        if (isMobilePreview) return mobileFlex;
        return `${mobileFlex} ${desktopFlex}`;
    };

    const getElementStyle = (val: any, desktopDef: string, mobileDef: string) => {
        const desktopSize = getFontSize(val, 'desktop', desktopDef);
        const mobileSize = getFontSize(val, 'mobile', mobileDef);

        // Si estamos en previsualización móvil, forzamos el tamaño móvil
        if (isMobilePreview) return { fontSize: mobileSize };

        // En vista normal/escritorio, usamos variables CSS para que los media queries de Tailwind funcionen
        // Pero para asegurar reactividad total en preview desktop, también podemos inyectar el valor directo
        return {
            fontSize: `var(--current-size)`,
            '--current-size': mobileSize,
            '--desktop-size': desktopSize
        } as any;
    };
    // Helper para columnas (Específico para Testimonios)
    const getGridCols = (fieldKey: string, defaultMobile: string = 'grid-cols-1', defaultDesktop: string = 'md:grid-cols-3') => {
        const cols = landing.config?.styles?.[`${fieldKey}Cols`];
        const layout = landing.config?.styles?.[`${fieldKey}Layout`];

        if (isMobilePreview) {
            return (layout?.mobile === 'row') ? 'grid-cols-2' : 'grid-cols-1';
        }

        const mCols = (layout?.mobile === 'row') ? 'grid-cols-2' : 'grid-cols-1';
        const dColsNum = cols?.desktop || 3;
        const dCols = dColsNum === 1 ? 'md:grid-cols-1' : dColsNum === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

        return `${mCols} ${dCols}`;
    };

    // Estilos inyectados directamente para saltar limitaciones de media queries en preview
    const heroTitleStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.heroTitleSize, 'mobile', '2.25rem') }
        : { fontSize: getFontSize(landing.config?.styles?.heroTitleSize, 'desktop', '4.5rem') };

    const heroSubtitleStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.heroSubtitleSize, 'mobile', '1.1rem') }
        : { fontSize: getFontSize(landing.config?.styles?.heroSubtitleSize, 'desktop', '1.25rem') };

    const pasTitleStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.pasTitleSize, 'mobile', '1.8rem') }
        : { fontSize: getFontSize(landing.config?.styles?.pasTitleSize, 'desktop', '3rem') };

    const pasProblemStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.pasProblemSize, 'mobile', '1.1rem') }
        : { fontSize: getFontSize(landing.config?.styles?.pasProblemSize, 'desktop', '1.1rem') };

    const solTitleStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.solutionTitleSize, 'mobile', '1.8rem') }
        : { fontSize: getFontSize(landing.config?.styles?.solutionTitleSize, 'desktop', '3rem') };

    const solTextStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.solutionTextSize, 'mobile', '1.1rem') }
        : { fontSize: getFontSize(landing.config?.styles?.solutionTextSize, 'desktop', '1.1rem') };

    const ctaTitleStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.ctaTitleSize, 'mobile', '2.2rem') }
        : { fontSize: getFontSize(landing.config?.styles?.ctaTitleSize, 'desktop', '3.7rem') };

    const ctaTextStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.ctaTextSize, 'mobile', '1.2rem') }
        : { fontSize: getFontSize(landing.config?.styles?.ctaTextSize, 'desktop', '1.2rem') };

    const heroButtonStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.heroButtonSize, 'mobile', '1.125rem') }
        : { fontSize: getFontSize(landing.config?.styles?.heroButtonSize, 'desktop', '1.125rem') };

    const ctaButtonStyle = isMobilePreview
        ? { fontSize: getFontSize(landing.config?.styles?.ctaButtonSize, 'mobile', '0.875rem') }
        : { fontSize: getFontSize(landing.config?.styles?.ctaButtonSize, 'desktop', '0.875rem') };

    return (
        <div
            className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 relative"
            style={{
                '--primary-color': landing.config?.styles?.primaryColor || '#10b981',
                '--primary-hover': (landing.config?.styles?.primaryColor || '#10b981') + 'dd'
            } as any}
        >
            {/* 1. Header Fijo / Navegación */}
            {visibility.header !== false && (
                <header className={cn(`${previewData ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-[60] transition-all duration-300`, {
                    'bg-white/90 backdrop-blur-xl shadow-lg py-3': isScrolled || isMobilePreview,
                    'bg-transparent py-6': !isScrolled && !isMobilePreview
                })}>
                    <div className={cn("container mx-auto px-4 md:px-6 flex justify-between items-center")}>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-slate-900/20">P</div>
                            <span className="font-black text-slate-900 tracking-tighter text-xl uppercase">{landing.title?.charAt(0) || 'P'}ROMEDID</span>
                        </div>
                        <button
                            onClick={() => handleAction(landing.config?.header?.actionType || 'whatsapp')}
                            className={cn("text-white px-6 py-2.5 rounded-full font-black transition-all shadow-xl active:scale-95 text-xs md:text-sm")}
                            style={{
                                ...ctaButtonStyle,
                                backgroundColor: landing.config?.header?.buttonColor || 'var(--primary-color)',
                                boxShadow: `0 10px 15px -3px ${landing.config?.header?.buttonColor || 'var(--primary-color)'}40`
                            }}
                        >
                            {landing.config?.header?.buttonText || 'RESERVA AHORA'}
                        </button>
                    </div>
                </header>
            )}

            {/* Dynamic Sections Rendering */}
            {(landing.config?.order || ['hero', 'pas', 'solutions', 'carousel', 'collage', 'pricing', 'faq', 'socialProof', 'cta', 'footer']).map((sectionId: string) => {
                const isSectionVisible = (id: string) => {
                    const vis = landing.config?.visibility?.[id];
                    if (!vis) return true;
                    if (typeof vis === 'boolean') return vis;

                    if (previewData) {
                        return isMobilePreview ? vis.mobile !== false : vis.desktop !== false;
                    }

                    return vis.desktop !== false || vis.mobile !== false;
                };

                if (!isSectionVisible(sectionId)) return null;

                if (sectionId === 'hero') return (
                    <section key="hero" className={cn(`pt-24 pb-12 md:pt-48 md:pb-32 bg-gradient-to-br from-slate-50 to-white overflow-hidden ${getVisClass('hero')}`)}>
                        <div className={cn("container mx-auto px-4 md:px-6")}>
                            <div className={cn(`flex items-center gap-16 lg:gap-24 ${getFlexClass('hero')}`)}>
                                <div className={cn(`w-full md:w-3/5 space-y-8 animate-fade-in-right flex flex-col ${getAlignment(landing.config?.styles?.heroAlignment, 'left')}`)}>
                                    <span className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        ✨ Medicina Integral Avanzada
                                    </span>
                                    <h1
                                        className={cn(`text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] md:leading-[1.05] tracking-tight ${getVisClass('heroTitle')}`)}
                                        style={heroTitleStyle}
                                    >
                                        {landing.title}
                                    </h1>
                                    <p
                                        className={cn(`text-slate-500 leading-relaxed max-w-2xl ${getVisClass('heroSubtitle')}`)}
                                        style={heroSubtitleStyle}
                                    >
                                        {landing.config?.hero?.subtitle}
                                    </p>
                                    <div className={cn(`flex flex-col sm:flex-row gap-4 pt-4 ${getAlignment(landing.config?.styles?.heroAlignment, 'left')}`)}>
                                        <button
                                            onClick={() => handleAction(landing.config?.hero?.actionType || 'whatsapp')}
                                            className="text-white px-10 py-5 rounded-2xl font-black transition-all shadow-xl active:scale-95"
                                            style={{
                                                ...heroButtonStyle,
                                                backgroundColor: landing.config?.hero?.buttonColor || landing.config?.styles?.primaryColor || '#0f172a'
                                            }}
                                        >
                                            {landing.config?.hero?.buttonText || '¡Quiero mi Valoración!'}
                                        </button>
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">+1,500 personas atendidas</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={cn(`w-full md:w-2/5 animate-fade-in-left ${getVisClass('heroMedia')}`)}>
                                    <div className="relative group">
                                        <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                                        {landing.config?.hero?.videoThumbnail ? (
                                            <div className="relative cursor-pointer" onClick={() => window.open(landing.config.hero.videoUrl, '_blank')}>
                                                <img
                                                    src={landing.config.hero.videoThumbnail}
                                                    className={cn("rounded-[2.5rem] shadow-2xl border-4 md:border-8 border-white object-cover aspect-[4/5] w-full")}
                                                    alt="Video Thumbnail"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div
                                                        className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl scale-100 group-hover:scale-110 transition-all"
                                                        style={{ backgroundColor: 'var(--primary-color)' }}
                                                    >
                                                        <span className="text-3xl ml-1">▶</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={landing.config?.hero?.imageUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000'}
                                                className={cn("relative rounded-[2.5rem] shadow-2xl border-4 md:border-8 border-white object-cover aspect-[4/5] w-full")}
                                                alt="Hero"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );

                if (sectionId === 'pas') return (
                    <section key="pas" className={cn(`py-16 md:py-24 bg-white border-y border-slate-50 ${getVisClass('pas')}`)}>
                        <div className={cn("container mx-auto px-4 md:px-6")}>
                            <div className={cn(`max-w-3xl mx-auto mb-16 space-y-4 flex flex-col ${getAlignment(landing.config?.styles?.pasAlignment)} ${getVisClass('pasTitle')}`)}>
                                <h2
                                    className={cn("text-3xl md:text-5xl font-black text-slate-900")}
                                    style={pasTitleStyle}
                                >
                                    {landing.config?.pas?.title || '¿Te sientes identificado con esto?'}
                                </h2>
                                <p className="text-slate-500 font-medium">Muchos de nuestros pacientes llegaban así antes de PROMEDID</p>
                            </div>
                            <div className={cn("grid md:grid-cols-3 gap-8")}>
                                {[
                                    landing.config?.pas?.problem1,
                                    landing.config?.pas?.problem2,
                                    landing.config?.pas?.problem3
                                ].map((p: any, i) => {
                                    if (!p) return null;

                                    const text = typeof p === 'object' ? p.text : p;
                                    const image = typeof p === 'object' ? p.image : null;

                                    return (
                                        <div key={i} className={cn(`group p-8 md:p-10 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-slate-200 transition-all hover:bg-white hover:shadow-2xl flex flex-col ${getAlignment(landing.config?.styles?.pasAlignment)} ${getVisClass(`pasProb${i + 1}`)}`)}>
                                            {image ? (
                                                <div className="w-full aspect-video rounded-3xl overflow-hidden mb-8 shadow-sm">
                                                    <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={text} />
                                                </div>
                                            ) : (
                                                <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:bg-red-50 group-hover:scale-110 transition-all`}>⚠️</div>
                                            )}
                                            <p
                                                className="text-lg font-bold text-slate-800 leading-snug"
                                                style={pasProblemStyle}
                                            >
                                                {text}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );

                if (sectionId === 'solutions' && landing.config?.solutions) return (
                    <section key="solutions" className={cn(`py-16 md:py-24 bg-white overflow-hidden ${getVisClass('solutions')}`)}>
                        <div className={cn("container mx-auto px-4 md:px-6 space-y-32")}>
                            {landing.config.solutions.map((s: any, i: number) => (
                                <div key={i} className={cn(`flex items-center gap-16 lg:gap-24 ${getFlexClass('solutions', i % 2 === 0 ? 'flex-col' : 'flex-col-reverse', i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse')} ${getItemVisClass(s.visibility)}`)}>
                                    <div className={cn(`w-full md:w-1/2 space-y-6 flex flex-col ${getAlignment(landing.config?.styles?.solutionAlignment, 'left')}`)}>
                                        <div className="w-12 h-1.5 bg-emerald-500 rounded-full"></div>
                                        <h3
                                            className={cn("text-3xl md:text-5xl font-black text-slate-900 leading-tight")}
                                            style={solTitleStyle}
                                        >
                                            {s.title}
                                        </h3>
                                        <p
                                            className={cn("text-lg text-slate-500 leading-relaxed")}
                                            style={solTextStyle}
                                        >
                                            {s.text}
                                        </p>
                                        <ul className="space-y-3 pt-4">
                                            {['Especialistas Certificados', 'Tecnología no invasiva', 'Resultados garantizados'].map((t, idx) => (
                                                <li key={idx} className="flex items-center gap-3 font-bold text-slate-700 text-sm">
                                                    <span className="text-emerald-500">✓</span> {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className={cn("md:w-1/2 w-full")}>
                                        {s.image && (
                                            <img src={s.image} className={cn("rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl w-full aspect-video object-cover")} alt={s.title} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );

                if (sectionId === 'carousel' && landing.config?.carousel) return (
                    <section key="carousel" className={cn(`py-12 md:py-16 bg-white overflow-hidden ${getVisClass('carousel')}`)}>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            #carousel-${landing.id} .carousel-item { height: ${landing.config.carousel.height?.mobile || '250px'}; }
                            @media (min-width: 768px) {
                                #carousel-${landing.id} .carousel-item { height: ${landing.config.carousel.height?.desktop || '400px'}; }
                            }
                        ` }} />
                        <div id={`carousel-${landing.id}`} className={cn("container mx-auto px-6 relative group")}>
                            {/* Premium Navigation Buttons */}
                            <button
                                onClick={() => carouselRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                                className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-xl flex items-center justify-center text-slate-900 border border-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 hidden md:flex"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => carouselRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                                className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-xl flex items-center justify-center text-slate-900 border border-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 hidden md:flex"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Carousel Body */}
                            <div
                                ref={carouselRef}
                                className={cn("flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar")}
                                style={{
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {(landing.config.carousel.images || []).map((img: any, i: number) => (
                                    <div
                                        key={i}
                                        className={cn("carousel-item min-w-[80%] md:min-w-[400px] rounded-[2.5rem] overflow-hidden shadow-xl snap-center shrink-0 transition-transform duration-500 hover:scale-[1.02]")}
                                    >
                                        <div className="w-full h-full">
                                            <img src={img} className="w-full h-full object-cover" alt={`Carousel ${i}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mobile Hint */}
                            <div className="flex justify-center gap-1.5 mt-6 md:hidden">
                                {(landing.config.carousel.images || []).map((_: any, i: number) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                ))}
                            </div>
                        </div>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .no-scrollbar::-webkit-scrollbar { display: none; }
                        ` }} />
                    </section>
                );

                if (sectionId === 'collage' && landing.config?.collage) return (
                    <section key="collage" className={cn(`py-16 md:py-24 bg-white overflow-hidden ${getVisClass('collage')}`)}>
                        <div className={cn("container mx-auto px-6")}>
                            <div
                                className={cn("grid grid-cols-2 md:grid-cols-4 gap-4")}
                                style={{
                                    minHeight: previewData ? (isMobilePreview ? (landing.config.collage.height?.mobile || 'auto') : (landing.config.collage.height?.desktop || 'auto')) : undefined,
                                    '--h-mobile': landing.config.collage.height?.mobile || 'auto',
                                    '--h-desktop': landing.config.collage.height?.desktop || 'auto'
                                } as any}
                            >
                                {(landing.config.collage.images || []).map((img: any, i: number) => (
                                    <div
                                        key={i}
                                        className={cn(`rounded-[2rem] overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl ${i % 5 === 0 ? 'col-span-2 row-span-2' : ''}`)}
                                    >
                                        <img src={img} className={cn("w-full h-full object-cover aspect-square md:aspect-auto")} alt={`Collage ${i}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );

                if (sectionId === 'socialProof' && landing.config?.socialProof) return (
                    <section key="socialProof" className={cn(`py-16 md:py-24 bg-slate-50 ${getVisClass('socialProof')}`)}>
                        <div className={cn("container mx-auto px-6")}>
                            <div className="text-center mb-16 space-y-4">
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Lo que dicen nuestros pacientes</h2>
                                <div className="flex justify-center gap-1 text-amber-400 text-xl">★★★★★</div>
                            </div>
                            <div className={cn(`grid gap-8 mb-20 ${getGridCols('socialProof')}`)}>
                                {(landing.config.socialProof.testimonials || []).map((t: any, i: number) => (
                                    <div key={i} className={cn(`bg-white p-10 rounded-[2.5rem] shadow-sm italic text-slate-600 relative flex flex-col justify-between ${getItemVisClass(t.visibility)}`)}>
                                        <div>
                                            <div className="text-5xl text-slate-100 absolute top-6 right-8 font-serif leading-none">“</div>
                                            <p className="relative z-10 mb-6 font-medium leading-relaxed">"{t.text}"</p>
                                        </div>
                                        <p className="not-italic font-black text-slate-900 text-sm">— {t.name}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-10 border-t border-slate-200">
                                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{landing.config.socialProof.logosTitle || 'Nuestras Alianzas Médicas'}</p>
                                <div className={cn("flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 transition-all")}>
                                    {(landing.config.socialProof.logos || []).map((logo: string, i: number) => logo && (
                                        <img key={i} src={logo} className={cn("h-8 md:h-12 w-auto")} alt="Partner" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                );

                if (sectionId === 'pricing' && landing.config?.pricing) return (
                    <section key="pricing" className={cn(`py-12 md:py-24 bg-white ${getVisClass('pricing')}`)}>
                        <div className={cn("container mx-auto px-2 md:px-6")}>
                            <div className="text-center mb-16 space-y-4">
                                <h2 className={cn("text-3xl md:text-5xl font-black text-slate-900 leading-tight")}>{landing.config.pricing.title || 'Planes y Precios'}</h2>
                                <p className="text-slate-500 font-medium">{landing.config.pricing.subtitle || 'Selecciona la opción que mejor se adapte a tus necesidades.'}</p>
                            </div>
                            <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8 max-w-6xl mx-auto")}>
                                {(landing.config.pricing.plans || []).map((plan: any, i: number) => (
                                    <div key={i} className={cn(`relative p-4 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border-2 transition-all hover:shadow-2xl flex flex-col`, {
                                        'border-[var(--primary-color)] bg-slate-50 scale-100 md:scale-105 z-10': plan.featured,
                                        'border-slate-100 bg-white shadow-sm': !plan.featured
                                    })}>
                                        {plan.featured && (
                                            <div className={cn("absolute -top-3 md:-top-5 left-1/2 -translate-x-1/2 text-white px-3 md:px-6 py-1 md:py-2 rounded-full text-[8px] md:text-xs font-black uppercase tracking-widest shadow-lg whitespace-nowrap")} style={{ backgroundColor: 'var(--primary-color)' }}>
                                                Más Popular
                                            </div>
                                        )}
                                        <div className={cn("mb-4 md:mb-8")}>
                                            <h3 className={cn("text-sm md:text-xl font-black text-slate-900 mb-1 md:mb-2 line-clamp-1")}>{plan.name}</h3>
                                            <div className={cn("flex items-baseline gap-0.5 md:gap-1")}>
                                                <span className={cn("text-xl md:text-4xl font-black text-slate-900")}>${plan.price}</span>
                                                <span className={cn("text-slate-400 font-bold text-[8px] md:text-sm")}>/{plan.period || 'sesión'}</span>
                                            </div>
                                        </div>
                                        <ul className={cn("space-y-2 md:space-y-4 mb-6 md:mb-10 flex-grow")}>
                                            {(plan.features || []).map((feat: string, idx: number) => (
                                                <li key={idx} className={cn("flex gap-1.5 md:gap-3 text-[10px] md:text-sm font-bold text-slate-600 leading-tight")}>
                                                    <span style={{ color: 'var(--primary-color)' }}>✓</span> <span className="line-clamp-2">{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={handleWhatsApp}
                                            className={cn(`w-full py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black transition-all active:scale-95 text-[10px] md:text-base`, {
                                                'text-white': plan.featured,
                                                'bg-slate-100 text-slate-900 hover:bg-slate-200': !plan.featured
                                            })}
                                            style={plan.featured ? { backgroundColor: 'var(--primary-color)' } : {}}
                                        >
                                            {plan.buttonText || 'Elegir'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );

                if (sectionId === 'faq' && landing.config?.faq) return (
                    <section key="faq" className={cn(`py-16 md:py-24 bg-slate-50 ${getVisClass('faq')}`)}>
                        <div className={cn("container mx-auto px-6 max-w-4xl")}>
                            <div className="text-center mb-16 space-y-4">
                                <h2 className={cn("text-3xl md:text-5xl font-black text-slate-900")}>{landing.config.faq.title || 'Preguntas Frecuentes'}</h2>
                                <p className="text-slate-500 font-medium font-italic italic">{landing.config.faq.subtitle || 'Resolvemos todas tus dudas antes de empezar.'}</p>
                            </div>
                            <div className="space-y-4">
                                {(landing.config.faq.items || []).map((item: any, i: number) => (
                                    <details key={i} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all hover:shadow-md">
                                        <summary className="p-8 font-black text-slate-900 cursor-pointer flex justify-between items-center list-none outline-none">
                                            {item.question}
                                            <span className="text-xl transition-transform group-open:rotate-180">↓</span>
                                        </summary>
                                        <div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed">
                                            {item.answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>
                );

                if (sectionId === 'cta') return (
                    <section key="cta" id="cta-section" className={cn(`py-12 md:py-24 bg-slate-900 text-white relative overflow-hidden ${getVisClass('cta')}`)}>
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent)] pointer-events-none"></div>
                        <div className={cn(`container mx-auto px-2 md:px-6 max-w-4xl relative z-10 space-y-8 md:space-y-10 flex flex-col ${getAlignment(landing.config?.styles?.ctaAlignment)}`)}>
                            <div className={cn(`bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-full inline-block font-black text-xs tracking-widest uppercase ${getVisClass('ctaText')}`)}>
                                {landing.config?.cta?.urgencyText}
                            </div>
                            <h2 className={cn("text-3xl md:text-6xl font-black leading-tight px-2")} style={ctaTitleStyle}>{landing.config?.cta?.title || '¿Listo para transformar tu bienestar?'}</h2>
                            <p className={cn("text-lg md:text-xl text-slate-400 font-medium px-2")} style={ctaTextStyle}>{landing.config?.cta?.text || 'Solicita tu valoración inicial hoy y comienza tu camino a una vida más saludable.'}</p>

                            <div className={cn("grid md:grid-cols-2 gap-8 md:gap-12 text-left bg-white/5 md:bg-white/5 p-4 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 backdrop-blur-sm")}>
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black">{landing.config?.cta?.formTitle || 'Tu camino inicia aquí'}</h3>
                                    <p className="text-slate-400 font-medium">{landing.config?.cta?.formSubtitle || 'Completa tus datos y un especialista te contactará en menos de 24 horas hábiles.'}</p>
                                    <div className="flex flex-col gap-4 text-sm font-bold opacity-70">
                                        {(landing.config?.cta?.benefits || [
                                            '✓ Consulta 100% personalizada',
                                            '✓ Sin compromiso de permanencia',
                                            '✓ Protocolos médicos certificados'
                                        ]).map((benefit: string, idx: number) => (
                                            <span key={idx}>{benefit}</span>
                                        ))}
                                    </div>
                                </div>
                                <ContactFormV2
                                    source={landing.title}
                                    buttonStyle={ctaButtonStyle}
                                    onSuccess={() => setFormSubmitted(true)}
                                    isMobilePreview={isMobilePreview}
                                    buttonText={landing.config?.cta?.buttonText}
                                />
                            </div>
                        </div>
                    </section>
                );

                if (sectionId === 'footer') {
                    if (!isSectionVisible('footer')) return null;

                    return (
                        <footer key="footer" className={cn(`bg-white pt-16 md:pt-24 pb-12 border-t border-slate-100 ${getVisClass('footer')}`)}>
                            <div className={cn("container mx-auto px-6")}>
                                <div className={cn("grid md:grid-cols-4 gap-12 mb-20")}>
                                    <div className={cn("space-y-6 col-span-1 md:col-span-1")}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">{landing.title?.charAt(0) || 'P'}</div>
                                            <span className="font-black text-slate-900 tracking-tighter uppercase">{landing.title || 'PROMEDID'}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{landing.config?.footer?.description || 'Medicina Integral Avanzada al servicio de tu bienestar. Ubicados en el corazón de la ciudad.'}</p>
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Ubicación</h4>
                                        <div className="text-sm text-slate-500 font-medium space-y-2">
                                            <p className={getVisClass('footerAddress')}>{landing.config?.footer?.address || 'Edificio ICONO, Piso 4'}</p>
                                            <p>Cúcuta, Norte de Santander</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Contacto</h4>
                                        <div className="text-sm text-slate-500 font-medium space-y-2">
                                            <p className={getVisClass('footerPhone')}>{landing.config?.footer?.phone || '+57 311 234 5678'}</p>
                                            <p className={getVisClass('footerEmail')}>{landing.config?.footer?.email || 'contacto@promedid.com'}</p>
                                            <p>Lun - Sáb: 8:00 AM - 6:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Legales</h4>
                                        <div className="text-sm text-slate-500 font-medium space-y-2">
                                            <p className="hover:text-emerald-600 cursor-pointer">Términos y Condiciones</p>
                                            <p className="hover:text-emerald-600 cursor-pointer">Protección de Datos</p>
                                            <p className="hover:text-emerald-600 cursor-pointer">Protocolos COVID-19</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-12 border-t border-slate-50 text-center space-y-4">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">© 2026 PROMEDID MEDICINA INTEGRAL SAS - VIGILADO MINSALUD</p>
                                </div>
                            </div>
                        </footer>
                    );
                }

                return null;
            })}



            {/* 8. Botón Flotante Dinámico */}
            {(() => {
                const fa = landing.config?.floatingAction || { type: 'whatsapp', style: 'circle', label: '¡Hablemos por WhatsApp! 👋', color: '#25D366' };
                const vis = landing.config?.visibility?.floatingAction || landing.config?.visibility?.whatsapp;
                const isVisibleSetting = !vis || (typeof vis === 'boolean' ? vis : (vis.desktop !== false || vis.mobile !== false));
                if (!isVisibleSetting) return null;
                if (!formSubmitted && landing.config?.sticky_whatsapp) return null;

                const btnColor = fa.color || '#25D366';
                const isPill = fa.style === 'pill';

                return (
                    <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 translate-y-0 opacity-100`}>
                        {/* Botón Flotante */}
                        <button
                            onClick={() => handleAction(fa.type, { message: fa.whatsappMessage, url: fa.url })}
                            className={cn(
                                "text-white shadow-2xl flex items-center justify-center transition-all group active:scale-95",
                                isPill ? "px-6 py-4 rounded-2xl font-black gap-3 animate-bounce" : "w-16 h-16 rounded-full text-3xl hover:scale-110",
                                getVisClass('floatingAction')
                            )}
                            style={{
                                backgroundColor: btnColor,
                                boxShadow: `0 20px 50px ${btnColor}4d`
                            }}
                        >
                            {isPill && <span className="text-sm uppercase tracking-widest">{fa.label || (fa.type === 'whatsapp' ? 'WhatsApp' : 'Reservar')}</span>}

                            {!isPill && (
                                <div className="absolute -top-12 right-0 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                                    {fa.label || '¡Hablemos! 👋'}
                                </div>
                            )}

                            {fa.type === 'link' ? (
                                <svg className={cn(isPill ? "w-5 h-5" : "w-8 h-8", "fill-none stroke-current")} viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            ) : fa.type === 'scroll' ? (
                                <span className={isPill ? "text-xl" : "text-3xl"}>🚀</span>
                            ) : (
                                <svg className={cn(isPill ? "w-5 h-5" : "w-8 h-8", "fill-current")} viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.52.9 3.397 1.378 5.307 1.379 5.454 0 9.893-4.439 9.893-9.892 0-2.614-1.033-5.074-2.907-6.948-1.874-1.874-4.324-2.905-6.94-2.905-5.45 0-9.89 4.439-9.89 9.89 0 2.023.533 3.96 1.543 5.672l-1.011 3.705 3.82-1.002z" />
                                </svg>
                            )}
                        </button>
                    </div>
                );
            })()}
        </div>
    );
};

export default LandingPage;
