# Task ID: 1 - Servicios API & Seed Update

## Agent: Servicios API Agent

## Task: Create API de Servicios and update seed with realistic service data

## Work Done

### 1. Created `/src/app/api/servicios/route.ts`
- **GET** endpoint with filters:
  - `propiedadId` (required filter) - filter by property
  - `categoria` - filter by category (platillo, bebida, tour, masaje, habitacion, experiencia, paquete, otro)
  - `esUpselling` - filter for upselling items only
  - `disponible` - filter for available items only
  - Results ordered by `orden` ASC then `createdAt` DESC
  - Includes related `propiedad` data (id, nombre, nombreEn)

- **POST** endpoint with validation:
  - Required fields: nombre, categoria, precioNormal, propiedadId
  - Validates propiedadId exists in database
  - Validates categoria is one of the 8 valid categories
  - Validates upselling services have precioUpselling
  - Returns created service with propiedad relation, status 201

### 2. Created `/src/app/api/servicios/[id]/route.ts`
- **GET** - Returns single service detail with full propiedad relation
- **PATCH** - Partial update of service fields (only updates provided fields)
  - Validates categoria if provided
  - Validates propiedadId if changed
  - Uses allowlist of updatable fields
- **DELETE** - Soft delete (sets `disponible = false`)
  - Returns confirmation message with updated service data

### 3. Updated `/src/app/api/seed/route.ts`
- Added `db.servicio.deleteMany()` to cleanup section
- Replaced old simplified 24-service seed data with detailed 43-service data
- Variable renamed from `serviciosData` to `servicios` for consistency
- Added `servicios: servicios.length` to counts response

### Services by Property (43 total):

**Hotel Playa Cancún** (13 services):
- Platillos: Filete de Res a la Parrilla ($380, upsell $520 w/ maridaje), Camarones al Mojo de Ajo ($290), Ensalada César ($180, upsell $260 con salmón)
- Bebidas: Margarita Premium ($160, upsell $220 con tequila reposado), Mojito Cubano ($140), Vino Tinto Copa ($120, upsell $280 botella)
- Tours: Tour Isla Mujeres ($1,200, upsell $1,800 privado), Tour Chichén Itzá VIP ($2,500), Snorkel Arrecife ($800)
- Masajes: Masaje Relajante 60min ($900, upsell $1,300 90min con aromaterapia), Masaje Pareja ($1,600)
- Habitaciones: Upgrade Suite Ocean View ($890, objetivo: upgrade al check-in), Upgrade Suite Presidencial ($2,200)

**Restaurante La Terraza** (6 services):
- Platillos: Pasta Trufa ($280, upsell $380 con trufa fresca), Risotto Hongos ($240), Postre del Chef ($180, upsell $280 con vino dulce)
- Bebidas: Cóctel de la Casa ($150, upsell $220 premium), Cerveza Artesanal ($90), Mezcal Reposado ($180)

**Gran Hotel CDMX** (9 services):
- Platillos: Chilaquiles Divorciados ($190, upsell $280 con arrachera), Huevos Benedictinos ($220)
- Bebidas: Café de Olla ($70, upsell $120 con pan dulce), Chocolate Abuelita ($80)
- Tours: Tour Centro Histórico ($650, upsell $950 privado), Tour Museos ($500)
- Masajes: Masaje Deportivo 45min ($700, upsell $1,000 75min)
- Habitaciones: Upgrade Executive Floor ($450), Upgrade Suite Terraza ($780)

**Bar Mar Azul** (4 services):
- Bebidas: Mezcal Margarita ($180, upsell $280 con mezcal artesanal), Cerveza Premium ($100, upsell $160 con botana), Cuba Libre ($120)
- Experiencias: Noche de Catálogo de Mezcal ($450, upsell $750 con maridaje)

**Resort Los Cabos** (7 services):
- Platillos: Tacos de Pescado Gourmet ($240, upsell $380 con mariscada), Ceviche Premium ($280)
- Tours: Sunset Sailing ($1,800, upsell $2,500 privado), Tour El Arco ($900, upsell $1,300 con lunch)
- Masajes: Masaje Hot Stone 90min ($1,200, upsell $1,800 con facial), Spa Day Package ($2,500)
- Habitaciones: Upgrade Villa Privada ($3,500)

**Restaurante Puerto Veracruz** (4 services):
- Platillos: Huachinango a la Veracruzana ($320, upsell $450 con maridaje), Arroz a la Tumbada ($280)
- Bebidas: Torito de Cacahuete ($110, upsell $180 con ron premium), Agua de Horchata ($50)

All services have both Spanish and English text (nombre/nombreEn, descripcion/descripcionEn, objetivoUpselling/objetivoUpsellingEn).

## Files Modified
- `/src/app/api/servicios/route.ts` (NEW)
- `/src/app/api/servicios/[id]/route.ts` (NEW)
- `/src/app/api/seed/route.ts` (UPDATED - replaced serviciosData section)
- `/src/lib/db.ts` (NO CHANGES - reverted temporary fix)

## Validation
- `bun run lint` passed with no errors
- `bun run db:push` completed successfully (schema was already in sync)
- Seed endpoint returned `{"success": true, "counts": {"servicios": 43}}`
- All 6 properties have services correctly associated via real propiedadId references
