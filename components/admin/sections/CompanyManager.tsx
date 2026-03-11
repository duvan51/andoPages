
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { TEMPLATES } from '../../../constants/templates';
import SectionHeader from '../shared/SectionHeader';
import {
    Plus,
    Globe,
    ExternalLink,
    ShieldCheck,
    Settings,
    Trash2,
    Edit3,
    Search,
    CheckCircle2,
    XCircle,
    Mail,
    Lock,
    Eye,
    Image as ImageIcon,
    Upload,
    X as CloseIcon
} from 'lucide-react';
import { TenantProvider } from '../../../context/TenantContext';
import WebsiteContent from '../../WebsiteContent';
import MediaPicker from '../shared/MediaPicker';

interface CompanyManagerProps {
    onSelectCompany?: (id: string) => void;
    currentCompanyId?: string;
}

const CompanyManager: React.FC<CompanyManagerProps> = ({ onSelectCompany, currentCompanyId }) => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentCompany, setCurrentCompany] = useState<any>({
        name: '',
        slug: '',
        business_type: 'medical',
        template_id: 'medical-modern',
        custom_domain: '',
        admin_email: '',
        admin_password: '',
        primary_color: '#10b981',
        logo_url: '',
        status: 'active'
    });
    const [showPreview, setShowPreview] = useState<string | null>(null);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setCompanies(data);
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('companies').upsert({
                id: currentCompany.id || undefined,
                name: currentCompany.name,
                slug: currentCompany.slug.toLowerCase().replace(/\s+/g, '-'),
                business_type: currentCompany.business_type || 'medical',
                template_id: currentCompany.template_id || 'medical-modern',
                custom_domain: currentCompany.custom_domain || null,
                admin_email: currentCompany.admin_email || null,
                admin_password: currentCompany.admin_password || null,
                primary_color: currentCompany.primary_color,
                logo_url: currentCompany.logo_url || null,
                status: currentCompany.status
            });

            if (error) throw error;
            setIsEditing(false);
            fetchCompanies();
            alert('Configuración de empresa guardada correctamente.');
        } catch (err: any) {
            alert('Error al guardar: ' + err.message);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.custom_domain && c.custom_domain.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            <SectionHeader
                title="Gestión de Empresas y Dominios"
                subtitle="Control central estilo Shopify. Crea subdominios o anexa dominios externos."
                rightElement={
                    <button
                        onClick={() => {
                            setCurrentCompany({
                                name: '',
                                slug: '',
                                custom_domain: '',
                                primary_color: '#10b981',
                                logo_url: '',
                                status: 'active'
                            });
                            setIsEditing(true);
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus size={20} />
                        Nueva Empresa
                    </button>
                }
            />

            {/* Search Bar */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, slug o dominio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold shadow-sm outline-none focus:border-emerald-500/50 transition-all"
                />
            </div>

            {isLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid md:grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredCompanies.map((c) => (
                        <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                                        style={{ backgroundColor: c.primary_color }}
                                    >
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-tight">{c.name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-1">
                                            <ShieldCheck size={14} />
                                            <span className="uppercase tracking-widest">{c.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {onSelectCompany && (
                                        <button
                                            onClick={() => onSelectCompany(c.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentCompanyId === c.id
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                                : 'bg-slate-900 text-white hover:bg-emerald-600'
                                                }`}
                                        >
                                            {currentCompanyId === c.id ? 'Gestionando' : 'Gestionar'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setCurrentCompany(c); setIsEditing(true); }}
                                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Globe size={10} /> Subdominio
                                    </p>
                                    <p className="text-xs font-bold text-slate-600">{c.slug}.tu-dominio.com</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <ExternalLink size={10} /> Dominio Custom
                                    </p>
                                    <p className={`text-xs font-bold ${c.custom_domain ? 'text-slate-600' : 'text-slate-300 italic'}`}>
                                        {c.custom_domain || 'Sin asignar'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Estado: {c.status}</span>
                                </div>
                                <div className="flex gap-4">
                                    <a
                                        href={window.location.hostname === 'localhost'
                                            ? `http://${c.slug}.localhost:${window.location.port || '5173'}`
                                            : `https://${c.slug}.promedid.com`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-black text-slate-900 uppercase hover:text-emerald-600 flex items-center gap-1 transition-colors"
                                    >
                                        <Eye size={12} /> Vista Previa
                                    </a>
                                    {c.custom_domain && (
                                        <a
                                            href={`https://${c.custom_domain}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-black text-emerald-600 uppercase hover:underline flex items-center gap-1"
                                        >
                                            <Globe size={12} /> Web Publicada
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditing(false)}></div>
                    <div className="relative bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl p-10 animate-scale-in max-h-[90vh] overflow-y-auto">
                        <h2 className="text-3xl font-black text-slate-900 mb-8">Configurar Empresa</h2>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                                <input
                                    required
                                    type="text"
                                    value={currentCompany.name}
                                    onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="Ej: Clínica Dental Elite"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Giro de Negocio</label>
                                    <select
                                        value={currentCompany.business_type}
                                        onChange={(e) => setCurrentCompany({ ...currentCompany, business_type: e.target.value, template_id: TEMPLATES.find(t => t.business_type === e.target.value)?.id || '' })}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none appearance-none"
                                    >
                                        <option value="medical">🏥 Clínica Médica</option>
                                        <option value="fashion">👗 Tienda de Moda</option>
                                        <option value="services">🛠️ Otros Servicios</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Elegir Plantilla de Diseño</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {TEMPLATES
                                            .filter(t => t.business_type === currentCompany.business_type)
                                            .map(t => (
                                                <div
                                                    key={t.id}
                                                    onClick={() => {
                                                        setCurrentCompany({ ...currentCompany, template_id: t.id, primary_color: t.primary_color });
                                                    }}
                                                    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${currentCompany.template_id === t.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: t.primary_color }}></div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setShowPreview(t.id); }}
                                                            className="text-[10px] font-black text-emerald-600 uppercase hover:underline"
                                                        >
                                                            Vista Previa
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900 leading-tight">{t.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1 line-clamp-2">{t.description}</p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Logo de la Empresa</label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                        {currentCompany.logo_url ? (
                                            <>
                                                <img src={currentCompany.logo_url} className="w-full h-full object-contain p-2" alt="Logo Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentCompany({ ...currentCompany, logo_url: '' })}
                                                    className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                >
                                                    <CloseIcon size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <ImageIcon className="text-slate-300" size={28} />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsMediaPickerOpen(true)}
                                        className="flex-grow bg-white border-2 border-slate-100 py-4 rounded-2xl text-xs font-black text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload size={16} />
                                        Seleccionar Logo
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subdominio (Slug)</label>
                                    <input
                                        required
                                        type="text"
                                        value={currentCompany.slug}
                                        onChange={(e) => setCurrentCompany({ ...currentCompany, slug: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="ej: clinica-elite"
                                    />
                                    <p className="text-[10px] text-slate-400 ml-1">Será: {currentCompany.slug}.tudominio.com</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Color de Marca</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={currentCompany.primary_color}
                                            onChange={(e) => setCurrentCompany({ ...currentCompany, primary_color: e.target.value })}
                                            className="w-12 h-14 bg-slate-50 border-none rounded-xl p-1 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={currentCompany.primary_color}
                                            onChange={(e) => setCurrentCompany({ ...currentCompany, primary_color: e.target.value })}
                                            className="flex-grow bg-slate-50 border-none rounded-2xl px-4 text-xs font-mono font-bold uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Administrador</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="email"
                                            value={currentCompany.admin_email || ''}
                                            onChange={(e) => setCurrentCompany({ ...currentCompany, admin_email: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl pl-12 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="correo@cliente.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña Admin</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            value={currentCompany.admin_password || ''}
                                            onChange={(e) => setCurrentCompany({ ...currentCompany, admin_password: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl pl-12 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="Clave123*"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dominio Personalizado (Hostinger)</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={currentCompany.custom_domain || ''}
                                        onChange={(e) => setCurrentCompany({ ...currentCompany, custom_domain: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="www.midominio.com"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 ml-1">Apunta el CNAME o A record en Hostinger a tu IP/Server.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
                                >
                                    Guardar Configuración
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowPreview(null)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-4 animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 pb-2">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Vista Previa: {TEMPLATES.find(t => t.id === showPreview)?.name}</h3>
                                <p className="text-slate-500 font-medium">{TEMPLATES.find(t => t.id === showPreview)?.description}</p>
                            </div>
                            <button onClick={() => setShowPreview(null)} className="p-4 hover:bg-slate-50 rounded-full text-slate-400 font-bold transition-colors">✕ Cerrar</button>
                        </div>

                        <div className="flex-grow overflow-y-auto rounded-[2rem] m-2 border border-slate-100 bg-white relative">
                            {/* Simulator Header */}
                            <div className="sticky top-0 z-[310] bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                </div>
                                <div className="bg-slate-100 px-4 py-1 rounded-lg text-[10px] font-bold text-slate-400">
                                    {currentCompany.slug || 'empresa'}.promedid.com
                                </div>
                                <div className="w-12"></div>
                            </div>

                            <div className="w-full">
                                {(() => {
                                    const t = TEMPLATES.find(tmp => tmp.id === showPreview);
                                    if (!t) return null;

                                    const mockTenant = {
                                        id: 'preview-id',
                                        name: currentCompany.name || 'Empresa de Ejemplo',
                                        slug: currentCompany.slug || 'ejemplo',
                                        business_type: t.business_type,
                                        template_id: t.id,
                                        primary_color: t.primary_color,
                                        config: {},
                                        status: 'active'
                                    };

                                    return (
                                        <TenantProvider previewTenant={mockTenant}>
                                            <div className="w-[1200px] origin-top scale-[0.7] -mb-[30%]">
                                                <WebsiteContent isPreview={true} />
                                            </div>
                                        </TenantProvider>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="p-6 flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    const t = TEMPLATES.find(tmp => tmp.id === showPreview);
                                    if (t) setCurrentCompany({ ...currentCompany, template_id: t.id, primary_color: t.primary_color });
                                    setShowPreview(null);
                                }}
                                className="bg-emerald-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
                            >
                                Usar esta Plantilla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logo Media Picker */}
            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                title="Seleccionar Logo de Empresa"
                onSelect={(url) => {
                    setCurrentCompany({ ...currentCompany, logo_url: url });
                    setIsMediaPickerOpen(false);
                }}
            />
        </div>
    );
};

export default CompanyManager;
