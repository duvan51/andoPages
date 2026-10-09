import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const DEFAULT_COMPANY_ID = '733b1f9a-878d-4adc-9a77-1228a3c09df7';

interface LiveStreamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
}

export const LiveStreamManagerModal: React.FC<LiveStreamManagerModalProps> = ({
  isOpen,
  onClose,
  companyId,
}) => {
  const activeCompanyId = companyId || DEFAULT_COMPANY_ID;
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState('¡JESKA Está En Directo! 👗🔥');
  const [subtitle, setSubtitle] = useState('Conéctate para ver prendas en vivo y pedir tu talla.');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Cargar configuración actual de Supabase
  useEffect(() => {
    if (!isOpen) return;
    const fetchLiveSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_live_settings')
        .select('*')
        .eq('company_id', activeCompanyId)
        .maybeSingle();

      if (data && !error) {
        setIsActive(Boolean(data.is_active));
        setTitle(data.title || '¡JESKA Está En Directo! 👗🔥');
        setSubtitle(data.subtitle || '');
        setTiktokUrl(data.tiktok_url || '');
        setInstagramUrl(data.instagram_url || '');
        setFacebookUrl(data.facebook_url || '');
        setYoutubeUrl(data.youtube_url || '');
      }
      setLoading(false);
    };

    fetchLiveSettings();
  }, [isOpen, activeCompanyId]);

  // Guardar cambios en Supabase (Se replica en tiempo real a la app móvil)
  const handleSave = async (overrideActive?: boolean) => {
    setSaving(true);
    setSavedSuccess(false);
    const activeState = overrideActive !== undefined ? overrideActive : isActive;

    const { error } = await supabase
      .from('store_live_settings')
      .upsert({
        company_id: activeCompanyId,
        is_active: activeState,
        title: title.trim(),
        subtitle: subtitle.trim(),
        tiktok_url: tiktokUrl.trim(),
        instagram_url: instagramUrl.trim(),
        facebook_url: facebookUrl.trim(),
        youtube_url: youtubeUrl.trim(),
        updated_at: new Date().toISOString(),
      });

    setSaving(false);

    if (!error) {
      setIsActive(activeState);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      alert('Error guardando configuración: ' + error.message);
    }
  };

  if (!isOpen) return null;

  const activeLinksCount = [tiktokUrl, instagramUrl, facebookUrl, youtubeUrl].filter(
    (url) => url.trim().length > 0
  ).length;

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-up">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🔴</span>
            <div>
              <h2 className="text-lg font-black tracking-wide">CONFIGURACIÓN DE LIVE EN VIVO</h2>
              <p className="text-xs text-white/80">Controla la transmisión en la App Móvil en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contenido / Formulario */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">
              <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Cargando configuración...
            </div>
          ) : (
            <>
              {/* Switch Master de Activación */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Estado del Live en la App:</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isActive ? '● EN VIVO (ACTIVO)' : '○ APAGADO'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isActive
                      ? 'Los clientes ven el botón flotante y el banner en la app móvil.'
                      : 'Oculto totalmente en la app móvil.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Resumen dinámico inteligente */}
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl leading-relaxed">
                <strong>⚡ Comportamiento inteligente en la App:</strong>
                <ul className="mt-1.5 list-disc list-inside space-y-1">
                  {activeLinksCount === 1 && (
                    <li className="text-emerald-700 font-bold">
                      Tienes 1 solo link configurado: Al tocar "Ir al Live", el usuario irá <b>directamente</b> sin ventanas intermedias.
                    </li>
                  )}
                  {activeLinksCount > 1 && (
                    <li>
                      Tienes {activeLinksCount} links configurados: La app mostrará un selector limpio <b>solo con esos {activeLinksCount}</b> enlaces.
                    </li>
                  )}
                  {activeLinksCount === 0 && (
                    <li className="text-red-600 font-bold">
                      No has ingresado ningún link aún. Pega al menos un enlace para que la app pueda abrirlo.
                    </li>
                  )}
                </ul>
              </div>

              {/* Inputs de Enlaces */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-black tracking-wider text-slate-700 uppercase">
                  Pega los Links de tus Transmisiones (Deja en blanco los que no uses):
                </h3>

                {/* TikTok Live */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span>🎵</span> TikTok Live URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.tiktok.com/@jeska.moda/live"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white outline-none transition text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Instagram Live */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span>📸</span> Instagram Live URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/jeskamoda/live/"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:bg-white outline-none transition text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Facebook Live */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span>📘</span> Facebook Live URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.facebook.com/jeskamoda/live"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* YouTube Live */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span>📺</span> YouTube Live URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/@jeskamoda/live"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:bg-white outline-none transition text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Título opcional */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título del Live (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: ¡JESKA Está En Directo! 👗🔥"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition text-slate-900"
                />
              </div>

              {/* Subtítulo opcional */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtítulo / Mensaje Promocional:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Conéctate para ver prendas en vivo y pedir tu talla."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition text-slate-900"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer con Acciones */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isActive && (
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Apagar Live Ahora
              </button>
            )}
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                ✓ Guardado y actualizado en la App
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2.5 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar y Publicar en App'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamManagerModal;
