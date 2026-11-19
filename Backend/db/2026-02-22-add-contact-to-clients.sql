-- Añade columna contact a clients (FK a persons), después de representative.
-- Ejecutar si no usás migraciones de Sequelize.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS contact UUID NULL
  REFERENCES persons(id) ON DELETE SET NULL ON UPDATE CASCADE;

COMMENT ON COLUMN clients.contact IS 'Contacto adicional del cliente (persons.id), opcional';
