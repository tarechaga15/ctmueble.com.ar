-- ============================================
-- Script para renombrar la tabla 'contacts' a 'persons'
-- y actualizar todas las foreign keys relacionadas
-- ============================================
-- 
-- IMPORTANTE: Ejecutar este script manualmente en Neon
-- Este script es idempotente y verifica existencia antes de hacer cambios
--
-- Tablas que referencian a 'contacts':
-- - essays.contact -> persons.id
-- - essays_client.contact -> persons.id
-- - clients_contacts.contact -> persons.id
-- - bussiness_representatives.contact -> persons.id
-- - users (si tiene FK a contacts, verificar)
-- ============================================

START TRANSACTION;

-- 1. Verificar que la tabla contacts existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contacts'
    ) THEN
        RAISE EXCEPTION 'La tabla contacts no existe. No se puede renombrar.';
    END IF;
END $$;

-- 2. Eliminar todas las foreign keys que referencian a contacts
--    (Necesitamos eliminarlas antes de renombrar la tabla)

-- 2.1. Eliminar FK de essays.contact -> contacts.id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'essays' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%contact%'
    ) THEN
        ALTER TABLE essays DROP CONSTRAINT IF EXISTS essays_contact_fkey;
        ALTER TABLE essays DROP CONSTRAINT IF EXISTS fk_essays_contact;
    END IF;
END $$;

-- 2.2. Eliminar FK de essays_client.contact -> contacts.id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'essays_client' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%contact%'
    ) THEN
        ALTER TABLE essays_client DROP CONSTRAINT IF EXISTS essays_client_contact_fkey;
        ALTER TABLE essays_client DROP CONSTRAINT IF EXISTS fk_essays_client_contact;
    END IF;
END $$;

-- 2.3. Eliminar FK de clients_contacts.contact -> contacts.id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'clients_contacts' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%contact%'
    ) THEN
        ALTER TABLE clients_contacts DROP CONSTRAINT IF EXISTS clients_contacts_contact_fkey;
        ALTER TABLE clients_contacts DROP CONSTRAINT IF EXISTS fk_clients_contacts_contact;
    END IF;
END $$;

-- 2.4. Eliminar FK de bussiness_representatives.contact -> contacts.id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'bussiness_representatives' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%contact%'
    ) THEN
        ALTER TABLE bussiness_representatives DROP CONSTRAINT IF EXISTS bussiness_representatives_contact_fkey;
        ALTER TABLE bussiness_representatives DROP CONSTRAINT IF EXISTS fk_brep_contact;
    END IF;
END $$;

-- 3. Renombrar la tabla contacts a persons
ALTER TABLE IF EXISTS contacts RENAME TO persons;

-- 4. Renombrar índices si existen
DO $$
BEGIN
    -- Renombrar índice único de user_id si existe
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'persons' 
        AND indexname LIKE '%user_id%'
    ) THEN
        -- El índice se renombrará automáticamente con la tabla
        NULL;
    END IF;
END $$;

-- 5. Recrear las foreign keys apuntando a persons

-- 5.1. FK de essays.contact -> persons.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'essays' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%contact%'
    ) THEN
        ALTER TABLE essays 
        ADD CONSTRAINT fk_essays_contact 
        FOREIGN KEY (contact) 
        REFERENCES persons(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 5.2. FK de essays_client.contact -> persons.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'essays_client' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%contact%'
    ) THEN
        ALTER TABLE essays_client 
        ADD CONSTRAINT fk_essays_client_contact 
        FOREIGN KEY (contact) 
        REFERENCES persons(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 5.3. FK de clients_contacts.contact -> persons.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'clients_contacts' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%contact%'
    ) THEN
        ALTER TABLE clients_contacts 
        ADD CONSTRAINT fk_clients_contacts_contact 
        FOREIGN KEY (contact) 
        REFERENCES persons(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 5.4. FK de bussiness_representatives.contact -> persons.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'bussiness_representatives' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%contact%'
    ) THEN
        ALTER TABLE bussiness_representatives 
        ADD CONSTRAINT fk_brep_contact 
        FOREIGN KEY (contact) 
        REFERENCES persons(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. Verificar que el renombrado fue exitoso
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'persons'
    ) THEN
        RAISE EXCEPTION 'Error: La tabla persons no existe después del renombrado.';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contacts'
    ) THEN
        RAISE EXCEPTION 'Error: La tabla contacts aún existe después del renombrado.';
    END IF;
    
    RAISE NOTICE '✅ Tabla renombrada exitosamente de contacts a persons';
END $$;

COMMIT;

-- ============================================
-- Verificación final
-- ============================================
-- Ejecuta estos queries para verificar que todo está correcto:

-- Verificar que la tabla persons existe
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'persons';

-- Verificar todas las FKs que referencian a persons
-- SELECT
--     tc.table_name, 
--     kcu.column_name, 
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name,
--     tc.constraint_name
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND ccu.table_name = 'persons';
