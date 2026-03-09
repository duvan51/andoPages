import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../hooks/useTenant';
import { getWhatsAppLeadUrl } from '../utils/whatsapp';

interface Location {
  id: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
  slots_total: number;
  slots_booked: number;
  video_url?: string;
  map_url?: string;
  banner_url?: string;
}

const Locations: React.FC = () => {
  const { tenant } = useTenant();
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (tenant) {
      fetchLocations();
    }
  }, [tenant]);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('company_id', tenant?.id)
      .eq('active', true)
      .order('city', { ascending: true });

    if (!error && data) {
      setLocations(data);
      if (data.length > 0 && !activeTab) {
        setActiveTab(data[0].city);
      }
    }
    setLoading(false);
  };

  const filteredLocations = locations.filter(loc => loc.city === activeTab);
  const cities = Array.from(new Set(locations.map(l => l.city)));

  if (locations.length === 0) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('/').pop()}`;
    return url;
  };

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="text-center mb-16">
        <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Presencia Nacional</h2>
        <h3 className="text-4xl font-bold text-slate-900">Nuestras Sedes en Colombia</h3>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden grid lg:grid-cols-12 min-h-[600px]">
        {/* Navigation */}
        <div className="lg:col-span-4 bg-emerald-50 p-8 border-r border-slate-100">
          <h4 className="text-xl font-bold text-emerald-900 mb-8">Seleccione su ciudad</h4>
          <div className="space-y-3">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setActiveTab(city)}
                className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-between ${activeTab === city
                  ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-200/50 translate-x-2'
                  : 'text-slate-500 hover:bg-white/50'
                  }`}
              >
                {city}
                {activeTab === city && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                )}
              </button>
            ))}
          </div>

          <div className="mt-12 p-6 bg-emerald-100/50 rounded-2xl border border-emerald-200">
            <p className="text-sm font-medium text-emerald-800 leading-relaxed">
              Estamos expandiéndonos continuamente para llevar salud integral a más rincones de Colombia.
            </p>
          </div>
        </div>

        {/* Details and Visual */}
        <div className="lg:col-span-8 p-8 md:p-12">
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {filteredLocations.map(loc => {
                  const availableSlots = loc.slots_total - loc.slots_booked;
                  const isLowAvailability = (availableSlots / loc.slots_total) < 0.3;

                  return (
                    <div key={loc.id} className="p-8 rounded-3xl border-2 border-slate-50 hover:border-emerald-100 transition-colors group relative overflow-hidden flex flex-col">
                      {/* Alerta de Cupos */}
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10 ${isLowAvailability ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                        {availableSlots} Cupos Libres
                      </div>

                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h5 className="text-xl font-bold text-slate-900 mb-2">{loc.name}</h5>
                      <p className="text-slate-500 mb-4 text-sm">{loc.address}</p>
                      <p className="text-emerald-600 font-black mb-6">{loc.phone}</p>

                      <div className="space-y-4 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isLowAvailability ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${(loc.slots_booked / loc.slots_total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disponibilidad</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              if (loc.map_url) window.open(loc.map_url, '_blank');
                              else alert('Esta sede no tiene mapa configurado todavía.');
                            }}
                            className="py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                          >
                            Ver en el mapa
                          </button>
                          {loc.video_url && (
                            <button
                              onClick={() => setSelectedVideo({ url: loc.video_url || '', title: loc.name })}
                              className="py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100 flex items-center justify-center gap-2"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              Ver Video
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            const url = getWhatsAppLeadUrl({
                              location: `${loc.city} - ${loc.name}`,
                              phoneNumber: loc.phone
                            });
                            window.open(url, '_blank');
                          }}
                          className="w-full py-4 bg-[#25D366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#128C7E] transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.125 1.379 4.77 1.38 5.42 0 9.831-4.412 9.833-9.834.001-2.628-1.023-5.1-2.885-6.963-1.862-1.861-4.334-2.885-6.963-2.886-5.422 0-9.835 4.413-9.837 9.835-.001 1.734.457 3.422 1.32 4.904l-.991 3.621 3.71-.973zm11.367-7.335c-.31-.155-1.837-.906-2.121-1.01-.283-.103-.49-.155-.693.155-.203.311-.789 1.01-.967 1.216-.178.207-.356.233-.666.078-.31-.155-1.308-.482-2.492-1.538-.92-.821-1.541-1.835-1.721-2.145-.18-.311-.019-.479.136-.633.139-.139.31-.362.466-.543.155-.181.207-.311.311-.518.103-.207.052-.389-.026-.544-.078-.155-.693-1.671-.949-2.292-.25-.6-.523-.518-.72-.529-.18-.01-.389-.012-.596-.012-.207 0-.544.078-.828.389-.283.311-1.082 1.059-1.082 2.583 0 1.524 1.109 2.997 1.264 3.204.155.207 2.181 3.329 5.283 4.667.738.318 1.314.507 1.762.649.742.236 1.417.203 1.95.123.593-.088 1.837-.751 2.095-1.476.258-.725.258-1.346.181-1.476-.078-.13-.284-.207-.594-.362z" />
                          </svg>
                          Agendar Cita
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative rounded-[3rem] overflow-hidden h-48 md:h-72 shadow-2xl mt-auto group">
              <img
                src={filteredLocations[0]?.banner_url || `https://picsum.photos/seed/${activeTab}/1200/400`}
                alt="City view"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl md:text-7xl font-black text-white/20 uppercase tracking-[1em] select-none translate-x-[0.5em]">{activeTab}</span>
              </div>
              <div className="absolute bottom-6 left-10">
                <p className="text-white/60 text-xs font-black uppercase tracking-widest">Sede principal en</p>
                <p className="text-white text-2xl font-black">{activeTab}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedVideo(null)}></div>
          <div className="relative w-full max-w-[450px] max-h-[90vh] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in">
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all hover:rotate-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="absolute top-8 left-10 z-20 pointer-events-none">
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-2">Tutorial de ubicación</span>
              <h4 className="text-white text-2xl font-bold uppercase tracking-widest">¿Cómo llegar?</h4>
              <p className="text-white/40 text-xs font-bold mt-1">{selectedVideo.title}</p>
            </div>

            <div className="aspect-[9/16] w-full bg-slate-900">
              {isYouTube(selectedVideo.url) ? (
                <iframe
                  src={getEmbedUrl(selectedVideo.url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video src={selectedVideo.url} controls autoPlay className="w-full h-full object-cover"></video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
