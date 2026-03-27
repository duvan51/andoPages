-- Create the bundles table
CREATE TABLE IF NOT EXISTS bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    original_total TEXT,
    bundle_price TEXT NOT NULL,
    product_ids UUID[] DEFAULT '{}',
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on bundles" 
ON bundles FOR SELECT 
TO public 
USING (true);

-- Allow full access to authenticated users (admin)
CREATE POLICY "Allow all access to bundles for service role" 
ON bundles FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Temporary policy for easy testing
CREATE POLICY "Allow public all access on bundles for testing" 
ON bundles FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
