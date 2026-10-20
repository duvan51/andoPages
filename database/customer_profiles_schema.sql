-- =========================================================
-- ESQUEMA DE CLIENTES Y FIDELIZACIÓN (MULTI-TENANT / JESKA)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    points INTEGER DEFAULT 50, -- 50 puntos de bienvenida automáticos
    tier TEXT DEFAULT 'Bronce', -- Bronce, Plata, Oro, Diamante
    addresses JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{"favorite_categories": [], "viewed_items": [], "top_colors": []}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    cart JSONB DEFAULT '[]'::jsonb,
    cart_total NUMERIC DEFAULT 0,
    cart_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar columnas si ya existía la tabla
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'preferences') THEN
        ALTER TABLE public.customers ADD COLUMN preferences JSONB DEFAULT '{"favorite_categories": [], "viewed_items": [], "top_colors": []}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'tags') THEN
        ALTER TABLE public.customers ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'cart') THEN
        ALTER TABLE public.customers ADD COLUMN cart JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'cart_total') THEN
        ALTER TABLE public.customers ADD COLUMN cart_total NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'cart_updated_at') THEN
        ALTER TABLE public.customers ADD COLUMN cart_updated_at TIMESTAMPTZ;
    END IF;
END $$;

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_customers_company ON public.customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS
DROP POLICY IF EXISTS "Customers can view their own profile" ON public.customers;
DROP POLICY IF EXISTS "Admins can view customers of their company" ON public.customers;
DROP POLICY IF EXISTS "Permitir lectura publica de customers" ON public.customers;
CREATE POLICY "Permitir lectura publica de customers" 
ON public.customers FOR SELECT 
TO public
USING (true);

DROP POLICY IF EXISTS "Customers can update their own profile" ON public.customers;
DROP POLICY IF EXISTS "Customers can insert their own profile" ON public.customers;
DROP POLICY IF EXISTS "Permitir gestion total de customers" ON public.customers;
CREATE POLICY "Permitir gestion total de customers" 
ON public.customers FOR ALL 
TO public
USING (true)
WITH CHECK (true);

-- =========================================================
-- TABLA DE ACTIVIDADES Y CLICS DE CLIENTES (GUSTOS E INTERESES)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.customer_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL, -- 'product_click', 'view_product', 'live_click', 'whatsapp_click', 'add_to_cart', 'search'
    title TEXT NOT NULL, -- ej: 'Vio Vestido Sirena Rojo', 'Clic en TikTok Live'
    category TEXT, -- ej: 'Vestidos', 'Conjuntos', 'Lives'
    metadata JSONB DEFAULT '{}'::jsonb, -- ej: { "price": 89000, "imageUrl": "...", "color": "Rojo" }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_activities_customer ON public.customer_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_activities_type ON public.customer_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_customer_activities_created_at ON public.customer_activities(created_at);

ALTER TABLE public.customer_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo acceso en customer_activities" ON public.customer_activities;
CREATE POLICY "Permitir todo acceso en customer_activities"
ON public.customer_activities FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- =========================================================
-- TABLA DE CARRITOS GUARDADOS / ABANDONADOS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.customer_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    items JSONB DEFAULT '[]'::jsonb, -- array de prendas: [{ id, title, price, quantity, size, color, imageUrl }]
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'abandoned', 'converted'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_carts_customer ON public.customer_carts(customer_id);

ALTER TABLE public.customer_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo acceso en customer_carts" ON public.customer_carts;
CREATE POLICY "Permitir todo acceso en customer_carts"
ON public.customer_carts FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- =========================================================
-- TRIGGER AUTOMÁTICO AL CREAR USUARIO EN SUPABASE AUTH
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER AS $$
DECLARE
    target_company_id UUID;
BEGIN
    -- Determinar company_id (del metadata o la empresa de JESKA por defecto)
    BEGIN
        target_company_id := (NEW.raw_user_meta_data->>'company_id')::uuid;
    EXCEPTION WHEN OTHERS THEN
        target_company_id := '733b1f9a-878d-4adc-9a77-1228a3c09df7'::uuid;
    END;

    IF target_company_id IS NULL THEN
        target_company_id := '733b1f9a-878d-4adc-9a77-1228a3c09df7'::uuid;
    END IF;

    -- Solo crear cliente si el rol es 'customer' o no especificado (no es admin)
    IF NEW.raw_user_meta_data->>'role' IS NULL OR NEW.raw_user_meta_data->>'role' = 'customer' THEN
        INSERT INTO public.customers (
            id,
            company_id,
            full_name,
            email,
            phone,
            points,
            tier
        ) VALUES (
            NEW.id,
            target_company_id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'phone', ''),
            50, -- 50 puntos de bienvenida
            'Bronce'
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enlazar trigger a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_customer ON auth.users;
CREATE TRIGGER on_auth_user_created_customer
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer();

