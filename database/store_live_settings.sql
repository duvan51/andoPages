-- ==============================================================================
-- TABLA: store_live_settings
-- Permite que desde andoPages (Panel Admin) el administrador active/desactive
-- la transmisión y pegue los enlaces directos de los Lives (TikTok, Instagram, etc.).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.store_live_settings (
  company_id UUID PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL DEFAULT '¡JESKA Está En Directo! 👗🔥',
  subtitle TEXT NOT NULL DEFAULT 'Conéctate al Live para ver prendas en vivo, pedir tu talla y ganar descuentos.',
  streamer_name TEXT DEFAULT 'JESKA Moda',
  viewer_count INTEGER DEFAULT 0,
  
  -- Enlaces directos ingresados por el admin (si se deja vacío, la app no lo muestra)
  tiktok_url TEXT DEFAULT '',
  tiktok_handle TEXT DEFAULT '@jeska.moda',
  tiktok_desc TEXT DEFAULT '',
  
  instagram_url TEXT DEFAULT '',
  instagram_handle TEXT DEFAULT '@jeskamoda',
  instagram_desc TEXT DEFAULT '',
  
  facebook_url TEXT DEFAULT '',
  facebook_handle TEXT DEFAULT '',
  facebook_desc TEXT DEFAULT '',
  
  youtube_url TEXT DEFAULT '',
  youtube_handle TEXT DEFAULT '',
  youtube_desc TEXT DEFAULT '',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.store_live_settings ENABLE ROW LEVEL SECURITY;

-- 1. Política de Lectura Pública (la App Móvil puede leer la configuración del Live)
DROP POLICY IF EXISTS "Permitir lectura publica de live settings" ON public.store_live_settings;
CREATE POLICY "Permitir lectura publica de live settings"
  ON public.store_live_settings
  FOR SELECT
  USING (true);

-- 2. Política de Escritura / Actualización (Usuarios autenticados / Admin andoPages)
DROP POLICY IF EXISTS "Permitir actualizacion para usuarios autenticados" ON public.store_live_settings;
CREATE POLICY "Permitir actualizacion para usuarios autenticados"
  ON public.store_live_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Habilitar Supabase Realtime para que la App reciba cambios al instante sin reiniciar
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_live_settings;

-- 4. Fila inicial para JESKA Moda
INSERT INTO public.store_live_settings (
  company_id,
  is_active,
  title,
  subtitle,
  streamer_name,
  tiktok_url,
  instagram_url,
  facebook_url,
  youtube_url
) VALUES (
  '733b1f9a-878d-4adc-9a77-1228a3c09df7',
  false,
  '¡JESKA Está En Directo! 👗🔥',
  'Conéctate al Live para ver prendas en vivo, pedir tu talla y ganar descuentos.',
  'JESKA Moda',
  'https://www.tiktok.com/@jeska.moda/live',
  'https://www.instagram.com/jeskamoda/live/',
  '',
  ''
)
ON CONFLICT (company_id) DO UPDATE SET
  updated_at = NOW();
