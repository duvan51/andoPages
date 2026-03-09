-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    active BOOLEAN DEFAULT true,
    slots_total INTEGER DEFAULT 30,
    slots_booked INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for locations"
ON locations FOR SELECT
TO anon
USING (active = true);

-- Allow authenticated (admin) all access
CREATE POLICY "Allow admin all access for locations"
ON locations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert initial data
INSERT INTO locations (city, name, address, phone, active, slots_total, slots_booked)
VALUES 
('Bogotá', 'Sede Norte', 'Calle 127 #15-31', '+57 (601) 345 6789', true, 30, 12),
('Bogotá', 'Sede Salitre', 'Av. Esperanza #68-45', '+57 (601) 789 0123', true, 30, 8),
('Medellín', 'Sede El Poblado', 'Carrera 43A #1-50', '+57 (604) 234 5678', true, 30, 25),
('Cali', 'Sede Pance', 'Calle 18 #122-10', '+57 (602) 456 7890', true, 30, 5),
('Barranquilla', 'Sede El Prado', 'Carrera 54 #72-101', '+57 (605) 567 8901', true, 30, 18),
('Pereira', 'Sede Circunvalar', 'Av. Circunvalar #12-32', '+57 (606) 678 9012', true, 30, 0);
