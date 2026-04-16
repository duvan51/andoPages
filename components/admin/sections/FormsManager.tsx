
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../shared/SectionHeader';
import { 
    FileText, 
    Link as LinkIcon, 
    MessageSquare, 
    Mail, 
    Download, 
    Search, 
    Trash2, 
    ExternalLink,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Filter,
    Save,
    Settings
} from 'lucide-react';

interface FormsManagerProps {
    companyId?: string;
}

const FormsManager: React.FC<FormsManagerProps> = ({ companyId }) => {
    const [activeTab, setActiveTab] = useState<'config' | 'leads'>('leads');
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [config, setConfig] = useState<any>({
        type: 'contact', // 'contact' | 'newsletter' | 'whatsapp'
        title: '',
        subtitle: '',
        buttonText: '',
        showTerms: true
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (companyId) {
            fetchLeads();
            fetchFormConfig();
        }
    }, [companyId]);

    const fetchLeads = async () => {
        if (!companyId) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFormConfig = async () => {
        if (!companyId) return;
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('config')
                .eq('id', companyId)
                .single();

            if (data?.config?.forms) {
                setConfig({
                    ...config,
                    ...data.config.forms
                });
            }
        } catch (err) {
            console.error('Error fetching form config:', err);
        }
    };

    const handleSaveConfig = async () => {
        if (!companyId) return;
        setIsSaving(true);
        try {
            // Get current config first to merge
            const { data: current } = await supabase
                .from('companies')
                .select('config')
                .eq('id', companyId)
                .single();

            const updatedConfig = {
                ...(current?.config || {}),
                forms: config
            };

            const { error } = await supabase
                .from('companies')
                .update({ config: updatedConfig })
                .eq('id', companyId);

            if (error) throw error;
            alert('Configuración guardada correctamente.');
        } catch (err) {
            console.error('Error saving config:', err);
            alert('Error al guardar la configuración.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este lead?')) return;
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id)
                .eq('company_id', companyId); // Doble verificación de seguridad

            if (error) throw error;
            setLeads(leads.filter(l => l.id !== id));
        } catch (err) {
            alert('Error al eliminar.');
        }
    };

    const filteredLeads = leads.filter(l => 
        (l.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.phone?.includes(searchTerm)) ||
        (l.source?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const exportToCSV = () => {
        if (leads.length === 0) return;
        const headers = ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Fuente', 'Mensaje'];
        const rows = filteredLeads.map(l => [
            new Date(l.created_at).toLocaleString(),
            l.name || 'N/A',
            l.email || 'N/A',
            l.phone || 'N/A',
            l.source || 'N/A',
            (l.message || '').replace(/\n/g, ' ')
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `leads_${companyId}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <SectionHeader 
                title="Gestión de Formularios y Leads" 
                subtitle="Configura tus formularios de captación y gestiona tus clientes potenciales"
                rightElement={
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        <button 
                            onClick={() => setActiveTab('leads')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Mail size={14} /> Leads
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">{leads.length}</span>
                            </div>
                        </button>
                        <button 
                            onClick={() => setActiveTab('config')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Settings size={14} /> Configuración
                            </div>
                        </button>
                    </div>
                }
            />

            {activeTab === 'leads' ? (
                <div className="space-y-6">
                    {/* Filters and Actions */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por email, nombre o fuente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/10"
                            />
                        </div>
                        <button 
                            onClick={exportToCSV}
                            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                        >
                            <Download size={16} /> Exportar CSV
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredLeads.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Filter size={32} />
                                    </div>
                                    <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">No hay resultados</h3>
                                    <p className="text-slate-500 font-bold text-xs mt-2">No se han encontrado leads con los criterios de búsqueda.</p>
                                </div>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <div key={lead.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-slate-900">{lead.name || 'Sin Nombre'}</h4>
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest">
                                                        {lead.source}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail size={12} className="text-slate-300" />
                                                        {lead.email || 'N/A'}
                                                    </div>
                                                    {lead.phone && (
                                                       <div className="flex items-center gap-1.5">
                                                           <MessageSquare size={12} className="text-slate-300" />
                                                           {lead.phone}
                                                       </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} className="text-slate-300" />
                                                        {new Date(lead.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="hidden lg:block max-w-xs overflow-hidden">
                                                <p className="text-[10px] text-slate-400 italic line-clamp-2">{lead.message}</p>
                                            </div>
                                            <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => lead.phone && window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
                                                    className="p-3 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    title="Contactar por WhatsApp"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteLead(lead.id)}
                                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Eliminar Lead"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 space-y-10">
                        {/* Selector de Tipo de Formulario */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                1. Selecciona el Tipo de Capatación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'contact', title: 'Contacto Completo', icon: User, desc: 'Nombre, Teléfono, Ciudad y Mensaje.' },
                                    { id: 'newsletter', title: 'Newsletter Mini', icon: Mail, desc: 'Enfocado en suscripción rápida por correo.' },
                                    { id: 'whatsapp', title: 'WhatsApp Directo', icon: MessageSquare, desc: 'Botón que abre chat directo sin formulario.' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setConfig({ ...config, type: type.id })}
                                        className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-3 relative ${config.type === type.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.type === type.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400'}`}>
                                            <type.icon size={20} />
                                        </div>
                                        <div>
                                            <h5 className={`text-sm font-black uppercase tracking-tight ${config.type === type.id ? 'text-emerald-900' : 'text-slate-900'}`}>{type.title}</h5>
                                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-1">{type.desc}</p>
                                        </div>
                                        {config.type === type.id && <div className="absolute top-4 right-4 text-emerald-600"><CheckCircle2 size={20} /></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Personalización de Textos */}
                        <div className="space-y-6 pt-10 border-t border-slate-50">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                2. Personaliza los Textos
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Título del Formulario</label>
                                    <input 
                                        value={config.title}
                                        onChange={e => setConfig({...config, title: e.target.value})}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="Ej: Resolvemos tus dudas"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Subtítulo / Badge</label>
                                    <input 
                                        value={config.subtitle}
                                        onChange={e => setConfig({...config, subtitle: e.target.value})}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="Ej: Estamos para ayudarte"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Texto del Botón (CTA)</label>
                                    <input 
                                        value={config.buttonText}
                                        onChange={e => setConfig({...config, buttonText: e.target.value})}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="Ej: ¡Quiero suscribirme!"
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-8 px-2">
                                    <label className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${config.showTerms ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={config.showTerms}
                                            onChange={e => setConfig({ ...config, showTerms: e.target.checked })}
                                        />
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.showTerms ? 'left-7' : 'left-1'}`}></div>
                                    </label>
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Mostrar políticas de datos</span>
                                </div>
                            </div>
                        </div>

                        {/* Botón de Guardar */}
                        <div className="pt-10 border-t border-slate-50 flex justify-end">
                            <button 
                                onClick={handleSaveConfig}
                                disabled={isSaving}
                                className="bg-emerald-600 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center gap-2"
                            >
                                {isSaving ? 'Guardando...' : <><Save size={16} /> Guardar Configuración</>}
                            </button>
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                         <div className="flex gap-4">
                             <div className="w-10 h-10 bg-white text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm"><FileText size={20} /></div>
                             <div>
                                 <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight mb-1">Nota de Seguridad Multi-Tenant</h4>
                                 <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                                     Toda la información captada por tus formularios está estrictamente aislada. Los datos nunca se cruzan entre empresas. Puedes exportar tus leads en cualquier momento para tu CRM externo.
                                 </p>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormsManager;

