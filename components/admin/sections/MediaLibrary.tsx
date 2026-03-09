
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../shared/SectionHeader';
import { Plus, Trash2, Image as ImageIcon, Video, Filter, Grid } from 'lucide-react';

interface MediaLibraryProps {
    companyId?: string;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ companyId }) => {
    const [media, setMedia] = useState<any[]>([]);
    const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMedia();
    }, [companyId]);

    const fetchMedia = async () => {
        setIsLoading(true);
        let query = supabase.from('media').select('*').order('created_at', { ascending: false });

        // Multi-tenant check (if companyId is provided)
        if (companyId) {
            query = query.eq('company_id', companyId);
        }

        const { data, error } = await query;
        if (!error && data) setMedia(data);
        setIsLoading(false);
    };

    const handleDeleteMedia = async (id: string, publicId: string) => {
        const confirmDelete = confirm(
            "⚠️ ¿ELIMINAR ARCHIVO?\n\nEsta acción eliminará el archivo de tu biblioteca y de los servidores de almacenamiento."
        );

        if (!confirmDelete) return;

        try {
            // 1. Delete from Cloudinary (Simplified for this version)
            // Note: In a real production SaaS, you'd call a backend function to handle signatures securely
            const cloudName = "dlkky5xuo";
            const apiKey = "729758187275154";
            const apiSecret = "0OPoy3ZA3E2QYiQ9HSZNlRQjNnc";
            const timestamp = Math.round(new Date().getTime() / 1000).toString();

            const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
            const signature = (window as any).CryptoJS?.SHA1(stringToSign).toString();

            if (signature) {
                const formData = new FormData();
                formData.set('public_id', publicId);
                formData.set('timestamp', timestamp);
                formData.set('api_key', apiKey);
                formData.set('signature', signature);

                await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                    method: 'POST',
                    body: formData
                });
            }

            // 2. Delete from supabase
            const { error } = await supabase.from('media').delete().eq('id', id);
            if (!error) {
                setMedia(prev => prev.filter(m => m.id !== id));
            } else {
                throw error;
            }
        } catch (err: any) {
            alert('Error en la eliminación: ' + err.message);
        }
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
                        company_id: companyId // Multi-tenancy support
                    }).select();

                    if (!dbError) fetchMedia();
                }
            }
        );
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Biblioteca Media"
                subtitle="Gestiona todas tus imágenes y videos para tus landings y servicios"
                rightElement={
                    <button
                        onClick={openUploadWidget}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        Subir Archivos
                    </button>
                }
            />

            {/* Filter Bar */}
            <div className="bg-white p-2 rounded-2xl border border-slate-100 flex items-center gap-2 shadow-sm">
                <button
                    onClick={() => setMediaFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${mediaFilter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Grid size={14} />
                    Todo
                </button>
                <button
                    onClick={() => setMediaFilter('image')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${mediaFilter === 'image' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <ImageIcon size={14} />
                    Imágenes
                </button>
                <button
                    onClick={() => setMediaFilter('video')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${mediaFilter === 'video' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Video size={14} />
                    Videos
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-square bg-slate-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : media.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <ImageIcon size={32} />
                    </div>
                    <p className="text-slate-500 font-semibold">No hay archivos en tu biblioteca</p>
                    <button onClick={openUploadWidget} className="text-emerald-600 font-bold hover:underline mt-2">Sube tu primer archivo</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {media
                        .filter(m => mediaFilter === 'all' || m.type === mediaFilter)
                        .map(m => (
                            <div key={m.id} className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
                                <div className="aspect-square relative flex items-center justify-center bg-slate-50/50">
                                    {m.type === 'image' ? (
                                        <img src={m.url} className="w-full h-full object-cover" alt={m.name} />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <Video size={32} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Video</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                        <button
                                            onClick={() => handleDeleteMedia(m.id, m.public_id)}
                                            className="w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 text-slate-900 text-[8px] font-black rounded-lg uppercase backdrop-blur-md shadow-sm">
                                        {m.type}
                                    </div>
                                </div>
                                <div className="p-3 border-t border-slate-50">
                                    <p className="text-[10px] font-bold text-slate-600 truncate">{m.name || 'Sin nombre'}</p>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
