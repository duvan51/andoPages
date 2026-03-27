-- Create the landings table for sales funnels
CREATE TABLE IF NOT EXISTS landings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{
        "hero": {"title": "", "subtitle": "", "imageUrl": ""},
        "videoUrl": "",
        "benefits": [],
        "cta": {"type": "service", "id": ""}
    }',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE landings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access on landings" 
ON landings FOR SELECT 
TO public 
USING (true);

-- Admin access (service role/anon for testing)
CREATE POLICY "Allow all access to landings for testing" 
ON landings FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
