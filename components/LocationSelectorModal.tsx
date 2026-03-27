
import React from 'react';
import { getWhatsAppLeadUrl } from '../utils/whatsapp';
import { useTenant } from '../hooks/useTenant';
import { supabase } from '../lib/supabase';

interface LocationSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceTitle?: string;
}

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ isOpen, onClose, serviceTitle }) => {
    const { tenant } = useTenant();
    const [locations, setLocations] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (isOpen && tenant) {
            fetchLocations();
        }
    }, [isOpen, tenant]);

    const fetchLocations = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('locations')
            .select('*')
            .eq('company_id', tenant?.id)
            .eq('active', true)
            .order('city', { ascending: true });

        if (data) setLocations(data);
        setLoading(false);
    };

    if (!isOpen) return null;

    const handleSelect = (loc: any) => {
        const url = getWhatsAppLeadUrl({
            serviceTitle,
            location: `${loc.city} - ${loc.name}`,
            phoneNumber: loc.phone
        });
        window.open(url, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>
            <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-scale-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Seleccione su Sede</h2>
                    <p className="text-slate-500 text-sm mt-2">Elija la ciudad más cercana para agendar su cita</p>
                </div>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : locations.length > 0 ? (
                        locations.map((loc) => (
                            <button
                                key={loc.id}
                                onClick={() => handleSelect(loc)}
                                className="w-full py-4 px-6 bg-slate-50 hover:bg-emerald-600 hover:text-white rounded-2xl font-bold text-slate-700 transition-all flex items-center justify-between group text-left"
                            >
                                <div>
                                    <p className="text-xs uppercase tracking-widest opacity-60 mb-0.5">{loc.city}</p>
                                    <p>{loc.name}</p>
                                </div>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 text-sm py-4">No hay sedes disponibles.</p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default LocationSelectorModal;
