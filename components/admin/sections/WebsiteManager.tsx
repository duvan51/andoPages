
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../shared/SectionHeader';
import {
    Layout,
    Image as ImageIcon,
    Type,
    Save,
    Smartphone,
    Monitor,
    Link as LinkIcon,
    Facebook,
    Instagram,
    Twitter,
    Github,
    Youtube,
    Upload,
    X as CloseIcon,
    MapPin,
    Sparkles,
    Gift
} from 'lucide-react';
import MediaPicker from '../shared/MediaPicker';

interface WebsiteManagerProps {
    companyId?: string;
}

const WebsiteManager: React.FC<WebsiteManagerProps> = ({ companyId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState<any>({
        hero: {
            title: '',
            subtitle: '',
            description: '',
            imageUrl: '',
            buttonText: 'Ver Servicios',
            secondaryButtonText: 'Contáctanos'
        },
        footer: {
            description: '',
            socialLinks: {
                facebook: '',
                instagram: '',
                whatsapp: '',
                twitter: ''
            },
            copyright: ''
        },
        contact: {
            email: '',
            phone: '',
            address: ''
        },
        metadata: {
            title: '',
            faviconUrl: ''
        },
        header: {
            homeLabel: 'Inicio',
            servicesLabel: 'Tratamientos',
            bundlesLabel: 'Paquetes',
            bookingLabel: 'Agendar'
        },
        banner: {
            enabled: true,
            type: 'offers', // 'offers' or 'custom'
            customText: '',
            customLink: '',
            backgroundColor: '#0f172a'
        },
        offers: {
            title: '',
            subtitle: ''
        },
        collage: {
            enabled: true,
            title: '',
            subtitle: '',
            images: [
                "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1539109139745-f6011a277370?q=80&w=1974&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2074&auto=format&fit=crop"
            ]
        },
        whatsapp: {
            enabled: true,
            label: '',
            message: ''
        },
        showLocations: true
    });

    const [customDomain, setCustomDomain] = useState('');
    const [seoVerificationCode, setSeoVerificationCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [mediaPickerConfig, setMediaPickerConfig] = useState<{isOpen: boolean, target: string}>({ isOpen: false, target: '' });
    const [activeSection, setActiveSection] = useState<'hero' | 'header' | 'footer' | 'contact' | 'banners' | 'collage' | 'whatsapp' | 'advanced' | 'seo'>('hero');

    useEffect(() => {
        if (companyId) {
            fetchConfig();
        }
    }, [companyId]);

    const fetchConfig = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('companies')
            .select('config, name, custom_domain, seo_verification_code')
            .eq('id', companyId)
            .single();

        if (!error && data) {
            if (data.custom_domain) setCustomDomain(data.custom_domain);
            if (data.seo_verification_code) setSeoVerificationCode(data.seo_verification_code);
            if (data.config && Object.keys(data.config).length > 0) {
                // Merge with defaults to ensure all fields exist
                setConfig({
                    hero: { ...config.hero, ...(data.config.hero || {}) },
                    footer: { ...config.footer, ...(data.config.footer || {}) },
                    contact: { ...config.contact, ...(data.config.contact || {}) },
                    metadata: { ...config.metadata, ...(data.config.metadata || {}) },
                    header: { ...config.header, ...(data.config.header || {
                        homeLabel: 'Inicio',
                        servicesLabel: data.business_type === 'fashion' ? 'Lookbook' : 'Tratamientos',
                        bundlesLabel: 'Paquetes',
                        bookingLabel: data.business_type === 'fashion' ? 'Ver Tienda' : 'Agendar'
                    }) },
                    banner: { 
                        enabled: true,
                        type: 'offers',
                        customText: '',
                        customLink: '',
                        backgroundColor: '#0f172a',
                        ...(data.config.banner || {}) 
                    },
                    offers: {
                        title: '',
                        subtitle: '',
                        ...(data.config.offers || {})
                    },
                    collage: {
                        enabled: true,
                        title: '',
                        subtitle: '',
                        images: [],
                        labels: [],
                        ...(data.config.collage || {})
                    },
                    whatsapp: {
                        enabled: true,
                        label: '',
                        message: '',
                        ...(data.config.whatsapp || {})
                    },
                    showLocations: data.config.showLocations !== undefined ? data.config.showLocations : true
                });
            }
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const savedDomain = customDomain?.trim() || null;
        const { error } = await supabase
            .from('companies')
            .update({
                config,
                custom_domain: savedDomain,
                seo_verification_code: seoVerificationCode?.trim() || null
            })
            .eq('id', companyId);

        if (!error) {
            // Success notification could go here
            alert('Configuración guardada correctamente');
        } else {
            alert('Error al guardar: ' + error.message);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Personalización Web"
                subtitle="Edita los contenidos de tu página de inicio y pie de página"
                rightElement={
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Save size={18} />
                        )}
                        {isSaving ? 'Guardando...' : 'Publicar Cambios'}
                    </button>
                }
            />

            <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                {/* Navigation */}
                <div className="space-y-2">
                    <button
                        onClick={() => setActiveSection('hero')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'hero' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Layout size={18} />
                        Sección Hero
                    </button>
                    <button
                        onClick={() => setActiveSection('header')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'header' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Type size={18} />
                        Header y Menú
                    </button>
                    <button
                        onClick={() => setActiveSection('contact')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'contact' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Smartphone size={18} />
                        Datos de Contacto
                    </button>
                    <button
                        onClick={() => setActiveSection('banners')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'banners' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Sparkles size={18} />
                        Banners y Ofertas
                    </button>
                    <button
                        onClick={() => setActiveSection('collage')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'collage' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <ImageIcon size={18} />
                        Collage de Fotos
                    </button>
                    <button
                        onClick={() => setActiveSection('whatsapp')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'whatsapp' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Facebook size={18} />
                        Botón WhatsApp
                    </button>
                    <button
                        onClick={() => setActiveSection('advanced')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'advanced' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <LinkIcon size={18} />
                        Dominio Personalizado
                    </button>
                    <button
                        onClick={() => setActiveSection('seo')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'seo' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Type size={18} />
                        SEO y Pestaña
                    </button>
                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <label className="flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-100 cursor-pointer hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Mostrar Sedes</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${config.showLocations ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={config.showLocations}
                                    onChange={e => setConfig({ ...config, showLocations: e.target.checked })}
                                />
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.showLocations ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Editor Panels */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-8">
                    {activeSection === 'hero' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título Principal</label>
                                        <input
                                            value={config.hero?.title || ''}
                                            onChange={e => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                            placeholder="Ej: Transforme su salud con nosotros"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtítulo / Badge</label>
                                        <input
                                            value={config.hero?.subtitle || ''}
                                            onChange={e => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                            placeholder="Ej: Innovación Médica"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                                        <textarea
                                            value={config.hero?.description || ''}
                                            onChange={e => setConfig({ ...config, hero: { ...config.hero, description: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none h-32 resize-none"
                                            placeholder="Una breve introducción de su empresa..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagen de Fondo / Hero</label>
                                    <div className="relative aspect-video rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
                                        {config.hero.imageUrl ? (
                                            <>
                                                <img src={config.hero.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Hero Preview" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <button onClick={() => setMediaPickerConfig({ isOpen: true, target: 'hero' })} className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition-transform"><Upload size={20} /></button>
                                                    <button onClick={() => setConfig({ ...config, hero: { ...config.hero, imageUrl: '' } })} className="p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"><CloseIcon size={20} /></button>
                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setMediaPickerConfig({ isOpen: true, target: 'hero' })}
                                                className="flex flex-col items-center gap-3 text-slate-400 hover:text-emerald-600 transition-colors"
                                            >
                                                <ImageIcon size={48} strokeWidth={1.5} />
                                                <span className="text-xs font-black uppercase tracking-widest">Subir Imagen Impactante</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Botón Primario</label>
                                            <input
                                                value={config.hero?.buttonText || ''}
                                                onChange={e => setConfig({ ...config, hero: { ...config.hero, buttonText: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Botón Secundario</label>
                                            <input
                                                value={config.hero?.secondaryButtonText || ''}
                                                onChange={e => setConfig({ ...config, hero: { ...config.hero, secondaryButtonText: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'banners' && (
                        <div className="space-y-12 animate-fade-in">
                            {/* Top Announcement Banner */}
                            <div className="space-y-6">
                                <SectionHeader 
                                    title="Banner Superior de Anuncios" 
                                    subtitle="Gestiona la barra informativa que aparece en el tope de tu web"
                                    compact
                                />
                                
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-800">Estado del Banner</h5>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Activar o desactivar en la web</p>
                                            </div>
                                            <label className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${config.banner?.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={config.banner?.enabled}
                                                    onChange={e => setConfig({ ...config, banner: { ...config.banner, enabled: e.target.checked } })}
                                                />
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.banner?.enabled ? 'left-7' : 'left-1'}`}></div>
                                            </label>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Contenido</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={() => setConfig({ ...config, banner: { ...config.banner, type: 'offers' } })}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${config.banner?.type === 'offers' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                                                >
                                                    <Gift size={20} />
                                                    <span className="text-[10px] font-black uppercase">Rotar Ofertas</span>
                                                </button>
                                                <button 
                                                    onClick={() => setConfig({ ...config, banner: { ...config.banner, type: 'custom' } })}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${config.banner?.type === 'custom' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                                                >
                                                    <Type size={20} />
                                                    <span className="text-[10px] font-black uppercase">Texto Manual</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`space-y-6 transition-all duration-500 ${config.banner?.type === 'custom' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje Personalizado</label>
                                            <input
                                                value={config.banner?.customText || ''}
                                                onChange={e => setConfig({ ...config, banner: { ...config.banner, customText: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
                                                placeholder="Ej: ¡Gran inauguración! 20% Dto en todo..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link del Banner (Opcional)</label>
                                            <input
                                                value={config.banner?.customLink || ''}
                                                onChange={e => setConfig({ ...config, banner: { ...config.banner, customLink: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
                                                placeholder="Ej: #ofertas o https://..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color de Fondo (HEX)</label>
                                            <div className="flex gap-3">
                                                <input
                                                    type="color"
                                                    value={config.banner?.backgroundColor || '#0f172a'}
                                                    onChange={e => setConfig({ ...config, banner: { ...config.banner, backgroundColor: e.target.value } })}
                                                    className="w-12 h-12 rounded-xl border-none p-0 overflow-hidden cursor-pointer"
                                                />
                                                <input
                                                    value={config.banner?.backgroundColor || '#0f172a'}
                                                    onChange={e => setConfig({ ...config, banner: { ...config.banner, backgroundColor: e.target.value } })}
                                                    className="flex-grow bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Offers Section Customization */}
                            <div className="space-y-6">
                                <SectionHeader 
                                    title="Sección de Ofertas y Paquetes" 
                                    subtitle="Personaliza el encabezado de tu sección de promociones"
                                    compact
                                />
                                
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título de la Sección</label>
                                        <input
                                            value={config.offers?.title || ''}
                                            onChange={e => setConfig({ ...config, offers: { ...config.offers, title: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="Ej: Paquetes de Bienestar"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtítulo / Badge</label>
                                        <input
                                            value={config.offers?.subtitle || ''}
                                            onChange={e => setConfig({ ...config, offers: { ...config.offers, subtitle: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="Ej: Promociones Exclusivas"
                                        />
                                    </div>
                                </div>
                                
                                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                                    <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                                        💡 <strong>Tip:</strong> Si dejas estos campos vacíos, se usarán los textos predeterminados según tu tipo de negocio y plantilla.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'collage' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="space-y-6">
                                <SectionHeader 
                                    title="Collage de Fotos" 
                                    subtitle="Personaliza tu galería de fotos editorial y selecciona hasta 5 imágenes"
                                    compact
                                />

                                <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título de la Sección</label>
                                        <input
                                            value={config.collage?.title || ''}
                                            onChange={e => setConfig({ ...config, collage: { ...config.collage, title: e.target.value } })}
                                            className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="Ej: L'Art de Vive"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtítulo / Badge</label>
                                        <input
                                            value={config.collage?.subtitle || ''}
                                            onChange={e => setConfig({ ...config, collage: { ...config.collage, subtitle: e.target.value } })}
                                            className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="Ej: Nuestra Inspiración"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[0, 1, 2, 3, 4].map((index) => (
                                        <div key={index} className="space-y-3">
                                            <div className="relative aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
                                                {config.collage?.images[index] ? (
                                                    <>
                                                        <img src={config.collage.images[index]} className="w-full h-full object-cover" alt={`Collage ${index}`} />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button onClick={() => setMediaPickerConfig({ isOpen: true, target: `collage${index}` })} className="p-2 bg-white text-slate-900 rounded-xl shadow-lg"><Upload size={16} /></button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <button onClick={() => setMediaPickerConfig({ isOpen: true, target: `collage${index}` })} className="text-slate-400 hover:text-emerald-600">
                                                        <ImageIcon size={32} />
                                                    </button>
                                                )}
                                            </div>
                                            <input 
                                                value={config.collage?.labels?.[index] || ''}
                                                onChange={e => {
                                                    const newLabels = [...(config.collage?.labels || [])];
                                                    newLabels[index] = e.target.value;
                                                    setConfig({ ...config, collage: { ...config.collage, labels: newLabels } });
                                                }}
                                                placeholder="Texto de la imagen..."
                                                className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-[10px] font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500/10"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'whatsapp' && (
                        <div className="space-y-8 animate-fade-in">
                            <SectionHeader 
                                title="Botón Flotante de WhatsApp" 
                                subtitle="Configura el botón de contacto rápido que aparece en la esquina inferior de tu web"
                                compact
                            />

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <div>
                                            <h5 className="text-sm font-bold text-slate-800">Mostrar Botón</h5>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Activar botón flotante en la web</p>
                                        </div>
                                        <label className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${config.whatsapp?.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={config.whatsapp?.enabled}
                                                onChange={e => setConfig({ ...config, whatsapp: { ...config.whatsapp, enabled: e.target.checked } })}
                                            />
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.whatsapp?.enabled ? 'left-7' : 'left-1'}`}></div>
                                        </label>
                                    </div>

                                    <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                                        <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                                            💡 <strong>Tip para el Número:</strong> El número de WhatsApp se toma de la sección "Datos de Contacto" → "WhatsApp". Si tienes múltiples sedes, los clientes podrán elegir a cuál escribir.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Etiqueta del Botón (Opcional)</label>
                                        <input
                                            value={config.whatsapp?.label || ''}
                                            onChange={e => setConfig({ ...config, whatsapp: { ...config.whatsapp, label: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="Ej: Chat con Asesora"
                                        />
                                        <p className="text-[10px] text-slate-400 italic">Si se deja vacío, se usará el texto automático según tu industria.</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje Predeterminado (Opcional)</label>
                                        <textarea
                                            value={config.whatsapp?.message || ''}
                                            onChange={e => setConfig({ ...config, whatsapp: { ...config.whatsapp, message: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none h-32 resize-none focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="Ej: Hola, me gustaría recibir más información..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'header' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Etiquetas del Menú</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inicio</label>
                                            <input
                                                value={config.header?.homeLabel || 'Inicio'}
                                                onChange={e => setConfig({ ...config, header: { ...config.header, homeLabel: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Servicios / Tratamientos</label>
                                            <input
                                                value={config.header?.servicesLabel || 'Tratamientos'}
                                                onChange={e => setConfig({ ...config, header: { ...config.header, servicesLabel: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paquetes / Ofertas</label>
                                            <input
                                                value={config.header?.bundlesLabel || 'Paquetes'}
                                                onChange={e => setConfig({ ...config, header: { ...config.header, bundlesLabel: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Botón de Reserva (CTA)</label>
                                            <input
                                                value={config.header?.bookingLabel || 'Agendar'}
                                                onChange={e => setConfig({ ...config, header: { ...config.header, bookingLabel: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Información</h4>
                                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-[11px] text-slate-500 leading-relaxed">
                                        Configura los textos que tus clientes verán en la barra de navegación. Para gestionar el <strong>Banner de Anuncios</strong>, usa la nueva sección de "Banners y Ofertas".
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'contact' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de Contacto</label>
                                        <input
                                            type="email"
                                            value={config.contact?.email || ''}
                                            onChange={e => setConfig({ ...config, contact: { ...config.contact, email: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="contacto@empresa.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Público</label>
                                        <input
                                            type="text"
                                            value={config.contact?.phone || ''}
                                            onChange={e => setConfig({ ...config, contact: { ...config.contact, phone: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="+57 300 000 0000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Física</label>
                                        <textarea
                                            value={config.contact?.address || ''}
                                            onChange={e => setConfig({ ...config, contact: { ...config.contact, address: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none h-32 resize-none"
                                            placeholder="Carrera 10 # 20-30, Edificio ProMedid..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'footer' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje del Footer</label>
                                    <textarea
                                        value={config.footer?.description || ''}
                                        onChange={e => setConfig({ ...config, footer: { ...config.footer, description: e.target.value } })}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none h-24 resize-none"
                                        placeholder="Breve mensaje que aparecerá en la parte inferior de la web..."
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Redes Sociales</label>
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">
                                            <Instagram size={18} className="text-slate-400" />
                                            <input
                                                value={config.footer.socialLinks?.instagram || ''}
                                                onChange={e => setConfig({ ...config, footer: { ...config.footer, socialLinks: { ...config.footer.socialLinks, instagram: e.target.value } } })}
                                                className="bg-transparent border-none outline-none text-xs font-bold w-full"
                                                placeholder="URL Instagram"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">
                                            <Facebook size={18} className="text-slate-400" />
                                            <input
                                                value={config.footer.socialLinks?.facebook || ''}
                                                onChange={e => setConfig({ ...config, footer: { ...config.footer, socialLinks: { ...config.footer.socialLinks, facebook: e.target.value } } })}
                                                className="bg-transparent border-none outline-none text-xs font-bold w-full"
                                                placeholder="URL Facebook"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="mt-8"></div>
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">
                                            <Smartphone size={18} className="text-slate-400" />
                                            <input
                                                value={config.footer.socialLinks?.whatsapp || ''}
                                                onChange={e => setConfig({ ...config, footer: { ...config.footer, socialLinks: { ...config.footer.socialLinks, whatsapp: e.target.value } } })}
                                                className="bg-transparent border-none outline-none text-xs font-bold w-full"
                                                placeholder="Número WhatsApp (Ej: 57300...)"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">
                                            <Monitor size={18} className="text-slate-400" />
                                            <input
                                                value={config.footer.copyright || ''}
                                                onChange={e => setConfig({ ...config, footer: { ...config.footer, copyright: e.target.value } })}
                                                className="bg-transparent border-none outline-none text-xs font-bold w-full"
                                                placeholder="Texto de Copyright Ej: 2024 Empresa. Todos los derechos reservados."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'advanced' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
                                        <LinkIcon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-emerald-900 mb-2">Dominio Personalizado</h4>
                                        <p className="text-emerald-700/70 text-sm leading-relaxed mb-6">
                                            Conecta tu propio dominio para fortalecer tu marca personal. Ej: <code className="font-black">www.tu-clinica.com</code>
                                        </p>

                                        <div className="space-y-4 max-w-md">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest ml-1">Tu Dominio</label>
                                                <input
                                                    value={customDomain}
                                                    onChange={e => setCustomDomain(e.target.value)}
                                                    className="w-full bg-white border-2 border-emerald-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-emerald-900/20"
                                                    placeholder="www.ejemplo.com"
                                                />
                                            </div>

                                            <div className="p-4 bg-white/50 rounded-2xl border border-emerald-100/50">
                                                <h5 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    Paso 1: Configuración DNS (Hostinger/GoDaddy)
                                                </h5>
                                                <p className="text-[11px] text-emerald-800/60 leading-normal space-y-2">
                                                    1. Crea un registro <code className="bg-emerald-100 px-1 rounded font-bold text-emerald-900">CNAME</code> con nombre <code className="font-bold text-emerald-900">www</code> apuntando a:
                                                    <br />
                                                    <span className="text-emerald-900 font-bold block mt-1">{window.location.hostname.replace(/^www\./, '')}</span>
                                                    <br />
                                                    2. Crea un registro <code className="bg-emerald-100 px-1 rounded font-bold text-emerald-900">A</code> con nombre <code className="font-bold text-emerald-900">@</code> apuntando a la IP de este servidor.
                                                </p>
                                            </div>

                                            <div className="space-y-2 pt-4 border-t border-emerald-100/50">
                                                <h5 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-3">
                                                    Paso 2: Verificación de Google SEO
                                                </h5>
                                                <div className="space-y-4">
                                                    <p className="text-[11px] text-emerald-800/60 leading-normal">
                                                        Pega aquí el código de verificación de <span className="font-bold">Google Search Console</span> (Meta Tag):
                                                    </p>
                                                    <input
                                                        value={seoVerificationCode}
                                                        onChange={e => setSeoVerificationCode(e.target.value)}
                                                        className="w-full bg-white border-2 border-emerald-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-emerald-900/20"
                                                        placeholder="google-site-verification=..."
                                                    />
                                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                        <p className="text-[10px] text-amber-800 font-medium">
                                                            <strong>Tip:</strong> Ve a Search Console, añade tu propiedad y elige el método "Etiqueta HTML". Copia el valor de <code>content="..."</code> y pégalo aquí.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'seo' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
                                        <Type size={24} />
                                    </div>
                                    <div className="w-full">
                                        <h4 className="text-lg font-bold text-emerald-900 mb-2">Personalización de Pestaña (SEO)</h4>
                                        <p className="text-emerald-700/70 text-sm leading-relaxed mb-6">
                                            Edita cómo se ve tu página en las pestañas del navegador y al compartirse.
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest ml-1">Título de la Web</label>
                                                <input
                                                    value={config.metadata?.title || ''}
                                                    onChange={e => setConfig({ ...config, metadata: { ...config.metadata, title: e.target.value } })}
                                                    className="w-full bg-white border-2 border-emerald-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-emerald-900/20"
                                                    placeholder="Ej: Mi Empresa | Los Mejores Servicios"
                                                />
                                                <p className="text-[10px] text-emerald-800/60 mt-2 px-2">
                                                    Si lo dejas en blanco, se usará el nombre de tu empresa.
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest ml-1">Icono de Pestaña (Favicon)</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-emerald-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                                                        {config.metadata?.faviconUrl ? (
                                                            <>
                                                                <img src={config.metadata.faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
                                                                <button onClick={() => setConfig({ ...config, metadata: { ...config.metadata, faviconUrl: '' } })} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <CloseIcon size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <ImageIcon className="text-emerald-900/20" size={24} />
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setMediaPickerConfig({ isOpen: true, target: 'favicon' })}
                                                        className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-xl transition-colors"
                                                    >
                                                        Elegir Icono
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-emerald-800/60 mt-2 px-2">
                                                    Se recomienda una imagen cuadrada.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <MediaPicker
                isOpen={mediaPickerConfig.isOpen}
                onClose={() => setMediaPickerConfig({ isOpen: false, target: '' })}
                companyId={companyId}
                onSelect={(url) => {
                    if (mediaPickerConfig.target === 'hero') {
                        setConfig({ ...config, hero: { ...config.hero, imageUrl: url } });
                    } else if (mediaPickerConfig.target === 'favicon') {
                        setConfig({ ...config, metadata: { ...config.metadata, faviconUrl: url } });
                    } else if (mediaPickerConfig.target.startsWith('collage')) {
                        const index = parseInt(mediaPickerConfig.target.replace('collage', ''));
                        const newImages = [...(config.collage?.images || [])];
                        newImages[index] = url;
                        setConfig({ ...config, collage: { ...config.collage, images: newImages } });
                    }
                    setMediaPickerConfig({ isOpen: false, target: '' });
                }}
            />
        </div>
    );
};

export default WebsiteManager;
