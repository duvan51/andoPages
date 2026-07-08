import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../shared/SectionHeader';
import { Plus, Edit2, Trash2, ExternalLink, Globe, Layout, ChevronRight, Stethoscope, ShoppingBag, Briefcase, X, MessageCircle, Copy, Check, Link2 } from 'lucide-react';
import LandingEditor from './LandingEditor';
import { LANDING_PRESETS } from '../../../constants/landingPresets';

interface LandingsManagerProps {
    companyId?: string;
}

const LandingsManager: React.FC<LandingsManagerProps> = ({ companyId }) => {
    const [landings, setLandings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingLanding, setEditingLanding] = useState<any>(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [company, setCompany] = useState<any>(null);
    const [copiedStore, setCopiedStore] = useState(false);
    const [copiedCatalog, setCopiedCatalog] = useState(false);

    useEffect(() => {
        if (companyId) {
            fetchLandings();
            fetchCompany();
        }
    }, [companyId]);

    const fetchCompany = async () => {
        if (!companyId) return;
        const { data } = await supabase.from('companies').select('slug, custom_domain, name').eq('id', companyId).maybeSingle();
        if (data) setCompany(data);
    };

    const getBaseUrl = () => {
        if (company?.custom_domain) return `https://${company.custom_domain}`;
        return `https://desarrollandoando.fun/${company?.slug || ''}`;
    };

    const getCatalogUrl = () => `${getBaseUrl()}/catalogo-movile-whatsap`;

    const copyToClipboard = async (text: string, type: 'store' | 'catalog') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'store') {
                setCopiedStore(true);
                setTimeout(() => setCopiedStore(false), 2000);
            } else {
                setCopiedCatalog(true);
                setTimeout(() => setCopiedCatalog(false), 2000);
            }
        } catch (e) {
            console.error('Clipboard error:', e);
        }
    };

    const fetchLandings = async () => {
        if (!companyId) return;
        setIsLoading(true);
        const { data, error } = await supabase
            .from('landings')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (!error && data) setLandings(data);
        setIsLoading(false);
    };

    const handleCreateWithTemplate = async (preset: any) => {
        const title = prompt(`Título para tu landing de ${preset.name}:`);
        if (!title) return;

        const slug = title.toLowerCase().replace(/\s+/g, '-');

        const { error } = await supabase.from('landings').insert({
            title,
            slug,
            company_id: companyId,
            config: {
                ...preset.config,
                hero: { ...preset.config.hero, title }
            }
        });

        if (!error) {
            setShowTemplateModal(false);
            fetchLandings();
        } else {
            alert('Error al crear la landing: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta landing?')) return;
        const { error } = await supabase.from('landings').delete().eq('id', id);
        if (!error) fetchLandings();
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Páginas Landing"
                subtitle="Crea y gestiona páginas de venta personalizadas"
                rightElement={
                    <button
                        onClick={() => setShowTemplateModal(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
                    >
                        <Plus size={20} />
                        Nueva Landing
                    </button>
                }
            />

            {/* Quick Links Card: Tienda + Catálogo WhatsApp */}
            {company && (
                <div className="bg-gradient-to-br from-slate-900 to-[#075e54] rounded-[2rem] p-6 border border-[#128c7e]/30 shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="bg-[#25d366]/20 p-2.5 rounded-2xl">
                            <Link2 size={20} className="text-[#25d366]" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm uppercase tracking-wider">Links de tu Tienda</h3>
                            <p className="text-slate-400 text-xs font-semibold">Comparte estos links con tus clientes o en WhatsApp</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Link Tienda Web */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe size={14} className="text-emerald-400" />
                                <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Tienda Web</span>
                            </div>
                            <p className="text-slate-300 text-xs font-mono mb-3 truncate">{getBaseUrl()}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyToClipboard(getBaseUrl(), 'store')}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                        copiedStore
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10'
                                    }`}
                                >
                                    {copiedStore ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedStore ? 'Copiado!' : 'Copiar'}
                                </button>
                                <a
                                    href={getBaseUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10 transition-all"
                                >
                                    <ExternalLink size={12} />
                                    Abrir
                                </a>
                            </div>
                        </div>

                        {/* Link Catálogo WhatsApp */}
                        <div className="bg-[#25d366]/10 border border-[#25d366]/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageCircle size={14} className="text-[#25d366]" />
                                <span className="text-[#25d366] font-black text-[10px] uppercase tracking-widest">Catálogo WhatsApp In-App</span>
                            </div>
                            <p className="text-slate-300 text-xs font-mono mb-3 truncate">{getCatalogUrl()}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyToClipboard(getCatalogUrl(), 'catalog')}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                        copiedCatalog
                                            ? 'bg-[#25d366]/30 text-[#25d366] border border-[#25d366]/40'
                                            : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10'
                                    }`}
                                >
                                    {copiedCatalog ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedCatalog ? 'Copiado!' : 'Copiar Link'}
                                </button>
                                <a
                                    href={getCatalogUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#25d366]/20 text-[#25d366] hover:bg-[#25d366]/30 border border-[#25d366]/20 transition-all"
                                >
                                    <ExternalLink size={12} />
                                    Abrir
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">Elige un punto de partida</h2>
                                <p className="text-slate-500 font-medium">Selecciona un diseño optimizado según lo que necesites vender.</p>
                            </div>
                            <button onClick={() => setShowTemplateModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 md:p-12 grid md:grid-cols-3 gap-6 bg-slate-50/50">
                            {LANDING_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => handleCreateWithTemplate(preset)}
                                    className="flex flex-col text-left bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-emerald-500 transition-all hover:shadow-xl group"
                                >
                                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        {preset.icon === 'Stethoscope' && <Stethoscope size={32} />}
                                        {preset.icon === 'ShoppingBag' && <ShoppingBag size={32} />}
                                        {preset.icon === 'Briefcase' && <Briefcase size={32} />}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{preset.name}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{preset.description}</p>
                                    <div className="mt-8 flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        Usar este diseño <ChevronRight size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border border-slate-100" />)}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {landings.map((l) => (
                        <div key={l.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                    <Layout size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingLanding(l)}
                                        className="p-2 hover:text-emerald-600 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(l.id)}
                                        className="p-2 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{l.title}</h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                                <Globe size={14} />
                                <span>/{l.slug}</span>
                            </div>
                            <a
                                href={`#landing/${l.slug}`}
                                className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase hover:underline"
                            >
                                Abrir Landing <ExternalLink size={14} />
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {editingLanding && (
                <LandingEditor
                    landing={editingLanding}
                    onClose={() => setEditingLanding(null)}
                    onSave={() => {
                        setEditingLanding(null);
                        fetchLandings();
                    }}
                />
            )}
        </div>
    );
};

export default LandingsManager;
