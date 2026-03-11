
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../shared/SectionHeader';
import {
    FileText,
    Plus,
    Edit2,
    Trash2,
    Tag,
    Clock,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    Upload,
    X as CloseIcon
} from 'lucide-react';
import MediaPicker from '../shared/MediaPicker';

interface BundlesManagerProps {
    companyId?: string;
}

const BundlesManager: React.FC<BundlesManagerProps> = ({ companyId }) => {
    const [bundles, setBundles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingBundle, setEditingBundle] = useState<any>(null);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

    useEffect(() => {
        fetchBundles();
    }, [companyId]);

    const fetchBundles = async () => {
        setIsLoading(true);
        let query = supabase.from('bundles').select('*').order('created_at', { ascending: false });
        if (companyId) query = query.eq('company_id', companyId);

        const { data, error } = await query;
        if (!error && data) setBundles(data);
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('bundles').upsert({
                ...editingBundle,
                company_id: companyId // AUTO ASSIGN
            });

            if (error) throw error;
            setEditingBundle(null);
            fetchBundles();
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este paquete para siempre?')) return;
        const { error } = await supabase.from('bundles').delete().eq('id', id);
        if (!error) fetchBundles();
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Paquetes y Ofertas"
                subtitle="Crea promociones combinadas y ofertas por tiempo limitado"
                rightElement={
                    <button
                        onClick={() => setEditingBundle({ title: '', bundle_price: '', original_total: '', description: '', imageUrl: '', expiry_date: '' })}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all"
                    >
                        <Plus size={20} />
                        Nuevo Paquete
                    </button>
                }
            />

            {isLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-48 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)}
                </div>
            ) : bundles.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <FileText size={32} />
                    </div>
                    <p className="text-slate-500 font-bold text-lg">No hay paquetes creados</p>
                    <p className="text-slate-400 text-sm">Crea una oferta combinada para aumentar tus ventas.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {bundles.map((b) => (
                        <div key={b.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <Tag size={28} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingBundle(b)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(b.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{b.title}</h3>
                                    <p className="text-sm font-semibold text-slate-500 mt-2 line-clamp-2">{b.description}</p>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio Oferta</p>
                                        <p className="text-2xl font-black text-emerald-600">${b.bundle_price}</p>
                                    </div>
                                    {b.original_total && (
                                        <div className="opacity-50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Antes</p>
                                            <p className="text-lg font-bold text-slate-400 line-through">${b.original_total}</p>
                                        </div>
                                    )}
                                </div>

                                {b.expiry_date && (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                                        <Clock size={12} />
                                        <span>Expira: {new Date(b.expiry_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            {editingBundle && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingBundle(null)}></div>
                    <div className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl p-10 animate-scale-in max-h-[90vh] overflow-y-auto">
                        <h2 className="text-3xl font-black text-slate-900 mb-8">Configurar Paquete</h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título de la Oferta</label>
                                <input required value={editingBundle.title} onChange={e => setEditingBundle({ ...editingBundle, title: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Precio Paquete</label>
                                    <input required value={editingBundle.bundle_price} onChange={e => setEditingBundle({ ...editingBundle, bundle_price: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" placeholder="$ 0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Precio Original (Antes)</label>
                                    <input value={editingBundle.original_total} onChange={e => setEditingBundle({ ...editingBundle, original_total: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" placeholder="$ 0.00" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Expiración (Opcional)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="date" value={editingBundle.expiry_date?.split('T')[0] || ''} onChange={e => setEditingBundle({ ...editingBundle, expiry_date: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-12 p-4 text-sm font-bold outline-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                                <textarea value={editingBundle.description} onChange={e => setEditingBundle({ ...editingBundle, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none h-24 resize-none" placeholder="¿Qué incluye este paquete?" />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Imagen de la Oferta</label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                        {editingBundle.imageUrl ? (
                                            <>
                                                <img src={editingBundle.imageUrl} className="w-full h-full object-cover" alt="Bundle Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingBundle({ ...editingBundle, imageUrl: '' })}
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
                                        Seleccionar Imagen
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingBundle(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl">Cancelar</button>
                                <button type="submit" className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95">Guardar Oferta</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                companyId={companyId}
                onSelect={(url) => {
                    setEditingBundle({ ...editingBundle, imageUrl: url });
                    setIsMediaPickerOpen(false);
                }}
            />
        </div>
    );
};

export default BundlesManager;
