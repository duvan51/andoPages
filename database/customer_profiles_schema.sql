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
    tier TEXT DEFAULT 'Bronce', -- Bronce, Plata, Oro
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_customers_company ON public.customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS
-- 1. Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Customers can view their own profile" ON public.customers;
CREATE POLICY "Customers can view their own profile" 
ON public.customers FOR SELECT 
USING (auth.uid() = id);

-- 2. Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Customers can update their own profile" ON public.customers;
CREATE POLICY "Customers can update their own profile" 
ON public.customers FOR UPDATE 
USING (auth.uid() = id);

-- 3. Inserción permitida al registrarse (o por trigger)
DROP POLICY IF EXISTS "Customers can insert their own profile" ON public.customers;
CREATE POLICY "Customers can insert their own profile" 
ON public.customers FOR INSERT 
WITH CHECK (auth.uid() = id OR auth.role() = 'anon');

-- 4. Admins pueden consultar clientes de su empresa
DROP POLICY IF EXISTS "Admins can view customers of their company" ON public.customers;
CREATE POLICY "Admins can view customers of their company" 
ON public.customers FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.companies 
        WHERE companies.id = customers.company_id 
        AND companies.admin_email = auth.jwt()->>'email'
    )
    OR auth.jwt()->>'email' = 'aponteramirezduvan@gmail.com'
);

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
