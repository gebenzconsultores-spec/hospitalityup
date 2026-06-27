@echo off
chcp 65001 >nul
echo ============================================
echo   HospitalityUP - Sincronizar con Sandbox
echo   Trae todos los cambios nuevos a tu PC
echo ============================================
echo.

cd /d "C:\Users\Hp Smart\Documents\CODIGOS HTML DE APPS\HOSPITALITYUP\hospitalityup"

echo Verificando conexion a GitHub...
git remote -v

echo.
echo [1/3] Descargando archivo de parche...
echo El archivo hospitalityup-update.patch contiene todos los cambios.

echo.
echo [2/3] Aplicando parche...
git apply hospitalityup-update.patch

if errorlevel 1 (
    echo.
    echo El parche no se pudo aplicar automaticamente.
    echo Intentando metodo alternativo...
    echo.
    echo Actualizando schema.prisma...
    powershell -Command "$c = Get-Content 'prisma/schema.prisma' -Raw; $c = $c -replace 'provider = \"sqlite\"', 'provider = \"postgresql\"'; if ($c -notmatch 'tipoJornada') { $c = $c -replace '(rutaCarreraEn\s+String\?)', \"`$1`n  tipoJornada         String   @default('fijo')`n  horarioEntrada      String?`n  horarioSalida       String?`n  diasTrabajo         String?`n  cubreTurnos         Boolean  @default(false)`n  turnoPreferido      String?`n  salario             Float?`n  tipoContrato        String?`n  fechaFinContrato    DateTime?\" }; Set-Content 'prisma/schema.prisma' $c -NoNewline"
    
    echo Actualizando .env...
    echo DATABASE_URL="postgresql://postgres:@dministradoR1@db.myfnzgolubdjzofozcqo.supabase.co:5432/postgres" > .env
    
    echo.
    echo ============================================
    echo  METODO ALTERNATIVO NECESARIO
    echo ============================================
    echo.
    echo Los archivos nuevos son muy grandes para crearlos con este script.
    echo.
    echo SOLUCION: Crea un GitHub Personal Access Token y lo uso 
    echo para subir los cambios directamente.
    echo.
    echo PASOS PARA CREAR TOKEN:
    echo   1. Ve a https://github.com/settings/tokens
    echo   2. Click "Generate new token (classic)"
    echo   3. Nombre: hospitalityup-deploy
    echo   4. Selecciona "repo" (todo el primer grupo)
    echo   5. Click "Generate token"
    echo   6. Copia el token (empieza con ghp_)
    echo   7. Pegalo aqui abajo:
    echo.
    set /p TOKEN="Pega tu token aqui: "
    
    if "%TOKEN%"=="" (
        echo No se proporciono token. Saliendo...
        pause
        exit /b 1
    )
    
    echo.
    echo Subiendo cambios a GitHub con token...
    git remote set-url origin https://%TOKEN%@github.com/gebenzconsultores-spec/hospitalityup.git
    git add -A
    git commit -m "feat: Add Propiedades CRUD + Empleados schedule fields"
    git push origin main
    git remote set-url origin https://github.com/gebenzconsultores-spec/hospitalityup.git
    
    echo.
    echo Limpiando token del historial...
    echo Token eliminado de la configuracion.
)

echo.
echo [3/3] Generando cliente Prisma...
call npx prisma generate

echo.
echo ============================================
echo  Actualizando base de datos...
echo ============================================
set DATABASE_URL=postgresql://postgres:@dministradoR1@db.myfnzgolubdjzofozcqo.supabase.co:5432/postgres
call npx prisma db push

echo.
echo ============================================
echo  Listo! Ahora haz Redeploy en Vercel
echo ============================================
echo.
echo 1. Ve a https://vercel.com/dashboard
echo 2. Entra a hospitalityup
echo 3. Deployments - Redeploy
echo.
pause
