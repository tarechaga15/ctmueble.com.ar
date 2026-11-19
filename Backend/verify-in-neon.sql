-- ============================================
-- Script para verificar las columnas en Neon
-- Copia y pega este query en el editor SQL de Neon
-- ============================================

-- 1. Ver todas las columnas de essays_client (deberías ver 29 columnas totales)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'essays_client'
ORDER BY ordinal_position;

-- 2. Ver solo las columnas de datos en crudo (deberías ver 23 columnas)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'essays_client'
  AND column_name LIKE '%_raw_%'
ORDER BY column_name;

-- 3. Ver la estructura completa de la tabla
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'essays_client'
ORDER BY ordinal_position;

-- 4. Si quieres ver un ejemplo de datos (si hay registros)
-- SELECT * FROM essays_client LIMIT 1;
