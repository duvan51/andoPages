import React, { useState } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, Save, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import MediaPicker from './MediaPicker';

interface QuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    companyId: string;
    categories: any[];
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onSuccess, companyId, categories }) => {
    const defaultRow = { title: '', price: '', category: categories[0]?.name || '', description: '', imageUrl: '' };
    const [rows, setRows] = useState<any[]>([{ ...defaultRow }]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

    if (!isOpen) return null;

    const addRow = () => setRows([...rows, { ...defaultRow }]);
    const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));
    const updateRow = (index: number, field: string, value: any) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const handleSaveAll = async () => {
        const validRows = rows.filter(r => r.title.trim() !== '');
        if (validRows.length === 0) {
            setError('Agrega al menos un producto con nombre.');
            return;
        }

        setIsLoading(true);
        setError(null);
        let count = 0;

        try {
            for (const item of validRows) {
                const { error: insertError } = await supabase
                    .from('treatments')
                    .upsert({
                        id: `${companyId}-${item.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
                        company_id: companyId,
                        title: item.title,
                        price: parseFloat(item.price) || 0,
                        category: item.category || categories[0]?.name || 'General',
                        description: item.description,
                        imageUrl: item.imageUrl,
                        active: true
                    });

                if (insertError) {
                    console.error('Error insertando:', item.title, insertError);
                } else {
                    count++;
                }
            }

            onSuccess();
            onClose();
            setRows([{ ...defaultRow }]);
        } catch (err: any) {
            setError('Error al guardar: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl p-10 animate-scale-in max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Carga Rápida (Tipo Excel)</h2>
                        <p className="text-slate-500 font-medium">Escribe o pega tus productos directamente en la tabla</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-auto rounded-3xl border border-slate-100 mb-6 custom-scrollbar bg-slate-50/30">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 w-12"></th>
                                <th className="p-4 font-black text-slate-500 uppercase text-[10px] tracking-widest">Nombre del Producto*</th>
                                <th className="p-4 font-black text-slate-500 uppercase text-[10px] tracking-widest">Imagen</th>
                                <th className="p-4 font-black text-slate-500 uppercase text-[10px] tracking-widest">Categoría</th>
                                <th className="p-4 font-black text-slate-500 uppercase text-[10px] tracking-widest w-40">Precio</th>
                                <th className="p-4 font-black text-slate-500 uppercase text-[10px] tracking-widest">Descripción</th>
                                <th className="p-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((row, index) => (
                                <tr key={index} className="bg-white hover:bg-emerald-50/30 transition-colors">
                                    <td className="p-4 text-slate-300 font-black text-xs text-center">{index + 1}</td>
                                    <td className="p-2">
                                        <div 
                                            onClick={() => {
                                                setActiveRowIndex(index);
                                                setIsMediaPickerOpen(true);
                                            }}
                                            className="w-10 h-10 rounded-lg bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden hover:border-emerald-500 transition-all group"
                                        >
                                            {row.imageUrl ? (
                                                <img src={row.imageUrl} className="w-full h-full object-cover" alt="Thumb" />
                                            ) : (
                                                <ImageIcon size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            value={row.title}
                                            onChange={(e) => updateRow(index, 'title', e.target.value)}
                                            placeholder="Ej: Limpieza Pro"
                                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500/20 rounded-xl p-2 text-sm font-bold outline-none"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select 
                                            value={row.category}
                                            onChange={(e) => updateRow(index, 'category', e.target.value)}
                                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500/20 rounded-xl p-2 text-sm font-bold outline-none appearance-none"
                                        >
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                            <input 
                                                type="number"
                                                value={row.price}
                                                onChange={(e) => updateRow(index, 'price', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-6 p-2 text-sm font-black outline-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            value={row.description}
                                            onChange={(e) => updateRow(index, 'description', e.target.value)}
                                            placeholder="Breve descripción..."
                                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500/20 rounded-xl p-2 text-sm font-medium text-slate-600 outline-none"
                                        />
                                    </td>
                                    <td className="p-4">
                                        {rows.length > 1 && (
                                            <button onClick={() => removeRow(index)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-4 items-center">
                    <button 
                        onClick={addRow}
                        className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                        <Plus size={20} />
                        Nueva Fila
                    </button>
                    
                    <div className="flex-grow"></div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={handleSaveAll}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Save size={20} />
                        )}
                        Guardar todos los productos
                    </button>
                </div>
            </div>

            <MediaPicker 
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                companyId={companyId}
                onSelect={(url) => {
                    if (activeRowIndex !== null) {
                        updateRow(activeRowIndex, 'imageUrl', url);
                    }
                    setIsMediaPickerOpen(false);
                }}
            />
        </div>
    );
};

export default QuickAddModal;
