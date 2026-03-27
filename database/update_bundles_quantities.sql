-- Modify the bundles table to support quantities using JSONB
ALTER TABLE bundles DROP COLUMN IF EXISTS product_ids;
ALTER TABLE bundles ADD COLUMN items JSONB DEFAULT '[]';
