
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../shared/SectionHeader';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    Tag,
    DollarSign,
    CheckCircle2,
    MoreVertical,
    Layers,
    Image as ImageIcon,
    Upload,
    X as CloseIcon
} from 'lucide-react';
import MediaPicker from '../shared/MediaPicker';

interface ProductsManagerProps {
    companyId?: string;
}

const CATEGORIES = ['Diagnóstico', 'Sueroterapia', 'Terapias', 'Estética', 'Multivitamínicos'];

const ProductsManager: React.FC<ProductsManagerProps> = ({ companyId }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [pickingFor, setPickingFor] = useState<{ type: 'primary' | 'secondary', index?: number } | null>(null);

    useEffect(() => {
        if (companyId) {
            fetchProducts();
            fetchCategories();
        }
    }, [companyId]);

    const fetchProducts = async () => {
        setIsLoading(true);
        let query = supabase.from('treatments').select('*, treatment_benefits(*)').order('created_at', { ascending: false });
        if (companyId) query = query.eq('company_id', companyId);

        const { data, error } = await query;
        if (!error && data) setProducts(data);
        setIsLoading(false);
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('company_id', companyId)
            .order('name', { ascending: true });

        if (!error && data) setCategories(data);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        const { data, error } = await supabase
            .from('categories')
            .insert({ name: newCategoryName, company_id: companyId })
            .select()
            .single();

        if (!error && data) {
            setCategories([...categories, data]);
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { treatment_benefits, ...productData } = editingProduct;

            // Upsert product
            const { data: savedProduct, error: productError } = await supabase
                .from('treatments')
                .upsert({
                    ...productData,
                    id: productData.id || `${companyId}-${productData.title.toLowerCase().replace(/\s+/g, '-')}`,
                    company_id: companyId
                })
                .select()
                .single();

            if (productError) throw productError;

            // Update benefits
            if (treatment_benefits) {
                await supabase.from('treatment_benefits').delete().eq('treatment_id', savedProduct.id);
                const benefitsToInsert = treatment_benefits
                    .filter((b: any) => b.benefit && b.benefit.trim() !== '')
                    .map((b: any) => ({
                        treatment_id: savedProduct.id,
                        benefit: b.benefit,
                        company_id: companyId
                    }));

                if (benefitsToInsert.length > 0) {
                    await supabase.from('treatment_benefits').insert(benefitsToInsert);
                }
            }

            setEditingProduct(null);
            fetchProducts();
        } catch (err: any) {
            alert('Error al guardar: ' + err.message);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <SectionHeader
                title="Productos y Servicios"
                subtitle="Gestiona tu catálogo de tratamientos y servicios especializados"
                rightElement={
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAddingCategory(true)}
                            className="flex items-center gap-2 bg-white border border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all"
                        >
                            <Layers size={20} />
                            Categorías
                        </button>
                        <button
                            onClick={() => setEditingProduct({
                                title: '',
                                category: categories[0]?.name || '',
                                active: true,
                                price: '',
                                imageUrl: '',
                                secondary_images: [],
                                treatment_benefits: []
                            })}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
                        >
                            <Plus size={20} />
                            Nuevo Producto
                        </button>
                    </div>
                }
            />

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold shadow-sm outline-none focus:border-emerald-500/50"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)}
                </div>
            ) : (
                <div className="grid md:grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredProducts.map((p) => (
                        <div key={p.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 flex gap-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-50 shrink-0 border border-slate-50">
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Package size={40} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block">
                                            {p.category}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingProduct(p)} className="p-2 text-slate-400 hover:text-emerald-600"><Edit2 size={16} /></button>
                                            <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{p.title}</h3>
                                    <p className="text-xs text-slate-500 font-semibold line-clamp-1">{p.subtitle || 'Sin subtítulo'}</p>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-1 text-emerald-600 font-black">
                                        <DollarSign size={14} />
                                        <span className="text-lg">{(p.price || '0').toLocaleString()}</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase ${p.active ? 'text-emerald-500' : 'text-slate-300'}`}>
                                        {p.active ? '• Activo' : '• Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingProduct(null)}></div>
                    <div className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl p-10 animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900">Configurar Producto</h2>
                            <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                                    <input required value={editingProduct.title} onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                                    <select
                                        value={editingProduct.category}
                                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 appearance-none"
                                    >
                                        <option value="">Seleccionar categoría...</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-10 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-6 px-2">
                                    <button type="button" onClick={() => setEditingProduct({ ...editingProduct, active: !editingProduct.active })} className={`w-10 h-5 rounded-full transition-all relative ${editingProduct.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${editingProduct.active ? 'left-5.5' : 'left-0.5'}`}></div>
                                    </button>
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Activo en la web</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Corta</label>
                                    <textarea value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none h-20 resize-none focus:ring-2 focus:ring-emerald-500/10 transition-all" placeholder="Describe brevemente el producto..." />
                                </div>
                            </div>

                            {/* Image Selectors */}
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagen Principal</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                            {editingProduct.imageUrl ? (
                                                <>
                                                    <img src={editingProduct.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                                                        className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                    >
                                                        <CloseIcon size={20} />
                                                    </button>
                                                </>
                                            ) : (
                                                <ImageIcon className="text-slate-300" size={32} />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPickingFor({ type: 'primary' });
                                                setIsMediaPickerOpen(true);
                                            }}
                                            className="flex-grow bg-white border-2 border-slate-100 py-4 rounded-2xl text-xs font-black text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Upload size={16} />
                                            Seleccionar de la Biblioteca
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Galería de Imágenes (Secundarias)</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPickingFor({ type: 'secondary', index: (editingProduct.secondary_images || []).length });
                                                setIsMediaPickerOpen(true);
                                            }}
                                            className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                                        >
                                            + Añadir Foto
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {(editingProduct.secondary_images || []).map((img: string, i: number) => (
                                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 group">
                                                <img src={img} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImgs = editingProduct.secondary_images.filter((_: any, idx: number) => idx !== i);
                                                        setEditingProduct({ ...editingProduct, secondary_images: newImgs });
                                                    }}
                                                    className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                >
                                                    <CloseIcon size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPickingFor({ type: 'secondary', index: (editingProduct.secondary_images || []).length });
                                                setIsMediaPickerOpen(true);
                                            }}
                                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-all bg-slate-50/50"
                                        >
                                            <Plus size={20} />
                                            <span className="text-[8px] font-black uppercase">Subir</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Beneficios Destacados</label>
                                    <button type="button" onClick={() => setEditingProduct({ ...editingProduct, treatment_benefits: [...(editingProduct.treatment_benefits || []), { benefit: '' }] })} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">+ Añadir</button>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {(editingProduct.treatment_benefits || []).map((b: any, i: number) => (
                                        <div key={i} className="flex gap-2">
                                            <input value={b.benefit} onChange={e => {
                                                const newBenefits = [...editingProduct.treatment_benefits];
                                                newBenefits[i].benefit = e.target.value;
                                                setEditingProduct({ ...editingProduct, treatment_benefits: newBenefits });
                                            }} className="flex-grow bg-slate-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500/10" placeholder="Ej: Resultados inmediatos..." />
                                            <button type="button" onClick={() => setEditingProduct({ ...editingProduct, treatment_benefits: editingProduct.treatment_benefits.filter((_: any, idx: number) => idx !== i) })} className="p-2 text-slate-300 hover:text-red-500 transition-colors">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-50">
                                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-[0.98]">Guardar Producto</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Category Manager Modal */}
            {isAddingCategory && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingCategory(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900">Gestionar Categorías</h2>
                            <button onClick={() => setIsAddingCategory(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nueva categoría..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="flex-grow bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <button
                                    onClick={handleAddCategory}
                                    className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {categories.length === 0 ? (
                                    <p className="text-center text-xs text-slate-400 font-bold py-4 italic">No hay categorías. Crea la primera.</p>
                                ) : (
                                    categories.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 group">
                                            <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                                            <button
                                                onClick={async () => {
                                                    await supabase.from('categories').delete().eq('id', cat.id);
                                                    fetchCategories();
                                                }}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsAddingCategory(false)}
                            className="w-full mt-6 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-colors"
                        >
                            Listo
                        </button>
                    </div>
                </div>
            )}

            {/* Global Media Picker */}
            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                companyId={companyId}
                onSelect={(url) => {
                    if (pickingFor?.type === 'primary') {
                        setEditingProduct({ ...editingProduct, imageUrl: url });
                    } else if (pickingFor?.type === 'secondary') {
                        const newImgs = [...(editingProduct.secondary_images || [])];
                        // If index is provided and within range, update it, otherwise push
                        if (pickingFor.index !== undefined) {
                            newImgs[pickingFor.index] = url;
                        } else {
                            newImgs.push(url);
                        }
                        setEditingProduct({ ...editingProduct, secondary_images: newImgs });
                    }
                    setIsMediaPickerOpen(false);
                    setPickingFor(null);
                }}
            />
        </div>
    );
};

export default ProductsManager;
