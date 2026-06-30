-- ============================================================
-- HospitalityUP - Script para agregar campos de password y contacto
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Agregar campo password a Propiedad (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Propiedad' AND column_name = 'password') THEN
        ALTER TABLE "Propiedad" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'empresa123';
    END IF;
END $$;

-- Agregar campos de contacto a Propiedad (si no existen)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Propiedad' AND column_name = 'contactoNombre') THEN
        ALTER TABLE "Propiedad" ADD COLUMN "contactoNombre" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Propiedad' AND column_name = 'contactoEmail') THEN
        ALTER TABLE "Propiedad" ADD COLUMN "contactoEmail" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Propiedad' AND column_name = 'contactoTelefono') THEN
        ALTER TABLE "Propiedad" ADD COLUMN "contactoTelefono" TEXT;
    END IF;
END $$;

-- Agregar campo password a Empleado (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Empleado' AND column_name = 'password') THEN
        ALTER TABLE "Empleado" ADD COLUMN "password" TEXT NOT NULL DEFAULT '1234';
    END IF;
END $$;

-- Actualizar todas las propiedades existentes con password por defecto
UPDATE "Propiedad" SET "password" = 'empresa123' WHERE "password" IS NULL OR "password" = '';

-- Actualizar todos los empleados existentes con password por defecto
UPDATE "Empleado" SET "password" = '1234' WHERE "password" IS NULL OR "password" = '';

-- Verificar los cambios
SELECT 'Propiedad' as tabla, count(*) as total, count(CASE WHEN "password" IS NOT NULL THEN 1 END) as con_password FROM "Propiedad"
UNION ALL
SELECT 'Empleado' as tabla, count(*) as total, count(CASE WHEN "password" IS NOT NULL THEN 1 END) as con_password FROM "Empleado";

-- Mostrar las propiedades con sus passwords (para que el admin las vea)
SELECT id, nombre, tipo, region, "password", "contactoNombre", "contactoEmail", "contactoTelefono" FROM "Propiedad" ORDER BY nombre;

-- Mostrar los empleados con sus passwords
SELECT e.id, e."empleadoId", e.nombre, e.posicion, e."password", e.estado, p.nombre as propiedad
FROM "Empleado" e
JOIN "Propiedad" p ON e."propiedadId" = p.id
ORDER BY p.nombre, e.nombre;
