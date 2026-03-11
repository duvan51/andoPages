
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
    MapPin
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
        showLocations: true
    });

    const [customDomain, setCustomDomain] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<'hero' | 'footer' | 'contact' | 'advanced'>('hero');

    useEffect(() => {
        if (companyId) {
            fetchConfig();
        }
    }, [companyId]);

    const fetchConfig = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('companies')
            .select('config, name, custom_domain')
            .eq('id', companyId)
            .single();

        if (!error && data) {
            if (data.custom_domain) setCustomDomain(data.custom_domain);
            if (data.config && Object.keys(data.config).length > 0) {
                // Merge with defaults to ensure all fields exist
                setConfig({
                    hero: { ...config.hero, ...(data.config.hero || {}) },
                    footer: { ...config.footer, ...(data.config.footer || {}) },
                    contact: { ...config.contact, ...(data.config.contact || {}) },
                    showLocations: data.config.showLocations !== undefined ? data.config.showLocations : true
                });
            }
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('companies')
            .update({
                config,
                custom_domain: customDomain || null
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
                        onClick={() => setActiveSection('contact')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'contact' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Smartphone size={18} />
                        Datos de Contacto
                    </button>
                    <button
                        onClick={() => setActiveSection('advanced')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeSection === 'advanced' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <LinkIcon size={18} />
                        Dominio Personalizado
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
                                            value={config.hero.title}
                                            onChange={e => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                            placeholder="Ej: Transforme su salud con nosotros"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtítulo / Badge</label>
                                        <input
                                            value={config.hero.subtitle}
                                            onChange={e => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                            placeholder="Ej: Innovación Médica"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                                        <textarea
                                            value={config.hero.description}
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
                                                    <button onClick={() => setIsMediaPickerOpen(true)} className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition-transform"><Upload size={20} /></button>
                                                    <button onClick={() => setConfig({ ...config, hero: { ...config.hero, imageUrl: '' } })} className="p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"><CloseIcon size={20} /></button>
                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setIsMediaPickerOpen(true)}
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
                                                value={config.hero.buttonText}
                                                onChange={e => setConfig({ ...config, hero: { ...config.hero, buttonText: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Botón Secundario</label>
                                            <input
                                                value={config.hero.secondaryButtonText}
                                                onChange={e => setConfig({ ...config, hero: { ...config.hero, secondaryButtonText: e.target.value } })}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                                            />
                                        </div>
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
                                            value={config.contact.email}
                                            onChange={e => setConfig({ ...config, contact: { ...config.contact, email: e.target.value } })}
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="contacto@empresa.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Público</label>
                                        <input
                                            type="text"
                                            value={config.contact.phone}
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
                                            value={config.contact.address}
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
                                        value={config.footer.description}
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
                                                    Configuración DNS
                                                </h5>
                                                <p className="text-[11px] text-emerald-800/60 leading-normal">
                                                    Para activar tu dominio, crea un registro <code className="font-bold">CNAME</code> apuntando a:
                                                    <br />
                                                    <span className="text-emerald-900 font-bold">promedid.com</span>
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
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                companyId={companyId}
                onSelect={(url) => {
                    setConfig({ ...config, hero: { ...config.hero, imageUrl: url } });
                    setIsMediaPickerOpen(false);
                }}
            />
        </div>
    );
};

export default WebsiteManager;
