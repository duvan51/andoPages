
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Image as ImageIcon, Plus, X, Search, Check, Upload } from 'lucide-react';

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    companyId?: string;
    title?: string;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ isOpen, onClose, onSelect, companyId, title = "Seleccionar Imagen" }) => {
    const [media, setMedia] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen, companyId]);

    const fetchMedia = async () => {
        setIsLoading(true);
        let query = supabase.from('media').select('*').eq('type', 'image').order('created_at', { ascending: false });
        if (companyId) query = query.eq('company_id', companyId);

        const { data, error } = await query;
        if (!error && data) setMedia(data);
        setIsLoading(false);
    };

    const openUploadWidget = () => {
        if (!(window as any).cloudinary) {
            alert('El widget de carga no está disponible.');
            return;
        }

        (window as any).cloudinary.openUploadWidget(
            {
                cloudName: 'dlkky5xuo',
                uploadPreset: 'promedid_preset',
                sources: ['local', 'url'],
                multiple: false,
                styles: {
                    palette: {
                        window: "#FFFFFF",
                        windowBorder: "#E2E8F0",
                        tabIcon: "#059669",
                        menuIcons: "#10B981",
                        textDark: "#1E293B",
                        textLight: "#FFFFFF",
                        link: "#10B981",
                        action: "#059669",
                        inactiveTabIcon: "#94A3B8",
                        error: "#EF4444",
                        inProgress: "#10B981",
                        complete: "#059669",
                        sourceBg: "#F8FAFC"
                    }
                }
            },
            async (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    const { data, error: dbError } = await supabase.from('media').insert({
                        url: result.info.secure_url,
                        type: result.info.resource_type,
                        public_id: result.info.public_id,
                        name: result.info.original_filename || 'Nuevo Archivo',
                        company_id: companyId
                    }).select().single();

                    if (!dbError && data) {
                        onSelect(data.url);
                        onClose();
                    } else {
                        fetchMedia();
                    }
                }
            }
        );
    };

    if (!isOpen) return null;

    const filteredMedia = media.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
                        <p className="text-slate-500 font-medium">Elige una imagen de tu biblioteca o sube una nueva</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Search & Actions */}
                <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-50">
                    <div className="relative flex-grow w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar en la biblioteca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        />
                    </div>
                    <button
                        onClick={openUploadWidget}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Upload size={20} />
                        Subir Nueva
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                <ImageIcon size={32} />
                            </div>
                            <p className="text-slate-500 font-bold">No se encontraron imágenes</p>
                            <button onClick={openUploadWidget} className="text-emerald-600 font-black mt-2 hover:underline">Subir la primera</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredMedia.map((m) => (
                                <div
                                    key={m.id}
                                    onClick={() => onSelect(m.url)}
                                    className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-emerald-500 transition-all bg-slate-50"
                                >
                                    <img src={m.url} className="w-full h-full object-cover" alt={m.name} />
                                    <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/10 transition-colors flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all">
                                            <Check className="text-emerald-600" size={20} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[9px] font-bold text-white truncate">{m.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaPicker;
