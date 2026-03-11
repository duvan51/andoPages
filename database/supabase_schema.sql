-- Postgres Schema for Promedid (Supabase Compatible)

-- 1. Treatments Table
CREATE TABLE IF NOT EXISTS treatments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Diagnóstico', 'Sueroterapia', 'Terapias', 'Estética', 'Multivitamínicos')),
    subcategory TEXT,
    tag TEXT,
    "imageUrl" TEXT,
    secondary_images TEXT[] DEFAULT '{}',
    price TEXT,
    "packagePrice" TEXT,
    discount TEXT DEFAULT NULL,
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Benefits Table (One-to-many relationship)
CREATE TABLE IF NOT EXISTS treatment_benefits (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    treatment_id TEXT REFERENCES treatments(id) ON DELETE CASCADE,
    benefit TEXT NOT NULL
);

-- 3. Supplements Table
CREATE TABLE IF NOT EXISTS supplements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "imageUrl" TEXT,
    price TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Supplement-Treatment Mapping (Many-to-many)
CREATE TABLE IF NOT EXISTS supplement_matching (
    supplement_id TEXT REFERENCES supplements(id) ON DELETE CASCADE,
    treatment_id TEXT REFERENCES treatments(id) ON DELETE CASCADE,
    PRIMARY KEY (supplement_id, treatment_id)
);

-- Enable RLS (Optional, but recommended for production)
-- ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE treatment_benefits ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE supplement_matching ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access if needed
-- CREATE POLICY "Allow public read" ON treatments FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON treatment_benefits FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON supplements FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON supplement_matching FOR SELECT USING (true);
