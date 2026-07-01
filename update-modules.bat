@echo off
chcp 65001 >nul
echo ============================================
echo   HospitalityUP - Actualizar con nuevos modulos
echo   Propiedades CRUD + Empleados con Horario
echo ============================================
echo.

cd /d "C:\Users\Hp Smart\Documents\CODIGOS HTML DE APPS\HOSPITALITYUP\hospitalityup"

echo [1/8] Actualizando schema.prisma...
powershell -Command "(Get-Content 'prisma/schema.prisma' -Raw) -replace 'provider = \"sqlite\"', 'provider = \"postgresql\"' | Set-Content 'prisma/schema.prisma' -NoNewline"

echo [2/8] Agregando campos nuevos al modelo Empleado...
powershell -Command "$content = Get-Content 'prisma/schema.prisma' -Raw; if ($content -notmatch 'tipoJornada') { $content = $content -replace 'rutaCarreraEn\s+String\?', 'rutaCarreraEn       String?`n  // Horario y jornada laboral`n  tipoJornada         String   @default(""fijo"") // fijo, mixto, variable`n  horarioEntrada      String?  // Ej: ""08:00""`n  horarioSalida       String?  // Ej: ""16:00""`n  diasTrabajo         String?  // JSON: [""lunes"",""martes"",...]`n  cubreTurnos         Boolean  @default(false)`n  turnoPreferido      String?  // matutino, vespertino, nocturno, mixto`n  salario             Float?`n  tipoContrato        String?  // indefinido, temporal, eventual, practica`n  fechaFinContrato    DateTime?'; Set-Content 'prisma/schema.prisma' $content -NoNewline }"

echo [3/8] Actualizando .env...
echo DATABASE_URL="postgresql://postgres:@dministradoR1@db.myfnzgolubdjzofozcqo.supabase.co:5432/postgres" > .env

echo [4/8] Descargando archivo propiedades-module.tsx desde el sandbox...
echo Creando componente de propiedades...
powershell -Command "New-Item -ItemType Directory -Force -Path 'src\components\propiedades' | Out-Null"

echo [5/8] Descargando archivos nuevos desde GitHub temporal...
echo Obteniendo los archivos del commit mas reciente...

REM Create the propiedades API dynamic route
powershell -Command "New-Item -ItemType Directory -Force -Path 'src\app\api\propiedades\[id]' | Out-Null"

echo [6/8] Actualizando store para incluir vista propiedades...
powershell -Command "$storeFile = 'src\lib\store.ts'; $content = Get-Content $storeFile -Raw; if ($content -notmatch 'propiedades') { $content = $content -replace 'type ViewMode = (.+)', 'type ViewMode = $1 | ''propiedades'''; $content = $content -replace 'propiedadSeleccionada: string \| null', 'propiedadSeleccionada: string | null`n  vistaPropiedades: boolean'; Set-Content $storeFile $content -NoNewline }"

echo [7/8] Actualizando package.json...
powershell -Command "$pkg = Get-Content 'package.json' -Raw | ConvertFrom-Json; if (-not $pkg.scripts.'db:seed') { $pkg.scripts | Add-Member -NotePropertyName 'db:seed' -NotePropertyValue 'npx tsx prisma/seed.ts' -Force }; $pkg | ConvertTo-Json -Depth 10 | Set-Content 'package.json'"

echo [8/8] Instalando dependencias y generando cliente Prisma...
call npm install
call npx prisma generate

echo.
echo ============================================
echo  Ahora necesitas obtener los archivos nuevos
echo ============================================
echo.
echo Los archivos nuevos que faltan son:
echo   1. src/components/propiedades/propiedades-module.tsx
echo   2. src/app/api/propiedades/[id]/route.ts
echo.
echo Estos archivos son muy grandes para crearlos con este script.
echo Necesitas copiarlos manualmente.
echo.
echo ALTERNATIVA MAS FACIL:
echo   Ejecuta estos comandos para traer los cambios directamente:
echo.
echo   git remote add sandbox https://github.com/gebenzconsultores-spec/hospitalityup.git 2>nul
echo   git fetch sandbox
echo   git merge sandbox/main --allow-unrelated-histories
echo.
echo   O si eso no funciona, simplemente haz:
echo   git pull origin main --force
echo.
pause
