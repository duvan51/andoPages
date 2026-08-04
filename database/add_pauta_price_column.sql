-- Script para agregar la columna de Precio Venta Pauta y asegurar la de Precio Costo
-- Ejecuta este script en el editor SQL de Supabase (SQL Editor)

ALTER TABLE treatments ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS pauta_price NUMERIC DEFAULT 0;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS is_pauta BOOLEAN DEFAULT FALSE;
