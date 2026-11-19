-- Estructura completa de la tabla essays_client
-- Ejecuta este query en el editor SQL de Neon para ver todas las columnas

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'essays_client'
ORDER BY ordinal_position;

-- Para ver solo las columnas de datos en crudo:
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'essays_client'
  AND column_name LIKE '%_raw_%'
ORDER BY column_name;
