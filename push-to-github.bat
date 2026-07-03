@echo off
echo ============================================
echo  HospitalityUP - Push a GitHub + Deploy
echo ============================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist "package.json" (
    echo ERROR: No se encontro package.json
    echo Asegurate de ejecutar este script dentro de la carpeta del proyecto
    pause
    exit /b 1
)

REM Paso 1: Inicializar git si no existe
if not exist ".git" (
    echo [1/5] Inicializando repositorio git...
    git init
    git remote add origin https://github.com/gebenzconsultores-spec/hospitalityup.git
) else (
    echo [1/5] Repositorio git ya existe - OK
)

REM Paso 2: Agregar todos los archivos
echo [2/5] Agregando archivos...
git add -A

REM Paso 3: Commit
echo [3/5] Creando commit...
git commit -m "Migrate to PostgreSQL/Supabase - production ready"

REM Paso 4: Push a GitHub
echo [4/5] Subiendo a GitHub...
git branch -M main
git push -u origin main --force

echo.
echo [5/5] ============================================
echo Codigo subido a GitHub exitosamente!
echo ============================================
echo.
echo SIGUIENTE PASO: Configurar DATABASE_URL en Vercel
echo.
echo 1. Ve a https://vercel.com/dashboard
echo 2. Entra a tu proyecto HospitalityUP
echo 3. Settings - Environment Variables
echo 4. Agrega:
echo    Nombre:  DATABASE_URL
echo    Valor:   postgresql://postgres:@dministradoR1@db.myfnzgolubdjzofozcqo.supabase.co:5432/postgres
echo    (selecciona Production, Preview y Development)
echo 5. Save
echo.
echo LUEGO: Crear tablas y seed en Supabase
echo.
echo Abre una terminal y ejecuta:
echo    set DATABASE_URL=postgresql://postgres:@dministradoR1@db.myfnzgolubdjzofozcqo.supabase.co:5432/postgres
echo    npx prisma generate
echo    npx prisma db push
echo    npx prisma db seed
echo.
pause
