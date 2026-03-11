-- Landing Page Analytics Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    landing_id TEXT NOT NULL, -- SLUG or UUID of the landing
    event_type TEXT NOT NULL, -- 'view', 'click', 'session_end'
    event_name TEXT, -- e.g. 'Hero CTA', 'WhatsApp'
    session_id TEXT NOT NULL, -- To group events for a single visitor session
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster aggregation
CREATE INDEX IF NOT EXISTS idx_analytics_landing_id ON analytics_events(landing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT events (public tracking)
CREATE POLICY "Public tracking insert" ON analytics_events FOR INSERT TO public WITH CHECK (true);

-- Only authenticated users (admins) can VIEW events
CREATE POLICY "Admin view events" ON analytics_events FOR SELECT TO authenticated USING (true);
