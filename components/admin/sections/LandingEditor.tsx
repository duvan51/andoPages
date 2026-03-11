
import React, { useState, useEffect } from 'react';
import {
    X, Save, Smartphone, Monitor, ChevronRight,
    Image as ImageIcon, Upload, Plus, Minus, Trash2,
    Type, Layout, MessageSquare, Target, Palette,
    ChevronDown, ChevronUp, Eye, CreditCard, HelpCircle,
    ZoomIn, ZoomOut, MousePointerClick
} from 'lucide-react';
import LandingPage from '../../LandingPage';
import MediaPicker from '../shared/MediaPicker';
import { supabase } from '../../../lib/supabase';

interface LandingEditorProps {
    landing: any;
    onClose: () => void;
    onSave: (updatedLanding: any) => void;
}

const LandingEditor: React.FC<LandingEditorProps> = ({ landing, onClose, onSave }) => {
    const [editData, setEditData] = useState<any>(JSON.parse(JSON.stringify(landing)));
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
    const [activeSection, setActiveSection] = useState<string>('hero');
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [pickingFor, setPickingFor] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [previewScale, setPreviewScale] = useState(1.25); // Zoom inicial para ver mejor el móvil

    // Configuración inicial si falta algo
    useEffect(() => {
        const defaultConfig = {
            order: ['hero', 'pas', 'solutions', 'carousel', 'collage', 'pricing', 'faq', 'socialProof', 'cta', 'footer'],
            hero: { title: landing.title, subtitle: '', imageUrl: '' },
            pas: { title: '¿Te sientes identificado?', problem1: '', problem2: '', problem3: '' },
            solutions: [],
            carousel: { images: [], height: { mobile: '250px', desktop: '400px' } },
            collage: { images: [], height: { mobile: 'auto', desktop: 'auto' } },
            socialProof: { testimonials: [], logos: [] },
            cta: { title: '¿Listo para empezar?', urgencyText: '', buttonText: '¡Quiero mi cita!' },
            floatingAction: { type: 'whatsapp', style: 'circle', label: '¡Hablemos por WhatsApp! 👋', color: '#25D366', whatsappMessage: '' },
            styles: {
                heroAlignment: 'left',
                pasAlignment: 'center',
                solutionAlignment: 'left',
                ctaAlignment: 'center',
                heroLayout: { mobile: 'col', desktop: 'row' },
                pasLayout: { mobile: 'col' },
                solutionsLayout: { desktop: 'row' },
                socialProofCols: { desktop: 3 },
                socialProofLayout: { mobile: 'col' }
            },
            visibility: {
                hero: true, pas: true, solutions: true, carousel: true, collage: true, socialProof: true, cta: true, footer: true, whatsapp: true, floatingAction: true
            }
        };

        setEditData({
            ...landing,
            config: {
                ...defaultConfig,
                ...landing.config,
                order: landing.config?.order || defaultConfig.order,
                styles: { ...defaultConfig.styles, ...(landing.config?.styles || {}) },
                visibility: { ...defaultConfig.visibility, ...(landing.config?.visibility || {}) }
            }
        });
    }, [landing]);

    const handleUpdate = (path: string, value: any) => {
        const newData = { ...editData };
        const parts = path.split('.');
        let current = newData;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]] && isNaN(Number(parts[i + 1]))) {
                current[parts[i]] = {};
            } else if (!current[parts[i]]) {
                current[parts[i]] = [];
            }
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        setEditData({ ...newData });
    };

    // Helper para actualizar profundamente el estado (más seguro)
    const updateConfig = (path: string, value: any) => {
        setEditData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const parts = path.split('.');
            let current = newData;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                // Si el nivel actual no existe o NO es un objeto, lo convertimos en uno
                if (!current[part] || typeof current[part] !== 'object') {
                    current[part] = {};
                }
                current = current[part];
            }
            // Aseguramos que el último nivel sea un objeto antes de asignar
            if (current && typeof current === 'object') {
                current[parts[parts.length - 1]] = value;
            }
            return newData;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('landings')
                .update({
                    title: editData.title,
                    config: editData.config
                })
                .eq('id', editData.id);

            if (error) throw error;
            onSave(editData);
            alert('¡Landing guardada con éxito!');
        } catch (err: any) {
            alert('Error al guardar: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const moveSection = (id: string, dir: 'up' | 'down') => {
        const order = [...(editData.config.order || [])];
        const idx = order.indexOf(id);
        if (idx === -1) return;
        const newIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= order.length) return;
        [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
        updateConfig('config.order', order);
    };

    const SectionToggle = ({ id, icon: Icon, label }: any) => {
        const order = editData.config.order || [];
        const idx = order.indexOf(id);
        const sectionVis = editData.config.visibility?.[id];

        // Normalización: si es booleano, extraemos su estado. Si es objeto, revisamos cada campo.
        const isDesktopOn = typeof sectionVis === 'object' ? sectionVis.desktop !== false : sectionVis !== false;
        const isMobileOn = typeof sectionVis === 'object' ? sectionVis.mobile !== false : sectionVis !== false;

        return (
            <div className="group flex items-center gap-3">
                {idx !== -1 && (
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); moveSection(id, 'up'); }}
                            className={`p-1 rounded-md text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all ${idx === 0 ? 'invisible' : ''}`}
                            title="Mover arriba"
                        >
                            <ChevronUp size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); moveSection(id, 'down'); }}
                            className={`p-1 rounded-md text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all ${idx === order.length - 1 ? 'invisible' : ''}`}
                            title="Mover abajo"
                        >
                            <ChevronDown size={14} />
                        </button>
                    </div>
                )}

                <button
                    onClick={() => setActiveSection(activeSection === id ? '' : id)}
                    className={`flex-1 flex items-center justify-between p-4 rounded-2xl transition-all border ${activeSection === id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors ${activeSection === id ? 'bg-white/20' : 'bg-slate-50'}`}>
                            <Icon size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-left">{label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1.5 items-center mr-2 border-r border-slate-200/20 pr-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateConfig(`config.visibility.${id}`, { desktop: !isDesktopOn, mobile: isMobileOn });
                                }}
                                className={`p-1.5 rounded-lg transform active:scale-90 transition-all ${isDesktopOn ? (activeSection === id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-500') : (activeSection === id ? 'text-white/30' : 'bg-slate-100 text-slate-300')}`}
                                title="Visible en escritorio"
                            >
                                <Monitor size={14} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateConfig(`config.visibility.${id}`, { desktop: isDesktopOn, mobile: !isMobileOn });
                                }}
                                className={`p-1.5 rounded-lg transform active:scale-90 transition-all ${isMobileOn ? (activeSection === id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-500') : (activeSection === id ? 'text-white/30' : 'bg-slate-100 text-slate-300')}`}
                                title="Visible en móvil"
                            >
                                <Smartphone size={14} />
                            </button>
                        </div>
                        {activeSection === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </button>
            </div>
        );
    };

    const FieldLabel = ({ label, fieldKey }: { label: string, fieldKey: string }) => {
        const vis = editData.config.visibility?.[fieldKey] || { mobile: true, desktop: true };
        return (
            <div className="flex items-center justify-between mb-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                <div className="flex gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const currentVis = typeof vis === 'object' ? vis : { desktop: vis, mobile: vis };
                            updateConfig(`config.visibility.${fieldKey}`, { ...currentVis, desktop: !(currentVis.desktop !== false) });
                        }}
                        className={`p-1 rounded transform active:scale-95 transition-all ${vis.desktop !== false ? 'text-emerald-500' : 'text-slate-300'}`}
                    >
                        <Monitor size={12} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const currentVis = typeof vis === 'object' ? vis : { desktop: vis, mobile: vis };
                            updateConfig(`config.visibility.${fieldKey}`, { ...currentVis, mobile: !(currentVis.mobile !== false) });
                        }}
                        className={`p-1 rounded transform active:scale-95 transition-all ${vis.mobile !== false ? 'text-emerald-500' : 'text-slate-300'}`}
                    >
                        <Smartphone size={12} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900 flex flex-col animate-fade-in text-slate-900">
            {/* Top Bar */}
            <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-tighter text-slate-900">Diseñador de Landing</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editData.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                        >
                            <Monitor size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Escritorio</span>
                        </button>
                        <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                        >
                            <Smartphone size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Móvil</span>
                        </button>
                    </div>

                    {previewMode === 'mobile' && (
                        <div className="flex bg-slate-50 p-1 rounded-xl items-center border border-slate-100">
                            <button
                                onClick={() => setPreviewScale(prev => Math.max(0.5, prev - 0.1))}
                                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-emerald-600 transition-all"
                                title="Alejar"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <span className="text-[10px] font-black text-slate-500 min-w-[50px] text-center">
                                {Math.round(previewScale * 100)}%
                            </span>
                            <button
                                onClick={() => setPreviewScale(prev => Math.min(2, prev + 0.1))}
                                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-emerald-600 transition-all"
                                title="Acercar"
                            >
                                <ZoomIn size={16} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black text-sm uppercase shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                        Guardar Landing
                    </button>
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* Left Panel: Editor */}
                <aside className="w-[450px] bg-white border-r border-slate-100 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    <div className="space-y-4 mb-8">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Configuración General</label>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Título Interno</label>
                            <input
                                value={editData.title}
                                onChange={(e) => updateConfig('title', e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500/10"
                            />
                        </div>
                    </div>

                    {/* Section: Header (Fixed initially) */}
                    <div className="space-y-4">
                        <SectionToggle id="header" icon={Layout} label="Cabecera (Header)" />
                        {activeSection === 'header' && (
                            <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                <div className="space-y-1">
                                    <FieldLabel label="Texto del Botón" fieldKey="headerButtonText" />
                                    <input
                                        value={editData.config.header?.buttonText || 'RESERVA AHORA'}
                                        onChange={(e) => updateConfig('config.header.buttonText', e.target.value)}
                                        className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                        placeholder="ej: RESERVA AHORA"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <FieldLabel label="Color del Botón" fieldKey="headerButtonColor" />
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={editData.config.header?.buttonColor || '#10b981'}
                                            onChange={(e) => updateConfig('config.header.buttonColor', e.target.value)}
                                            className="h-10 w-10 rounded-xl cursor-pointer border-none bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={editData.config.header?.buttonColor || '#10b981'}
                                            onChange={(e) => updateConfig('config.header.buttonColor', e.target.value)}
                                            className="flex-grow bg-white border-none rounded-xl p-2 text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Sections */}
                    {(editData.config.order || []).map((sectionId: string) => {
                        if (sectionId === 'hero') return (
                            <div key="hero" className="space-y-4">
                                <SectionToggle id="hero" icon={Layout} label="Portada (Hero)" />
                                {activeSection === 'hero' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        <div className="space-y-1">
                                            <FieldLabel label="Título Impactante" fieldKey="heroTitle" />
                                            <textarea
                                                value={editData.config.hero.title}
                                                onChange={(e) => updateConfig('config.hero.title', e.target.value)}
                                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold h-24 resize-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <FieldLabel label="Subtítulo / Descripción" fieldKey="heroSubtitle" />
                                            <input
                                                value={editData.config.hero.subtitle}
                                                onChange={(e) => updateConfig('config.hero.subtitle', e.target.value)}
                                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <FieldLabel label="Texto del Botón" fieldKey="heroButtonText" />
                                                <input
                                                    value={editData.config.hero.buttonText || '¡Quiero mi Valoración!'}
                                                    onChange={(e) => updateConfig('config.hero.buttonText', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="ej: ¡Quiero mi Valoración!"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <FieldLabel label="Color Botón" fieldKey="heroButtonColor" />
                                                <input
                                                    type="color"
                                                    value={editData.config.hero.buttonColor || '#0f172a'}
                                                    onChange={(e) => updateConfig('config.hero.buttonColor', e.target.value)}
                                                    className="w-full h-10 rounded-xl cursor-pointer border-none bg-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <FieldLabel label="Imagen/Video Hero" fieldKey="heroMedia" />
                                            <div className="relative aspect-video rounded-xl overflow-hidden bg-white border-2 border-dashed border-slate-200 group">
                                                {editData.config.hero.imageUrl ? (
                                                    <img src={editData.config.hero.imageUrl} className="w-full h-full object-cover" alt="Hero" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-4 h-full text-slate-300">
                                                        <ImageIcon size={32} />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => { setPickingFor('config.hero.imageUrl'); setIsMediaPickerOpen(true); }}
                                                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase"
                                                >
                                                    Cambiar Imagen
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );

                        if (sectionId === 'pas') return (
                            <div key="pas" className="space-y-4">
                                <SectionToggle id="pas" icon={MessageSquare} label="Problemas (PAS)" />
                                {activeSection === 'pas' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        <div className="space-y-1">
                                            <FieldLabel label="Título de Sección" fieldKey="pasTitle" />
                                            <input
                                                value={editData.config.pas.title}
                                                onChange={(e) => updateConfig('config.pas.title', e.target.value)}
                                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                            />
                                        </div>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="space-y-1">
                                                <FieldLabel label={`Dolor/Problema ${i}`} fieldKey={`pasProb${i}`} />
                                                <input
                                                    value={editData.config.pas[`problem${i}`]}
                                                    onChange={(e) => updateConfig(`config.pas.problem${i}`, e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );

                        if (sectionId === 'solutions') return (
                            <div key="solutions" className="space-y-4">
                                <SectionToggle id="solutions" icon={Target} label="Beneficios / Soluciones" />
                                {activeSection === 'solutions' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        {(editData.config.solutions || []).map((s: any, i: number) => (
                                            <div key={i} className="bg-white p-4 rounded-xl space-y-3 relative group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                const newList = [...editData.config.solutions];
                                                                newList[i].visibility = { ...(newList[i].visibility || { mobile: true, desktop: true }), desktop: !(newList[i].visibility?.desktop !== false) };
                                                                updateConfig('config.solutions', newList);
                                                            }}
                                                            className={`p-1 rounded transform active:scale-95 transition-all ${(s.visibility?.desktop !== false) ? 'text-emerald-500' : 'text-slate-300'}`}
                                                        >
                                                            <Monitor size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                const newList = [...editData.config.solutions];
                                                                newList[i].visibility = { ...(newList[i].visibility || { mobile: true, desktop: true }), mobile: !(newList[i].visibility?.mobile !== false) };
                                                                updateConfig('config.solutions', newList);
                                                            }}
                                                            className={`p-1 rounded transform active:scale-95 transition-all ${(s.visibility?.mobile !== false) ? 'text-emerald-500' : 'text-slate-300'}`}
                                                        >
                                                            <Smartphone size={12} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newList = [...editData.config.solutions];
                                                            newList.splice(i, 1);
                                                            updateConfig('config.solutions', newList);
                                                        }}
                                                        className="p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <input
                                                    value={s.title}
                                                    onChange={(e) => {
                                                        const newList = [...editData.config.solutions];
                                                        newList[i].title = e.target.value;
                                                        updateConfig('config.solutions', newList);
                                                    }}
                                                    placeholder="Título del beneficio"
                                                    className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-black uppercase"
                                                />
                                                <textarea
                                                    value={s.text}
                                                    onChange={(e) => {
                                                        const newList = [...editData.config.solutions];
                                                        newList[i].text = e.target.value;
                                                        updateConfig('config.solutions', newList);
                                                    }}
                                                    placeholder="Descripción detallada"
                                                    className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold leading-relaxed h-20 resize-none"
                                                />
                                                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                                                    {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-300"><ImageIcon size={20} /></div>}
                                                    <button
                                                        onClick={() => { setPickingFor(`config.solutions.${i}.image`); setIsMediaPickerOpen(true); }}
                                                        className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase"
                                                    >
                                                        Cambiar Imagen
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newList = [...(editData.config.solutions || [])];
                                                newList.push({ title: 'Nueva Solución', text: '', image: '' });
                                                updateConfig('config.solutions', newList);
                                            }}
                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                                        >
                                            <Plus size={14} /> Añadir Beneficio
                                        </button>
                                    </div>
                                )}
                            </div>
                        );

                        if (sectionId === 'carousel') return (
                            <div key="carousel" className="space-y-4">
                                <SectionToggle id="carousel" icon={ImageIcon} label="Galería: Carrusel" />
                                {activeSection === 'carousel' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Altura Desktop</label>
                                                <input
                                                    value={editData.config.carousel?.height?.desktop || '500px'}
                                                    onChange={(e) => updateConfig('config.carousel.height.desktop', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="ej: 500px"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Altura Mobile</label>
                                                <input
                                                    value={editData.config.carousel?.height?.mobile || '300px'}
                                                    onChange={(e) => updateConfig('config.carousel.height.mobile', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="ej: 300px"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {(editData.config.carousel?.images || []).map((img: string, i: number) => (
                                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white group shadow-sm">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            const newList = [...editData.config.carousel.images];
                                                            newList.splice(i, 1);
                                                            updateConfig('config.carousel.images', newList);
                                                        }}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => { setPickingFor(`config.carousel.images.${(editData.config.carousel?.images || []).length}`); setIsMediaPickerOpen(true); }}
                                                className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-white"
                                            >
                                                <Plus size={24} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );

                        if (sectionId === 'collage') return (
                            <div key="collage" className="space-y-4">
                                <SectionToggle id="collage" icon={Layout} label="Galería: Collage Grid" />
                                {activeSection === 'collage' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Altura Desktop</label>
                                                <input
                                                    value={editData.config.collage?.height?.desktop || 'auto'}
                                                    onChange={(e) => updateConfig('config.collage.height.desktop', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="ej: auto o 800px"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Altura Mobile</label>
                                                <input
                                                    value={editData.config.collage?.height?.mobile || 'auto'}
                                                    onChange={(e) => updateConfig('config.collage.height.mobile', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="ej: auto"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {(editData.config.collage?.images || []).map((img: string, i: number) => (
                                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white group shadow-sm">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            const newList = [...editData.config.collage.images];
                                                            newList.splice(i, 1);
                                                            updateConfig('config.collage.images', newList);
                                                        }}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => { setPickingFor(`config.collage.images.${(editData.config.collage?.images || []).length}`); setIsMediaPickerOpen(true); }}
                                                className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-white"
                                            >
                                                <Plus size={24} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );

                        if (sectionId === 'pricing') return (
                            <div key="pricing" className="space-y-4">
                                <SectionToggle id="pricing" icon={CreditCard} label="Planes y Precios" />
                                {activeSection === 'pricing' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        <div className="space-y-4 mb-4 border-b border-slate-200 pb-4">
                                            <div className="space-y-1">
                                                <FieldLabel label="Título de Planes" fieldKey="pricingTitle" />
                                                <input
                                                    value={editData.config.pricing?.title || ''}
                                                    onChange={(e) => updateConfig('config.pricing.title', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="Ej: Planes y Precios"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <FieldLabel label="Subtítulo de Planes" fieldKey="pricingSubtitle" />
                                                <input
                                                    value={editData.config.pricing?.subtitle || ''}
                                                    onChange={(e) => updateConfig('config.pricing.subtitle', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="Ej: Selecciona la mejor opción..."
                                                />
                                            </div>
                                        </div>
                                        {(editData.config.pricing?.plans || []).map((plan: any, i: number) => (
                                            <div key={i} className="bg-white p-4 rounded-xl space-y-3 relative group">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-slate-400">Plan {i + 1}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newList = [...editData.config.pricing.plans];
                                                            newList.splice(i, 1);
                                                            updateConfig('config.pricing.plans', newList);
                                                        }}
                                                        className="p-1 text-red-100 group-hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        value={plan.name}
                                                        onChange={(e) => {
                                                            const newList = [...editData.config.pricing.plans];
                                                            newList[i].name = e.target.value;
                                                            updateConfig('config.pricing.plans', newList);
                                                        }}
                                                        placeholder="Nombre del plan"
                                                        className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold"
                                                    />
                                                    <input
                                                        value={plan.price}
                                                        onChange={(e) => {
                                                            const newList = [...editData.config.pricing.plans];
                                                            newList[i].price = e.target.value;
                                                            updateConfig('config.pricing.plans', newList);
                                                        }}
                                                        placeholder="Precio (ej: 450.000)"
                                                        className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                                    <span className="text-[9px] font-black uppercase text-slate-400">Destacar Plan</span>
                                                    <button
                                                        onClick={() => {
                                                            const newList = editData.config.pricing.plans.map((p: any, idx: number) => ({ ...p, featured: idx === i }));
                                                            updateConfig('config.pricing.plans', newList);
                                                        }}
                                                        className={`w-8 h-4 rounded-full relative transition-all ${plan.featured ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${plan.featured ? 'right-0.5' : 'left-0.5'}`}></div>
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={(plan.features || []).join('\n')}
                                                    onChange={(e) => {
                                                        const newList = [...editData.config.pricing.plans];
                                                        newList[i].features = e.target.value.split('\n');
                                                        updateConfig('config.pricing.plans', newList);
                                                    }}
                                                    placeholder="Características (una por línea)"
                                                    className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-medium h-24 resize-none"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newList = [...(editData.config.pricing?.plans || [])];
                                                newList.push({ name: 'Nuevo Plan', price: '0', features: [], featured: false });
                                                updateConfig('config.pricing.plans', newList);
                                            }}
                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                                        >
                                            <Plus size={14} /> Añadir Plan de Precio
                                        </button>
                                    </div>
                                )}
                            </div>
                        );

                        if (sectionId === 'faq') return (
                            <div key="faq" className="space-y-4">
                                <SectionToggle id="faq" icon={HelpCircle} label="Preguntas Frecuentes" />
                                {activeSection === 'faq' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        <div className="space-y-4 mb-4 border-b border-slate-200 pb-4">
                                            <div className="space-y-1">
                                                <FieldLabel label="Título FAQ" fieldKey="faqTitle" />
                                                <input
                                                    value={editData.config.faq?.title || ''}
                                                    onChange={(e) => updateConfig('config.faq.title', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="Ej: Preguntas Frecuentes"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <FieldLabel label="Subtítulo FAQ" fieldKey="faqSubtitle" />
                                                <input
                                                    value={editData.config.faq?.subtitle || ''}
                                                    onChange={(e) => updateConfig('config.faq.subtitle', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="Ej: Resolvemos tus dudas..."
                                                />
                                            </div>
                                        </div>
                                        {(editData.config.faq?.items || []).map((item: any, i: number) => (
                                            <div key={i} className="bg-white p-4 rounded-xl space-y-3 relative group">
                                                <button
                                                    onClick={() => {
                                                        const newList = [...editData.config.faq.items];
                                                        newList.splice(i, 1);
                                                        updateConfig('config.faq.items', newList);
                                                    }}
                                                    className="absolute top-2 right-2 p-1 text-red-100 group-hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <input
                                                    value={item.question}
                                                    onChange={(e) => {
                                                        const newList = [...editData.config.faq.items];
                                                        newList[i].question = e.target.value;
                                                        updateConfig('config.faq.items', newList);
                                                    }}
                                                    placeholder="Pregunta"
                                                    className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-black uppercase"
                                                />
                                                <textarea
                                                    value={item.answer}
                                                    onChange={(e) => {
                                                        const newList = [...editData.config.faq.items];
                                                        newList[i].answer = e.target.value;
                                                        updateConfig('config.faq.items', newList);
                                                    }}
                                                    placeholder="Respuesta"
                                                    className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold leading-relaxed h-20 resize-none"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newList = [...(editData.config.faq?.items || [])];
                                                newList.push({ question: 'Nueva Pregunta', answer: '' });
                                                updateConfig('config.faq.items', newList);
                                            }}
                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                                        >
                                            <Plus size={14} /> Añadir Pregunta
                                        </button>
                                    </div>
                                )}
                            </div>
                        );

                        if (sectionId === 'socialProof') return (
                            <div key="socialProof" className="space-y-4">
                                <SectionToggle id="socialProof" icon={MessageSquare} label="Testimonios / Clientes" />
                                {activeSection === 'socialProof' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        <div className="space-y-1 mb-4 border-b border-slate-200 pb-4">
                                            <FieldLabel label="Título Alianzas/Logos" fieldKey="socialProofLogosTitle" />
                                            <input
                                                value={editData.config.socialProof?.logosTitle || ''}
                                                onChange={(e) => updateConfig('config.socialProof.logosTitle', e.target.value)}
                                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                placeholder="Ej: Nuestras Alianzas Médicas"
                                            />
                                        </div>
                                        {(editData.config.socialProof?.testimonials || []).map((t: any, i: number) => (
                                            <div key={i} className="bg-white p-4 rounded-xl space-y-3 relative group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                const newList = [...editData.config.socialProof.testimonials];
                                                                newList[i].visibility = { ...(newList[i].visibility || { mobile: true, desktop: true }), desktop: !(newList[i].visibility?.desktop !== false) };
                                                                updateConfig('config.socialProof.testimonials', newList);
                                                            }}
                                                            className={`p-1 rounded transform active:scale-95 transition-all ${(t.visibility?.desktop !== false) ? 'text-emerald-500' : 'text-slate-300'}`}
                                                        >
                                                            <Monitor size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                const newList = [...editData.config.socialProof.testimonials];
                                                                newList[i].visibility = { ...(newList[i].visibility || { mobile: true, desktop: true }), mobile: !(newList[i].visibility?.mobile !== false) };
                                                                updateConfig('config.socialProof.testimonials', newList);
                                                            }}
                                                            className={`p-1 rounded transform active:scale-95 transition-all ${(t.visibility?.mobile !== false) ? 'text-emerald-500' : 'text-slate-300'}`}
                                                        >
                                                            <Smartphone size={12} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newList = [...editData.config.socialProof.testimonials];
                                                            newList.splice(i, 1);
                                                            updateConfig('config.socialProof.testimonials', newList);
                                                        }}
                                                        className="p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <input
                                                    value={t.name}
                                                    onChange={(e) => {
                                                        const newList = [...editData.config.socialProof.testimonials];
                                                        newList[i].name = e.target.value;
                                                        updateConfig('config.socialProof.testimonials', newList);
                                                    }}
                                                    placeholder="Nombre del paciente"
                                                    className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-black uppercase"
                                                />
                                                <textarea
                                                    value={t.text}
                                                    onChange={(e) => {
                                                        const newList = [...editData.config.socialProof.testimonials];
                                                        newList[i].text = e.target.value;
                                                        updateConfig('config.socialProof.testimonials', newList);
                                                    }}
                                                    placeholder="Testimonio"
                                                    className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold leading-relaxed h-20 resize-none"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newList = [...(editData.config.socialProof?.testimonials || [])];
                                                newList.push({ name: 'Nuevo Paciente', text: '' });
                                                updateConfig('config.socialProof.testimonials', newList);
                                            }}
                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                                        >
                                            <Plus size={14} /> Añadir Testimonio
                                        </button>
                                    </div>
                                )}
                            </div>
                        );

                        if (sectionId === 'cta') return (
                            <div key="cta" className="space-y-4">
                                <SectionToggle id="cta" icon={Target} label="Llamada a la Acción (CTA)" />
                                {activeSection === 'cta' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <FieldLabel label="Título de Cierre" fieldKey="ctaTitle" />
                                                <input
                                                    value={editData.config.cta?.title || ''}
                                                    onChange={(e) => updateConfig('config.cta.title', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <FieldLabel label="Texto Secundario" fieldKey="ctaText" />
                                                <input
                                                    value={editData.config.cta?.text || ''}
                                                    onChange={(e) => updateConfig('config.cta.text', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-200">
                                            <div className="space-y-1">
                                                <FieldLabel label="Título Formulario" fieldKey="ctaFormTitle" />
                                                <input
                                                    value={editData.config.cta?.formTitle || ''}
                                                    onChange={(e) => updateConfig('config.cta.formTitle', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <FieldLabel label="Subtítulo Formulario" fieldKey="ctaFormSubtitle" />
                                                <input
                                                    value={editData.config.cta?.formSubtitle || ''}
                                                    onChange={(e) => updateConfig('config.cta.formSubtitle', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1 pt-4 border-t border-slate-200">
                                            <FieldLabel label="Beneficios (uno por línea)" fieldKey="ctaBenefits" />
                                            <textarea
                                                value={(editData.config.cta?.benefits || []).join('\n')}
                                                onChange={(e) => updateConfig('config.cta.benefits', e.target.value.split('\n'))}
                                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold h-32 resize-none"
                                                placeholder="✓ Beneficio 1&#10;✓ Beneficio 2..."
                                            />
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-200">
                                            <div className="space-y-1">
                                                <FieldLabel label="Texto de Urgencia" fieldKey="ctaUrgency" />
                                                <input
                                                    value={editData.config.cta.urgencyText}
                                                    onChange={(e) => updateConfig('config.cta.urgencyText', e.target.value)}
                                                    className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    placeholder="Ej: Cupos limitados..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <FieldLabel label="Texto del Botón" fieldKey="ctaButton" />
                                                    <input
                                                        value={editData.config.cta.buttonText}
                                                        onChange={(e) => updateConfig('config.cta.buttonText', e.target.value)}
                                                        className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <FieldLabel label="Color Botón" fieldKey="ctaButtonColor" />
                                                    <input
                                                        type="color"
                                                        value={editData.config.cta.buttonColor || '#10b981'}
                                                        onChange={(e) => updateConfig('config.cta.buttonColor', e.target.value)}
                                                        className="w-full h-10 rounded-xl cursor-pointer border-none bg-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );

                        if (sectionId === 'footer') return (
                            <div key="footer" className="space-y-4">
                                <SectionToggle id="footer" icon={Layout} label="Pie de Página (Footer)" />
                                {activeSection === 'footer' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                        <div className="space-y-1">
                                            <FieldLabel label="Dirección / Ubicación" fieldKey="footerAddress" />
                                            <input
                                                value={editData.config.footer?.address || 'Edificio ICONO, Piso 4'}
                                                onChange={(e) => updateConfig('config.footer.address', e.target.value)}
                                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <FieldLabel label="Teléfono de Contacto" fieldKey="footerPhone" />
                                            <input
                                                value={editData.config.footer?.phone || '+57 311 234 5678'}
                                                onChange={(e) => updateConfig('config.footer.phone', e.target.value)}
                                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <FieldLabel label="Email de Contacto" fieldKey="footerEmail" />
                                            <input
                                                value={editData.config.footer?.email || 'contacto@promedid.com'}
                                                onChange={(e) => updateConfig('config.footer.email', e.target.value)}
                                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1 pt-4 border-t border-slate-100">
                                            <FieldLabel label="Descripción Footer" fieldKey="footerDescription" />
                                            <textarea
                                                value={editData.config.footer?.description || ''}
                                                onChange={(e) => updateConfig('config.footer.description', e.target.value)}
                                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold h-24 resize-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );

                        return null;
                    })}

                    {/* Section: Botón Flotante (FAB) */}
                    <div className="pt-8 border-t border-slate-100 space-y-4">
                        <SectionToggle id="floating" icon={MousePointerClick} label="Botón Acción Flotante" />
                        {activeSection === 'floating' && (
                            <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-slide-down">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Acción</label>
                                    <select
                                        value={editData.config.floatingAction?.type || 'whatsapp'}
                                        onChange={(e) => updateConfig('config.floatingAction.type', e.target.value)}
                                        className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold outline-none"
                                    >
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="scroll">Ir al Formulario (Botón Animado)</option>
                                        <option value="link">Enlace Externo</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Estilo del Botón</label>
                                    <div className="flex bg-white rounded-xl p-1">
                                        {[
                                            { id: 'circle', label: 'Circular' },
                                            { id: 'pill', label: 'Botón Pill' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => updateConfig('config.floatingAction.style', opt.id)}
                                                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${(editData.config.floatingAction?.style || 'circle') === opt.id ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel label="Etiqueta / Nombre" fieldKey="faLabel" />
                                    <input
                                        value={editData.config.floatingAction?.label || ''}
                                        onChange={(e) => updateConfig('config.floatingAction.label', e.target.value)}
                                        className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                        placeholder="ej: ¡Hablemos! 👋"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel label="Color del Botón" fieldKey="faColor" />
                                    <input
                                        type="color"
                                        value={editData.config.floatingAction?.color || '#25D366'}
                                        onChange={(e) => updateConfig('config.floatingAction.color', e.target.value)}
                                        className="w-full h-10 rounded-xl cursor-pointer border-none bg-transparent"
                                    />
                                </div>

                                {editData.config.floatingAction?.type === 'whatsapp' ? (
                                    <div className="space-y-2">
                                        <FieldLabel label="Mensaje Preconfigurado" fieldKey="faMsg" />
                                        <textarea
                                            value={editData.config.floatingAction?.whatsappMessage || ''}
                                            onChange={(e) => updateConfig('config.floatingAction.whatsappMessage', e.target.value)}
                                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold h-24 resize-none"
                                            placeholder="Hola! Vengo de la web..."
                                        />
                                    </div>
                                ) : editData.config.floatingAction?.type === 'link' ? (
                                    <div className="space-y-2">
                                        <FieldLabel label="URL del Enlace" fieldKey="faUrl" />
                                        <input
                                            value={editData.config.floatingAction?.url || ''}
                                            onChange={(e) => updateConfig('config.floatingAction.url', e.target.value)}
                                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold"
                                            placeholder="https://ejemplo.com"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                                        <Target size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                                            Al hacer clic, el botón desplazará la página suavemente hasta el <strong>Formulario de Reserva</strong> al final de la landing.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Visibilidad Dispositivos</label>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => updateConfig('config.visibility.floatingAction', {
                                                    desktop: !(editData.config.visibility?.floatingAction?.desktop !== false),
                                                    mobile: editData.config.visibility?.floatingAction?.mobile !== false
                                                })}
                                                className={`p-1 rounded transition-all ${editData.config.visibility?.floatingAction?.desktop !== false ? 'text-emerald-500' : 'text-slate-300'}`}
                                            >
                                                <Monitor size={12} />
                                            </button>
                                            <button
                                                onClick={() => updateConfig('config.visibility.floatingAction', {
                                                    desktop: editData.config.visibility?.floatingAction?.desktop !== false,
                                                    mobile: !(editData.config.visibility?.floatingAction?.mobile !== false)
                                                })}
                                                className={`p-1 rounded transition-all ${editData.config.visibility?.floatingAction?.mobile !== false ? 'text-emerald-500' : 'text-slate-300'}`}
                                            >
                                                <Smartphone size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-white">
                                        <span className="text-[9px] font-black uppercase text-slate-400">¿Solo tras formulario?</span>
                                        <button
                                            onClick={() => updateConfig('config.sticky_whatsapp', !editData.config.sticky_whatsapp)}
                                            className={`w-10 h-5 rounded-full transition-all relative ${editData.config.sticky_whatsapp ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editData.config.sticky_whatsapp ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section: Visual Styles */}
                    <SectionToggle id="styles" icon={Palette} label="Alineación y Disposición" />
                    {activeSection === 'styles' && (
                        <div className="p-4 bg-slate-50 rounded-2xl space-y-6 animate-slide-down">
                            {/* Hero Styles */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sección Portada (Hero)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alineación Texto</label>
                                        <div className="flex bg-white rounded-xl p-1">
                                            {['left', 'center'].map(align => (
                                                <button
                                                    key={align}
                                                    onClick={() => updateConfig('config.styles.heroAlignment', align)}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${editData.config.styles.heroAlignment === align ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                                                >
                                                    {align === 'left' ? 'Izq' : 'Cent'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Disposición (Desktop)</label>
                                        <div className="flex bg-white rounded-xl p-1">
                                            {[
                                                { id: 'row', label: 'Horiz' },
                                                { id: 'col', label: 'Vert' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => updateConfig('config.styles.heroLayout.desktop', opt.id)}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${editData.config.styles.heroLayout?.desktop === opt.id ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PAS Styles */}
                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sección Problemas (PAS)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alineación</label>
                                        <div className="flex bg-white rounded-xl p-1">
                                            {['left', 'center'].map(align => (
                                                <button
                                                    key={align}
                                                    onClick={() => updateConfig('config.styles.pasAlignment', align)}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${editData.config.styles.pasAlignment === align ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                                                >
                                                    {align === 'left' ? 'Izq' : 'Cent'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Disposición (Mobile)</label>
                                        <div className="flex bg-white rounded-xl p-1">
                                            {[
                                                { id: 'row', label: 'Horiz' },
                                                { id: 'col', label: 'Vert' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => updateConfig('config.styles.pasLayout.mobile', opt.id)}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${(editData.config.styles.pasLayout?.mobile || 'col') === opt.id ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Solutions Styles */}
                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sección Beneficios</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alineación Texto</label>
                                        <div className="flex bg-white rounded-xl p-1">
                                            {['left', 'center'].map(align => (
                                                <button
                                                    key={align}
                                                    onClick={() => updateConfig('config.styles.solutionAlignment', align)}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${editData.config.styles.solutionAlignment === align ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                                                >
                                                    {align === 'left' ? 'Izq' : 'Cent'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Disposición (Desktop)</label>
                                        <div className="flex bg-white rounded-xl p-1">
                                            {[
                                                { id: 'row', label: 'Horiz' },
                                                { id: 'col', label: 'Vert' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => updateConfig('config.styles.solutionsLayout.desktop', opt.id)}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${(editData.config.styles.solutionsLayout?.desktop || 'row') === opt.id ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonials Styles */}
                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sección Testimonios</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filas (Desktop)</label>
                                        <div className="flex bg-white rounded-xl p-1">
                                            {[1, 2, 3].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => updateConfig('config.styles.socialProofCols.desktop', val)}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${((editData.config.styles.socialProofCols?.desktop || 3) === val) ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                                                >
                                                    {val} Col
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Layout (Mobile)</label>
                                        <div className="flex bg-white rounded-xl p-1">
                                            {[
                                                { id: 'row', label: 'Horiz' },
                                                { id: 'col', label: 'Vert' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => updateConfig('config.styles.socialProofLayout.mobile', opt.id)}
                                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${(editData.config.styles.socialProofLayout?.mobile || 'col') === opt.id ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Right Panel: Live Preview */}
                <section className="flex-grow bg-slate-100 p-8 flex items-center justify-center overflow-auto custom-scrollbar">
                    <div
                        className={`transition-all duration-500 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-white overflow-hidden relative ${previewMode === 'mobile' ? 'w-[320px] h-[568px] rounded-[2.5rem] border-[8px] border-slate-900 overflow-hidden' : 'w-full h-full rounded-2xl'}`}
                        style={previewMode === 'mobile' ? {
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'center center'
                        } : {}}
                    >
                        {/* Status bar for mobile */}
                        {previewMode === 'mobile' && (
                            <div className="h-6 bg-slate-900 absolute top-0 left-0 right-0 z-50 flex justify-center items-end pb-1">
                                <div className="w-20 h-4 bg-black rounded-full"></div>
                            </div>
                        )}
                        <div className="w-full h-full overflow-y-auto overflow-x-hidden pt-0 custom-scrollbar">
                            <LandingPage
                                previewData={editData}
                                isMobilePreview={previewMode === 'mobile'}
                            />
                        </div>
                    </div>
                </section>
            </div>

            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                companyId={landing.company_id}
                onSelect={(url) => {
                    updateConfig(pickingFor, url);
                    setIsMediaPickerOpen(false);
                }}
            />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default LandingEditor;
