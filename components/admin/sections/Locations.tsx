
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../shared/SectionHeader';
import { MapPin, Plus, Edit2, Trash2, Power, Users, Map as MapIcon, Image as ImageIcon, Video, Upload, X as CloseIcon } from 'lucide-react';
import MediaPicker from '../shared/MediaPicker';

interface LocationsManagerProps {
    companyId?: string;
}

const LocationsManager: React.FC<LocationsManagerProps> = ({ companyId }) => {
    const [locations, setLocations] = useState<any[]>([]);
    const [editingLocation, setEditingLocation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [mediaType, setMediaType] = useState<'banner' | 'video'>('banner');

    useEffect(() => {
        fetchLocations();
    }, [companyId]);

    const fetchLocations = async () => {
        setIsLoading(true);
        let query = supabase.from('locations').select('*').order('city', { ascending: true });
        if (companyId) query = query.eq('company_id', companyId);

        const { data, error } = await query;
        if (!error && data) setLocations(data);
        setIsLoading(false);
    };

    const handleSaveLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('locations').upsert({
                id: editingLocation.id?.toString().startsWith('nuevo') ? undefined : editingLocation.id,
                city: editingLocation.city,
                name: editingLocation.name,
                address: editingLocation.address,
                phone: editingLocation.phone,
                active: editingLocation.active,
                slots_total: parseInt(editingLocation.slots_total) || 0,
                slots_booked: parseInt(editingLocation.slots_booked) || 0,
                banner_url: editingLocation.banner_url,
                video_url: editingLocation.video_url,
                map_url: editingLocation.map_url,
                company_id: companyId
            });

            if (error) throw error;
            setEditingLocation(null);
            fetchLocations();
        } catch (err: any) {
            alert('Error al guardar: ' + err.message);
        }
    };

    const handleDeleteLocation = async (id: string) => {
        if (!confirm('¿Eliminar esta sede definitivamente?')) return;
        const { error } = await supabase.from('locations').delete().eq('id', id);
        if (!error) fetchLocations();
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Sedes y Disponibilidad"
                subtitle="Configura tus centros de atención y gestiona los cupos para citas"
                rightElement={
                    <button
                        onClick={() => setEditingLocation({ city: '', name: '', address: '', phone: '', active: true, slots_total: 20, slots_booked: 0, banner_url: '', video_url: '', map_url: '', id: `nuevo_${Date.now()}` })}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        Nueva Sede
                    </button>
                }
            />

            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locations.map((loc) => (
                        <div key={loc.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group overflow-hidden flex flex-col">
                            {/* Banner Image */}
                            <div className="h-40 w-full relative bg-slate-100 shrink-0">
                                {loc.banner_url ? (
                                    <img src={loc.banner_url} alt={loc.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <MapPin size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-6 right-6">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${loc.active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                                            {loc.active ? 'Activa' : 'Inactiva'}
                                        </span>
                                        {loc.video_url && (
                                            <div className="w-6 h-6 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                                <Video size={12} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-slate-900 leading-tight">{loc.city}</h3>
                                        <p className="text-sm font-bold text-slate-500">{loc.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingLocation(loc)} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="space-y-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-6 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <MapIcon size={14} className="text-slate-300" />
                                        <span className="truncate">{loc.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-slate-300" />
                                        <span>{loc.slots_booked} / {loc.slots_total} Cupos</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            {editingLocation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingLocation(null)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 animate-scale-in max-h-[90vh] overflow-y-auto">
                        <SectionHeader
                            title={editingLocation.id?.toString().startsWith('nuevo') ? 'Nueva Sede' : 'Editar Sede'}
                            subtitle="Configura todos los detalles de tu ubicación física"
                        />

                        <form onSubmit={handleSaveLocation} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciudad</label>
                                            <input required type="text" value={editingLocation.city} onChange={e => setEditingLocation({ ...editingLocation, city: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20" placeholder="Ej: Bogotá" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Sede</label>
                                            <input required type="text" value={editingLocation.name} onChange={e => setEditingLocation({ ...editingLocation, name: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20" placeholder="Ej: Sede Norte" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Completa</label>
                                        <input required type="text" value={editingLocation.address} onChange={e => setEditingLocation({ ...editingLocation, address: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20" placeholder="Calle 100 # 15-20, Piso 3" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
                                            <input required type="text" value={editingLocation.phone} onChange={e => setEditingLocation({ ...editingLocation, phone: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20" placeholder="+57 300..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Sede</label>
                                            <button
                                                type="button"
                                                onClick={() => setEditingLocation({ ...editingLocation, active: !editingLocation.active })}
                                                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${editingLocation.active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400'}`}
                                            >
                                                {editingLocation.active ? 'Activa / Visible' : 'Inactiva / Oculta'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Users size={14} />
                                            Gestión de Cupos
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 ml-1">Cupos Totales</label>
                                                <input type="number" value={editingLocation.slots_total} onChange={e => setEditingLocation({ ...editingLocation, slots_total: e.target.value })} className="w-full bg-white p-3 rounded-xl border-none outline-none text-sm font-bold" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 ml-1">Ya Agendados</label>
                                                <input type="number" value={editingLocation.slots_booked} onChange={e => setEditingLocation({ ...editingLocation, slots_booked: e.target.value })} className="w-full bg-white p-3 rounded-xl border-none outline-none text-sm font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner de la Sede</label>
                                        <div className="relative aspect-video rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
                                            {editingLocation.banner_url ? (
                                                <>
                                                    <img src={editingLocation.banner_url} className="w-full h-full object-cover" alt="Banner" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button type="button" onClick={() => { setMediaType('banner'); setIsMediaPickerOpen(true); }} className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition-transform"><Upload size={20} /></button>
                                                        <button type="button" onClick={() => setEditingLocation({ ...editingLocation, banner_url: '' })} className="p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"><CloseIcon size={20} /></button>
                                                    </div>
                                                </>
                                            ) : (
                                                <button type="button" onClick={() => { setMediaType('banner'); setIsMediaPickerOpen(true); }} className="flex flex-col items-center gap-3 text-slate-400 hover:text-emerald-600 transition-all">
                                                    <ImageIcon size={40} strokeWidth={1.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Seleccionar Banner</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video de la Sede</label>
                                        <div className="relative aspect-video rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
                                            {editingLocation.video_url ? (
                                                <>
                                                    <video src={editingLocation.video_url} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button type="button" onClick={() => { setMediaType('video'); setIsMediaPickerOpen(true); }} className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition-transform"><Upload size={20} /></button>
                                                        <button type="button" onClick={() => setEditingLocation({ ...editingLocation, video_url: '' })} className="p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"><CloseIcon size={20} /></button>
                                                    </div>
                                                </>
                                            ) : (
                                                <button type="button" onClick={() => { setMediaType('video'); setIsMediaPickerOpen(true); }} className="flex flex-col items-center gap-3 text-slate-400 hover:text-emerald-600 transition-all">
                                                    <Video size={40} strokeWidth={1.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Seleccionar Video</span>
                                                </button>
                                            )}
                                        </div>
                                        <input type="text" value={editingLocation.video_url || ''} onChange={e => setEditingLocation({ ...editingLocation, video_url: e.target.value })} className="w-full bg-slate-50 p-3 rounded-xl border-none outline-none text-[10px] font-bold mt-2" placeholder="O pega una URL externa (YouTube/Vimeo)" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Google Maps</label>
                                        <div className="flex gap-2">
                                            <div className="flex-grow bg-slate-50 rounded-2xl flex items-center px-4">
                                                <MapIcon size={18} className="text-slate-300 mr-3" />
                                                <input type="text" value={editingLocation.map_url || ''} onChange={e => setEditingLocation({ ...editingLocation, map_url: e.target.value })} className="w-full bg-transparent border-none py-4 outline-none text-sm font-bold" placeholder="https://maps.google.com/..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-50">
                                <button type="button" onClick={() => setEditingLocation(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-5 rounded-2xl hover:bg-slate-200 transition-all">Cancelar</button>
                                <button type="submit" className="flex-[2] bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-600/20 uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all active:scale-95">Guardar Cambios</button>
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
                    if (mediaType === 'banner') {
                        setEditingLocation({ ...editingLocation, banner_url: url });
                    } else {
                        setEditingLocation({ ...editingLocation, video_url: url });
                    }
                    setIsMediaPickerOpen(false);
                }}
            />
        </div>
    );
};

export default LocationsManager;
