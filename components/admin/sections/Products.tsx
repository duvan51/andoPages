
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
    X as CloseIcon,
    AlertTriangle
} from 'lucide-react';
import MediaPicker from '../shared/MediaPicker';
import BulkImportModal from '../shared/BulkImportModal';
import QuickAddModal from '../shared/QuickAddModal';

interface ProductsManagerProps {
    companyId?: string;
}

// Removed hardcoded CATEGORIES array to use database categories state

const ProductsManager: React.FC<ProductsManagerProps> = ({ companyId }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [pickingFor, setPickingFor] = useState<{ type: 'primary' | 'secondary' | 'video' | 'variant', index?: number } | null>(null);
    const [productToDelete, setProductToDelete] = useState<{ id: string, title: string } | null>(null);
    
    // Global Tags Management
    const [globalTags, setGlobalTags] = useState<any[]>([]);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

    useEffect(() => {
        if (companyId) {
            fetchProducts();
            fetchCategories();
            fetchGlobalTags();
        }
    }, [companyId]);

    const fetchProducts = async () => {
        if (!companyId) return;
        setIsLoading(true);
        let query = supabase.from('treatments').select('*, treatment_benefits(*)').order('created_at', { ascending: false });
        query = query.eq('company_id', companyId);

        const { data, error } = await query;
        if (!error && data) setProducts(data);
        setIsLoading(false);
    };

    const fetchCategories = async () => {
        if (!companyId) return;
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

    const fetchGlobalTags = async () => {
        if (!companyId) return;
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .eq('company_id', companyId)
            .order('name', { ascending: true });

        if (!error && data) setGlobalTags(data);
    };

    const handleAddGlobalTag = async () => {
        if (!newTagName.trim()) return;

        const { data, error } = await supabase
            .from('tags')
            .insert({ name: newTagName.trim(), company_id: companyId })
            .select()
            .single();

        if (!error && data) {
            setGlobalTags([...globalTags, data]);
            setNewTagName('');
            // setIsAddingTag(false); // keep modal open to add more easily
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { treatment_benefits, ...productData } = editingProduct;

            // Calcular stock total si hay variantes
            let totalStock = productData.stock || 0;
            if (productData.variants && productData.variants.length > 0) {
                totalStock = productData.variants.reduce((acc: number, v: any) => acc + (parseInt(v.stock) || 0), 0);
            }

            // Upsert product
            const { data: savedProduct, error: productError } = await supabase
                .from('treatments')
                .upsert({
                    ...productData,
                    stock: totalStock,
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

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        try {
            // Limpiar relaciones si las hay
            await supabase.from('treatment_benefits').delete().eq('treatment_id', productToDelete.id).eq('company_id', companyId);
            
            const { error } = await supabase.from('treatments').delete().eq('id', productToDelete.id).eq('company_id', companyId);
            if (error) throw error;
            
            fetchProducts();
            setProductToDelete(null);
        } catch (err: any) {
            alert('Error al eliminar el producto: ' + err.message);
            setProductToDelete(null);
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
                    <div className="flex flex-wrap gap-2 justify-end">
                        <button
                            onClick={() => setIsAddingCategory(true)}
                            className="flex items-center gap-2 bg-white border border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all"
                        >
                            <Layers size={20} />
                            Categorías
                        </button>
                        <button
                            onClick={() => setIsAddingTag(true)}
                            className="flex items-center gap-2 bg-white border border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all"
                        >
                            <Tag size={20} />
                            Etiquetas
                        </button>
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all"
                        >
                            <Upload size={20} />
                            Carga Masiva
                        </button>
                        <button
                            onClick={() => setIsQuickAddModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all"
                        >
                            <Plus size={20} />
                            Carga Rápida
                        </button>
                        <button
                            onClick={() => setEditingProduct({
                                title: '',
                                category: categories[0]?.name || '',
                                active: true,
                                price: '',
                                imageUrl: '',
                                secondary_images: [],
                                videos: [],
                                treatment_benefits: [],
                                components: [],
                                tags: [],
                                subtags: []
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
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block">
                                                {p.category}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block ${p.product_type === 'service' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {p.product_type === 'service' ? '🛠️ Servicio' : '📦 Producto'}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingProduct(p)} className="p-2 text-slate-400 hover:text-emerald-600"><Edit2 size={16} /></button>
                                            <button onClick={() => setProductToDelete({ id: p.id, title: p.title })} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{p.title}</h3>
                                    {/* Etiquetas en la tarjeta en lugar del subtítulo */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {(p.tags?.length > 0 || p.subtags?.length > 0) ? (
                                            <>
                                                {(p.tags || []).slice(0, 3).map((t: string, i: number) => (
                                                    <span key={`t-${i}`} className="text-[8px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-bold uppercase tracking-wider truncate max-w-[80px]">
                                                        {t}
                                                    </span>
                                                ))}
                                                {(p.subtags || []).slice(0, 2).map((st: string, i: number) => (
                                                    <span key={`st-${i}`} className="text-[8px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold uppercase tracking-wider truncate max-w-[80px]">
                                                        {st}
                                                    </span>
                                                ))}
                                                {((p.tags?.length || 0) + (p.subtags?.length || 0) > 5) && (
                                                    <span className="text-[8px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md font-bold uppercase tracking-wider">
                                                        +{((p.tags?.length || 0) + (p.subtags?.length || 0)) - 5}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-[10px] text-slate-400 font-medium italic">Sin etiquetas</p>
                                        )}
                                    </div>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Item</label>
                                    <select 
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none"
                                        value={editingProduct.product_type || 'product'}
                                        onChange={e => setEditingProduct({ ...editingProduct, product_type: e.target.value })}
                                    >
                                        <option value="product">📦 Producto Tangible</option>
                                        <option value="service">🛠️ Servicio / Digital</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 pt-6 px-2">
                                    <button type="button" onClick={() => setEditingProduct({ ...editingProduct, active: !editingProduct.active })} className={`w-10 h-5 rounded-full transition-all relative ${editingProduct.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${editingProduct.active ? 'left-5.5' : 'left-0.5'}`}></div>
                                    </button>
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Activo en la web</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio de Venta</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-10 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" />
                                    </div>
                                </div>
                                
                                {editingProduct.product_type === 'product' && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio de Costo</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                <input 
                                                    type="number"
                                                    value={editingProduct.cost_price || 0} 
                                                    onChange={e => setEditingProduct({ ...editingProduct, cost_price: parseFloat(e.target.value) || 0 })} 
                                                    className="w-full bg-slate-50 border-none rounded-2xl pl-10 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU / Código</label>
                                            <input 
                                                value={editingProduct.sku || ''} 
                                                onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })} 
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                                                placeholder="ABC-123"
                                            />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-2 space-y-4 border border-slate-100 p-6 rounded-[32px] bg-slate-50/50">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Variantes (Talla / Color / Stock)</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const newVariants = [...(editingProduct.variants || []), { size: '', color: '', stock: 0 }];
                                                        setEditingProduct({...editingProduct, variants: newVariants});
                                                    }}
                                                    className="text-emerald-600 font-bold text-[10px] uppercase hover:underline"
                                                >
                                                    + Añadir Variante
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {(editingProduct.variants || []).map((variant: any, index: number) => (
                                                    <div key={index} className="grid grid-cols-5 gap-3 items-end bg-white p-3 rounded-2xl border border-slate-100 shadow-sm group/v">
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase">Talla</p>
                                                            <input 
                                                                placeholder="S, M..."
                                                                className="w-full bg-slate-50 border-none rounded-lg py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500/20"
                                                                value={variant.size}
                                                                onChange={e => {
                                                                    const newVariants = [...editingProduct.variants];
                                                                    newVariants[index].size = e.target.value;
                                                                    setEditingProduct({...editingProduct, variants: newVariants});
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase">Color</p>
                                                            <input 
                                                                placeholder="Color..."
                                                                className="w-full bg-slate-50 border-none rounded-lg py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500/20"
                                                                value={variant.color}
                                                                onChange={e => {
                                                                    const newVariants = [...editingProduct.variants];
                                                                    newVariants[index].color = e.target.value;
                                                                    setEditingProduct({...editingProduct, variants: newVariants});
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase">Stock</p>
                                                            <input 
                                                                type="number"
                                                                className="w-full bg-slate-50 border-none rounded-lg py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500/20"
                                                                value={variant.stock}
                                                                onChange={e => {
                                                                    const newVariants = [...editingProduct.variants];
                                                                    newVariants[index].stock = parseInt(e.target.value) || 0;
                                                                    setEditingProduct({...editingProduct, variants: newVariants});
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase">Foto</p>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    setPickingFor({ type: 'variant', index });
                                                                    setIsMediaPickerOpen(true);
                                                                }}
                                                                className="w-full h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden hover:border-emerald-500 transition-all relative group"
                                                            >
                                                                {variant.image_url ? (
                                                                    <>
                                                                        <img src={variant.image_url} alt="" className="w-full h-full object-cover" />
                                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                            <Upload size={10} className="text-white" />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <ImageIcon size={14} className="text-slate-300" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const newVariants = editingProduct.variants.filter((_: any, i: number) => i !== index);
                                                                    setEditingProduct({...editingProduct, variants: newVariants});
                                                                }}
                                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                {(!editingProduct.variants || editingProduct.variants.length === 0) && (
                                                    <p className="text-center py-4 text-slate-400 text-xs italic">No hay variantes definidas. Añade una para controlar stock.</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Corta</label>
                                    <textarea value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none min-h-[160px] resize-y focus:ring-2 focus:ring-emerald-500/10 transition-all" placeholder="Describe brevemente el producto..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Etiquetas (Principal)</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border-none min-h-[56px] items-center">
                                        {(editingProduct.tags || []).map((tag: string, i: number) => (
                                            <span key={i} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 group uppercase tracking-wide">
                                                {tag}
                                                <button type="button" onClick={() => setEditingProduct({ ...editingProduct, tags: editingProduct.tags.filter((_: any, idx: number) => idx !== i) })} className="hover:text-red-500 opacity-50 group-hover:opacity-100"><CloseIcon size={12} /></button>
                                            </span>
                                        ))}
                                        <input 
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault();
                                                    const val = e.currentTarget.value.trim().replace(',', '');
                                                    if (val && !(editingProduct.tags || []).includes(val)) {
                                                        setEditingProduct({ ...editingProduct, tags: [...(editingProduct.tags || []), val] });
                                                    }
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                            placeholder={(editingProduct.tags || []).length === 0 ? "Añadir etiqueta + Enter..." : "Agregar más..."}
                                            className="bg-transparent border-none outline-none text-sm font-bold flex-grow min-w-[120px]" 
                                        />
                                    </div>
                                    {/* Sugerencias de Etiquetas Globales */}
                                    <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                                        {globalTags.filter(t => !(editingProduct.tags || []).includes(t.name)).map(t => (
                                            <button 
                                                key={t.id} 
                                                type="button" 
                                                onClick={() => setEditingProduct({ ...editingProduct, tags: [...(editingProduct.tags || []), t.name] })}
                                                className="text-[10px] px-2 py-1 bg-white border border-emerald-100 text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                                            >
                                                + {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subetiquetas (Filtros)</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border-none min-h-[56px] items-center">
                                        {(editingProduct.subtags || []).map((tag: string, i: number) => (
                                            <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 group uppercase tracking-wide">
                                                {tag}
                                                <button type="button" onClick={() => setEditingProduct({ ...editingProduct, subtags: editingProduct.subtags.filter((_: any, idx: number) => idx !== i) })} className="hover:text-red-500 opacity-50 group-hover:opacity-100"><CloseIcon size={12} /></button>
                                            </span>
                                        ))}
                                        <input 
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault();
                                                    const val = e.currentTarget.value.trim().replace(',', '');
                                                    if (val && !(editingProduct.subtags || []).includes(val)) {
                                                        setEditingProduct({ ...editingProduct, subtags: [...(editingProduct.subtags || []), val] });
                                                    }
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                            placeholder={(editingProduct.subtags || []).length === 0 ? "Añadir subetiqueta + Enter..." : "Agregar más..."}
                                            className="bg-transparent border-none outline-none text-sm font-bold flex-grow min-w-[120px]" 
                                        />
                                    </div>
                                    {/* Sugerencias de Etiquetas Globales para Subetiquetas */}
                                    <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                                        {globalTags.filter(t => !(editingProduct.subtags || []).includes(t.name)).map(t => (
                                            <button 
                                                key={t.id} 
                                                type="button" 
                                                onClick={() => setEditingProduct({ ...editingProduct, subtags: [...(editingProduct.subtags || []), t.name] })}
                                                className="text-[10px] px-2 py-1 bg-white border border-blue-100 text-blue-600 font-bold rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                            >
                                                + {t.name}
                                            </button>
                                        ))}
                                    </div>
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

                                {/* Video Gallery */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Galería de Videos</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPickingFor({ type: 'video', index: (editingProduct.videos || []).length });
                                                setIsMediaPickerOpen(true);
                                            }}
                                            className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                                        >
                                            + Añadir Video
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {(editingProduct.videos || []).map((video: string, i: number) => (
                                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 group">
                                                <video src={video} className="w-full h-full object-cover opacity-50" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newVids = editingProduct.videos.filter((_: any, idx: number) => idx !== i);
                                                        setEditingProduct({ ...editingProduct, videos: newVids });
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
                                                setPickingFor({ type: 'video', index: (editingProduct.videos || []).length });
                                                setIsMediaPickerOpen(true);
                                            }}
                                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-all bg-slate-50/50"
                                        >
                                            <Plus size={20} />
                                            <span className="text-[8px] font-black uppercase">Subir Video</span>
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

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secciones de Información Adicional</label>
                                    <button type="button" onClick={() => setEditingProduct({ ...editingProduct, components: [...(editingProduct.components || []), { name: '', desc: '' }] })} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">+ Añadir Sección</button>
                                </div>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {(editingProduct.components || []).map((c: any, i: number) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-2xl relative border border-slate-100 group">
                                            <button type="button" onClick={() => setEditingProduct({ ...editingProduct, components: editingProduct.components.filter((_: any, idx: number) => idx !== i) })} className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 z-10"><CloseIcon size={12} /></button>
                                            <input value={c.name} onChange={e => {
                                                const newComps = [...editingProduct.components];
                                                newComps[i].name = e.target.value;
                                                setEditingProduct({ ...editingProduct, components: newComps });
                                            }} className="w-full bg-transparent border-b border-slate-200 pb-2 text-sm font-bold text-emerald-600 focus:border-emerald-500 outline-none mb-3" placeholder="Ej: Título (Descripción del procedimiento...)" />
                                            <textarea value={c.desc} onChange={e => {
                                                const newComps = [...editingProduct.components];
                                                newComps[i].desc = e.target.value;
                                                setEditingProduct({ ...editingProduct, components: newComps });
                                            }} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-300 outline-none min-h-[140px] resize-y custom-scrollbar" placeholder="Escribe el texto detallado para esta sección..." />
                                        </div>
                                    ))}
                                    {(!editingProduct.components || editingProduct.components.length === 0) && (
                                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl">
                                            <p className="text-xs text-slate-400 font-bold mb-2">Información extra para Landing Pages</p>
                                            <button type="button" onClick={() => setEditingProduct({ ...editingProduct, components: [{ name: '', desc: '' }] })} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">+ Crear primer bloque</button>
                                        </div>
                                    )}
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
                                                    await supabase.from('categories').delete().eq('id', cat.id).eq('company_id', companyId);
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

            {/* Tags Manager Modal */}
            {isAddingTag && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingTag(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <Tag size={20} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">Gestionar Etiquetas</h2>
                            </div>
                            <button onClick={() => setIsAddingTag(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nueva etiqueta (Ej: Láser, Facial)..."
                                    value={newTagName}
                                    onKeyDown={e => { if (e.key === 'Enter') handleAddGlobalTag(); }}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    className="flex-grow bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <button
                                    onClick={handleAddGlobalTag}
                                    className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {globalTags.length === 0 ? (
                                    <p className="text-center text-xs text-slate-400 font-bold py-4 italic">No hay etiquetas creadas. Crea una para usarla como filtro o badge en tus productos.</p>
                                ) : (
                                    globalTags.map((tag) => (
                                        <div key={tag.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 group">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{tag.name}</span>
                                            <button
                                                onClick={async () => {
                                                    await supabase.from('tags').delete().eq('id', tag.id).eq('company_id', companyId);
                                                    fetchGlobalTags();
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
                            onClick={() => setIsAddingTag(false)}
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
                type={pickingFor?.type === 'video' ? 'video' : 'image'}
                title={pickingFor?.type === 'video' ? 'Seleccionar Video' : 'Seleccionar Imagen'}
                onSelect={(url) => {
                    if (pickingFor?.type === 'primary') {
                        setEditingProduct({ ...editingProduct, imageUrl: url });
                    } else if (pickingFor?.type === 'secondary') {
                        const newImgs = [...(editingProduct.secondary_images || [])];
                        if (pickingFor.index !== undefined) {
                            newImgs[pickingFor.index] = url;
                        } else {
                            newImgs.push(url);
                        }
                        setEditingProduct({ ...editingProduct, secondary_images: newImgs });
                    } else if (pickingFor?.type === 'video') {
                        const newVids = [...(editingProduct.videos || [])];
                        if (pickingFor.index !== undefined) {
                            newVids[pickingFor.index] = url;
                        } else {
                            newVids.push(url);
                        }
                        setEditingProduct({ ...editingProduct, videos: newVids });
                    } else if (pickingFor?.type === 'variant') {
                        const newVariants = [...(editingProduct.variants || [])];
                        if (pickingFor.index !== undefined) {
                            newVariants[pickingFor.index].image_url = url;
                        }
                        setEditingProduct({ ...editingProduct, variants: newVariants });
                    }
                    setIsMediaPickerOpen(false);
                    setPickingFor(null);
                }}
            />

            {/* Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setProductToDelete(null)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-scale-in text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">¿Eliminar Producto?</h2>
                        <p className="text-sm text-slate-500 font-medium mb-8">
                            Estás a punto de eliminar permanentemente <strong>{productToDelete.title}</strong>. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setProductToDelete(null)}
                                className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 bg-red-500 text-white font-black py-4 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Bulk Import Modal */}
            <BulkImportModal 
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSuccess={fetchProducts}
                companyId={companyId || ''}
                categories={categories}
            />
            {/* Quick Add Modal */}
            <QuickAddModal 
                isOpen={isQuickAddModalOpen}
                onClose={() => setIsQuickAddModalOpen(false)}
                onSuccess={fetchProducts}
                companyId={companyId || ''}
                categories={categories}
            />
        </div>
    );
};

export default ProductsManager;
