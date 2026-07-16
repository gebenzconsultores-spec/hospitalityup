-- ============================================================
-- HospitalityUP - Crear tablas de Proveedores y Solicitudes
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Crear tabla Proveedor
CREATE TABLE IF NOT EXISTS "Proveedor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreEn" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'otro',
    "rfc" TEXT,
    "contactoNombre" TEXT,
    "contactoEmail" TEXT,
    "contactoTelefono" TEXT,
    "direccion" TEXT,
    "region" TEXT,
    "ciudad" TEXT,
    "paginaWeb" TEXT,
    "logo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "calificacion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notas" TEXT,
    "empresaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- 2. Crear tabla ProductoProveedor
CREATE TABLE IF NOT EXISTS "ProductoProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreEn" TEXT,
    "descripcion" TEXT,
    "descripcionEn" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'otro',
    "categoriaEn" TEXT,
    "unidad" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "precioMayoreo" DOUBLE PRECISION,
    "cantidadMinima" INTEGER NOT NULL DEFAULT 1,
    "imagen" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "propiedadesIds" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductoProveedor_pkey" PRIMARY KEY ("id")
);

-- 3. Crear tabla SolicitudPedido
CREATE TABLE IF NOT EXISTS "SolicitudPedido" (
    "id" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "solicitadoPor" TEXT,
    "proveedorId" TEXT NOT NULL,
    "productoId" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "unidad" TEXT,
    "precioEstimado" DOUBLE PRECISION,
    "totalEstimado" DOUBLE PRECISION,
    "notas" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRespuesta" TIMESTAMP(3),
    "fechaEntrega" TIMESTAMP(3),
    "respuestaProveedor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SolicitudPedido_pkey" PRIMARY KEY ("id")
);

-- 4. Agregar foreign keys (solo si no existen)
DO $$
BEGIN
    -- Proveedor -> Empresa
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Proveedor_empresaId_fkey') THEN
        ALTER TABLE "Proveedor" ADD CONSTRAINT "Proveedor_empresaId_fkey" 
        FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    -- ProductoProveedor -> Proveedor
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ProductoProveedor_proveedorId_fkey') THEN
        ALTER TABLE "ProductoProveedor" ADD CONSTRAINT "ProductoProveedor_proveedorId_fkey" 
        FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- SolicitudPedido -> Propiedad
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'SolicitudPedido_propiedadId_fkey') THEN
        ALTER TABLE "SolicitudPedido" ADD CONSTRAINT "SolicitudPedido_propiedadId_fkey" 
        FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- SolicitudPedido -> Proveedor
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'SolicitudPedido_proveedorId_fkey') THEN
        ALTER TABLE "SolicitudPedido" ADD CONSTRAINT "SolicitudPedido_proveedorId_fkey" 
        FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- SolicitudPedido -> ProductoProveedor
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'SolicitudPedido_productoId_fkey') THEN
        ALTER TABLE "SolicitudPedido" ADD CONSTRAINT "SolicitudPedido_productoId_fkey" 
        FOREIGN KEY ("productoId") REFERENCES "ProductoProveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Verificar que se crearon
SELECT 'Proveedor' as tabla, count(*) as total FROM "Proveedor"
UNION ALL
SELECT 'ProductoProveedor' as tabla, count(*) as total FROM "ProductoProveedor"
UNION ALL
SELECT 'SolicitudPedido' as tabla, count(*) as total FROM "SolicitudPedido";
