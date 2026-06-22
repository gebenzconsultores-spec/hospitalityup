@echo off
echo ============================================
echo   HospitalityUP - Actualizar y Subir a GitHub
echo ============================================
echo.
echo Esto descargara los cambios y los subira a GitHub.
echo.
pause

cd /d "%~dp0.."

git add -A
git commit -m "Fix: API routes with mock data for Vercel"
git branch -M main
git push -u origin main

echo.
echo ============================================
echo   Listo! Ve a Vercel y espera a que se redepliegue.
echo ============================================
pause
