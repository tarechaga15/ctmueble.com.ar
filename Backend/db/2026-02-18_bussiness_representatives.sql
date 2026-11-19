-- Crear tabla de representantes y migrar datos desde clients.representative_name/dni
-- MySQL / MariaDB
--
-- IMPORTANTE:
-- - Este proyecto no incluye migraciones automáticas. Ejecutá este script manualmente.
-- - Si ya eliminaste representative_name/representative_dni, salteá la sección de migración de datos.

START TRANSACTION;

-- 1) Obtener el tipo exacto de contacts.id usando una variable
-- Esto copia exactamente el tipo, charset y collation

SET @contact_id_def = (
  SELECT CONCAT(
    COLUMN_TYPE,
    IF(CHARACTER_SET_NAME IS NOT NULL, CONCAT(' CHARACTER SET ', CHARACTER_SET_NAME), ''),
    IF(COLLATION_NAME IS NOT NULL, CONCAT(' COLLATE ', COLLATION_NAME), '')
  )
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'contacts' 
    AND COLUMN_NAME = 'id'
  LIMIT 1
);

-- 2) Crear tabla SIN la columna contact primero
CREATE TABLE IF NOT EXISTS `bussiness_representatives` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `dni` VARCHAR(8) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Verificar si la FK ya existe y eliminarla primero (si existe)
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'bussiness_representatives' 
    AND CONSTRAINT_NAME = 'fk_brep_contact'
);

-- Eliminar FK si existe (debe eliminarse antes de la columna)
SET @sql_drop_fk = IF(@fk_exists > 0,
  'ALTER TABLE `bussiness_representatives` DROP FOREIGN KEY `fk_brep_contact`',
  'SELECT 1'
);

PREPARE stmt_drop_fk FROM @sql_drop_fk;
EXECUTE stmt_drop_fk;
DEALLOCATE PREPARE stmt_drop_fk;

-- 4) Verificar si la columna contact ya existe, y si existe, eliminarla
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'bussiness_representatives' 
    AND COLUMN_NAME = 'contact'
);

-- Si la columna existe, eliminarla (la FK ya fue eliminada arriba)
SET @sql_drop_col = IF(@col_exists > 0,
  'ALTER TABLE `bussiness_representatives` DROP COLUMN `contact`',
  'SELECT 1'
);

PREPARE stmt_drop_col FROM @sql_drop_col;
EXECUTE stmt_drop_col;
DEALLOCATE PREPARE stmt_drop_col;

-- 5) Agregar la columna contact usando el MISMO tipo exacto que contacts.id
SET @sql = CONCAT(
  'ALTER TABLE `bussiness_representatives` ',
  'ADD COLUMN `contact` ', @contact_id_def, ' NULL, ',
  'ADD INDEX `idx_contact` (`contact`)'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6) Agregar la FK después de crear la columna con el tipo correcto
ALTER TABLE `bussiness_representatives`
  ADD CONSTRAINT `fk_brep_contact`
    FOREIGN KEY (`contact`) REFERENCES `contacts` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- 7) Verificar si la columna representative ya existe en clients
SET @rep_col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'clients' 
    AND COLUMN_NAME = 'representative'
);

-- Agregar columna FK en clients solo si no existe (primero nullable para poder migrar)
SET @sql_add_rep = IF(@rep_col_exists = 0,
  'ALTER TABLE `clients` ADD COLUMN `representative` CHAR(36) NULL AFTER `address`',
  'SELECT 1'
);

PREPARE stmt_add_rep FROM @sql_add_rep;
EXECUTE stmt_add_rep;
DEALLOCATE PREPARE stmt_add_rep;

-- 8) Migración de datos desde columnas legacy
--    Crea un representante por cada client y lo asigna en clients.representative
CREATE TEMPORARY TABLE `tmp_client_rep` (
  `client_id` CHAR(36) PRIMARY KEY,
  `rep_id` CHAR(36) NOT NULL
);

INSERT INTO `tmp_client_rep` (`client_id`, `rep_id`)
SELECT `id`, UUID()
FROM `clients`;

INSERT INTO `bussiness_representatives` (`id`, `name`, `dni`)
SELECT t.`rep_id`, c.`representative_name`, c.`representative_dni`
FROM `clients` c
JOIN `tmp_client_rep` t ON t.`client_id` = c.`id`;

UPDATE `clients` c
JOIN `tmp_client_rep` t ON t.`client_id` = c.`id`
SET c.`representative` = t.`rep_id`;

DROP TEMPORARY TABLE `tmp_client_rep`;

-- 9) Verificar si la FK ya existe en clients antes de crearla
SET @clients_fk_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'clients' 
    AND CONSTRAINT_NAME = 'fk_clients_representative'
);

-- Crear FK en clients solo si no existe
SET @sql_add_clients_fk = IF(@clients_fk_exists = 0,
  'ALTER TABLE `clients` ADD CONSTRAINT `fk_clients_representative` FOREIGN KEY (`representative`) REFERENCES `bussiness_representatives` (`id`) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);

PREPARE stmt_add_clients_fk FROM @sql_add_clients_fk;
EXECUTE stmt_add_clients_fk;
DEALLOCATE PREPARE stmt_add_clients_fk;

-- Si querés forzar NOT NULL, asegurate antes de que todos los clientes tengan representante
-- ALTER TABLE `clients` MODIFY `representative` CHAR(36) NOT NULL;

-- 10) Verificar si las columnas legacy existen antes de eliminarlas
SET @name_col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'clients' 
    AND COLUMN_NAME = 'representative_name'
);

SET @dni_col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'clients' 
    AND COLUMN_NAME = 'representative_dni'
);

-- Eliminar columnas legacy solo si existen
SET @sql_drop_name = IF(@name_col_exists > 0,
  'ALTER TABLE `clients` DROP COLUMN `representative_name`',
  'SELECT 1'
);

SET @sql_drop_dni = IF(@dni_col_exists > 0,
  'ALTER TABLE `clients` DROP COLUMN `representative_dni`',
  'SELECT 1'
);

PREPARE stmt_drop_name FROM @sql_drop_name;
EXECUTE stmt_drop_name;
DEALLOCATE PREPARE stmt_drop_name;

PREPARE stmt_drop_dni FROM @sql_drop_dni;
EXECUTE stmt_drop_dni;
DEALLOCATE PREPARE stmt_drop_dni;

COMMIT;


