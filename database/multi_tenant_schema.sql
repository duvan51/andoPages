
-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table to store companies (Tenants)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    custom_domain TEXT UNIQUE,
    admin_email TEXT UNIQUE,
    admin_password TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#10b981',
    config JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist in companies table (in case it already existed)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'admin_email') THEN
        ALTER TABLE companies ADD COLUMN admin_email TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'admin_password') THEN
        ALTER TABLE companies ADD COLUMN admin_password TEXT;
    END IF;
END $$;

-- 2. Base tables (existing tables from your schema)
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    active BOOLEAN DEFAULT true,
    slots_total INTEGER DEFAULT 30,
    slots_booked INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treatments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    active BOOLEAN DEFAULT TRUE,
    "imageUrl" TEXT,
    secondary_images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    url TEXT NOT NULL,
    type TEXT,
    public_id TEXT,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS landings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL,
    page_slug TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    bundle_price TEXT,
    original_total TEXT,
    description TEXT,
    imageUrl TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add company_id to ALL tables with safety checks
DO $$ 
BEGIN
    -- locations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locations' AND column_name = 'company_id') THEN
        ALTER TABLE locations ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;

    -- treatments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatments' AND column_name = 'company_id') THEN
        ALTER TABLE treatments ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;

    -- media
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'company_id') THEN
        ALTER TABLE media ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;

    -- landings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landings' AND column_name = 'company_id') THEN
        ALTER TABLE landings ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;

    -- analytics_events
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'company_id') THEN
        ALTER TABLE analytics_events ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;

    -- bundles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bundles' AND column_name = 'company_id') THEN
        ALTER TABLE bundles ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;

    -- categories
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'company_id') THEN
        ALTER TABLE categories ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- 4. Initial Seed Data (Safe Upsert)
INSERT INTO companies (name, slug, custom_domain, admin_email, admin_password) 
VALUES ('PROMEDID Master', 'master', 'promedid.com', 'aponteramirezduvan@gmail.com', '000000')
ON CONFLICT (slug) DO UPDATE 
SET admin_email = EXCLUDED.admin_email, 
    admin_password = EXCLUDED.admin_password;

-- 5. Associate existing data with Master
DO $$ 
DECLARE 
    master_id UUID;
BEGIN
    SELECT id INTO master_id FROM companies WHERE slug = 'master' LIMIT 1;
    IF master_id IS NOT NULL THEN
        UPDATE locations SET company_id = master_id WHERE company_id IS NULL;
        UPDATE treatments SET company_id = master_id WHERE company_id IS NULL;
        UPDATE media SET company_id = master_id WHERE company_id IS NULL;
        UPDATE landings SET company_id = master_id WHERE company_id IS NULL;
        UPDATE analytics_events SET company_id = master_id WHERE company_id IS NULL;
        UPDATE bundles SET company_id = master_id WHERE company_id IS NULL;
    END IF;
END $$;
