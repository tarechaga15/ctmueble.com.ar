-- Migración manual equivalente a 20260225000000-work-orders-elements-templates-samples.js
-- Ejecutar en PostgreSQL. Si prefieres el flujo normal del proyecto, usa: npm run migrate:up

BEGIN;

-- 1) essays_elements: añadir batch_number (omitir si ya existe)
ALTER TABLE essays_elements ADD COLUMN IF NOT EXISTS batch_number VARCHAR(255) NULL;

-- 2) essay_element_templates (omitir si ya existe)
CREATE TABLE IF NOT EXISTS essay_element_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255) NOT NULL,
  country CHAR(2) NULL REFERENCES types_countries(id)
);
CREATE INDEX IF NOT EXISTS essay_element_templates_user_id_idx ON essay_element_templates(user_id);

-- 3) work_orders (omitir si ya existe)
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  essay_id UUID NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  report_delivery_deadline DATE NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  price DECIMAL(12,2) NULL,
  observations TEXT NULL,
  essay_type_id INTEGER NULL REFERENCES types_essays(id),
  status VARCHAR(20) NOT NULL DEFAULT 'WAITING_SAMPLES' CHECK (status IN ('WAITING_SAMPLES','ANALYZING','COMPLETED','CANCELLED'))
);
CREATE INDEX IF NOT EXISTS work_orders_essay_id_idx ON work_orders(essay_id);
CREATE INDEX IF NOT EXISTS work_orders_code_idx ON work_orders(code);

-- 4) samples: nuevas columnas (omitir si ya existen)
ALTER TABLE samples ADD COLUMN IF NOT EXISTS work_order UUID NULL REFERENCES work_orders(id) ON DELETE SET NULL;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS height DECIMAL(12,4) NULL;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS width DECIMAL(12,4) NULL;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS thickness DECIMAL(12,4) NULL;

COMMIT;

-- Registrar en SequelizeMeta para que el runner no la vuelva a ejecutar (opcional):
-- INSERT INTO "SequelizeMeta" (name) VALUES ('20260225000000-work-orders-elements-templates-samples.js');
