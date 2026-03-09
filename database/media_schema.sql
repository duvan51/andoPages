-- Create the media table for centralized asset management
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
    public_id TEXT UNIQUE NOT NULL, -- Cloudinary public_id for deletions
    name TEXT, -- User-friendly name or label
    file_size INTEGER, -- in bytes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public read access for landings
CREATE POLICY "Allow public read access on media" 
ON media FOR SELECT 
TO public 
USING (true);

-- Admin access for storage management
CREATE POLICY "Allow all access to media for admins" 
ON media FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
