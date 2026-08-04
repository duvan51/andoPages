import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, Check, AlertCircle, FileText, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    companyId: string;
    categories: any[];
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess, companyId, categories }) => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState(0);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const json: any[] = XLSX.utils.sheet_to_json(ws);

                // Validar estructura básica
                if (json.length === 0) {
                    setError('El archivo está vacío.');
                    return;
                }

                // Normalizar campos (asumiendo cabeceras en español o inglés)
                const normalized = json.map(row => ({
                    title: row.Nombre || row.nombre || row.Title || row.title || '',
                    price: parseFloat(row.Precio || row.precio || row.Price || row.price || '0'),
                    pauta_price: parseFloat(row.Pauta || row.pauta || row.PrecioPauta || row.precio_pauta || row['Precio Pauta'] || row['precio pauta'] || '0'),
                    category: row.Categoria || row.categoria || row.Category || row.category || '',
                    description: row.Descripcion || row.descripcion || row.Description || row.description || '',
                    imageUrl: row.Imagen || row.imagen || row.Image || row.image || '',
                })).filter(item => item.title);

                setData(normalized);
                setError(null);
            } catch (err) {
                setError('Error al procesar el archivo Excel. Asegúrate de que sea un formato válido.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        setIsLoading(true);
        setError(null);
        let count = 0;

        try {
            for (const item of data) {
                const { error: insertError } = await supabase
                    .from('treatments')
                    .upsert({
                        id: `${companyId}-${item.title.toLowerCase().replace(/\s+/g, '-')}`,
                        company_id: companyId,
                        title: item.title,
                        price: item.price,
                        pauta_price: item.pauta_price || 0,
                        category: item.category || categories[0]?.name || 'General',
                        description: item.description,
                        imageUrl: item.imageUrl,
                        active: true
                    });

                if (insertError) {
                    console.error('Error insertando fila:', item.title, insertError);
                } else {
                    count++;
                }
            }

            setSuccessCount(count);
            if (count > 0) {
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            }
        } catch (err: any) {
            setError('Error durante la importación: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadTemplate = () => {
        const wsData = [
            ['Nombre', 'Precio', 'Categoria', 'Descripcion', 'Imagen'],
            ['Limpieza Facial', '150000', 'Estética', 'Tratamiento profundo de la piel', 'https://ejemplo.com/foto.jpg'],
            ['Suero Vitamina C', '120000', 'Sueroterapia', 'Refuerzo inmunológico', '']
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
        XLSX.writeFile(wb, "Plantilla_Productos.xlsx");
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 animate-scale-in max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Importación Masiva</h2>
                        <p className="text-slate-500 font-medium">Sube un archivo Excel para añadir múltiples productos a la vez</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {successCount > 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                            <Check size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">¡Importación Exitosa!</h3>
                        <p className="text-slate-500 font-bold">Se han importado {successCount} productos correctamente.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900">¿No tienes la plantilla?</h4>
                                    <p className="text-blue-700/70 text-sm">Descárgala para ver el formato correcto de las columnas.</p>
                                </div>
                            </div>
                            <button 
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                <Download size={20} />
                                Descargar (.xlsx)
                            </button>
                        </div>

                        {!data.length ? (
                            <div className="flex-grow flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[3rem] p-12 transition-all hover:bg-slate-50 relative group">
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls, .csv" 
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                    <Upload size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Haz clic o arrastra tu archivo aquí</h3>
                                <p className="text-slate-400 text-sm font-medium">Soporta formatos EXCEL (.xlsx, .xls) o CSV</p>
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Vista previa ({data.length} filas encontradas)</h4>
                                    <button onClick={() => setData([])} className="text-red-500 font-bold text-xs uppercase hover:underline">Cambiar archivo</button>
                                </div>
                                <div className="flex-grow overflow-auto rounded-2xl border border-slate-100 custom-scrollbar">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="p-4 font-black text-slate-500 uppercase text-[10px]">Nombre</th>
                                                <th className="p-4 font-black text-slate-500 uppercase text-[10px]">Categoría</th>
                                                <th className="p-4 font-black text-slate-500 uppercase text-[10px]">Precio</th>
                                                <th className="p-4 font-black text-slate-500 uppercase text-[10px]">Precio Pauta</th>
                                                <th className="p-4 font-black text-slate-500 uppercase text-[10px]">Descripción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {data.slice(0, 50).map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50">
                                                    <td className="p-4 font-bold text-slate-900">{row.title}</td>
                                                    <td className="p-4 font-semibold text-emerald-600">{row.category}</td>
                                                    <td className="p-4 font-black font-mono">${row.price.toLocaleString()}</td>
                                                    <td className="p-4 font-black font-mono">${(row.pauta_price || 0).toLocaleString()}</td>
                                                    <td className="p-4 text-slate-500 truncate max-w-[200px]">{row.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {data.length > 50 && (
                                        <div className="p-4 text-center text-slate-400 italic text-xs bg-slate-50 border-t border-slate-100">
                                            Y {data.length - 50} filas más...
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-8 flex gap-4">
                                    <button 
                                        onClick={handleImport}
                                        disabled={isLoading}
                                        className="flex-grow bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Check size={20} />
                                        )}
                                        {isLoading ? 'Importando...' : `Iniciar Importación de ${data.length} Productos`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 animate-shake">
                        <AlertCircle size={20} />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkImportModal;
