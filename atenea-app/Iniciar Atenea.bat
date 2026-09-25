@echo off
chcp 65001 >nul
title Atenea - Centro de mando
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo No encuentro Node.js. Instala la version LTS desde https://nodejs.org y vuelve a abrir este archivo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias por primera vez, puede tardar unos minutos...
  call npm install --no-audit --no-fund
  if errorlevel 1 ( pause & exit /b 1 )
)

if not exist .env (
  copy .env.example .env >nul
  echo Se creo el archivo .env: agrega tu clave de IA ahi y vuelve a iniciar.
)

echo Preparando la interfaz...
call npm run build --silent
if errorlevel 1 ( pause & exit /b 1 )

echo.
echo Atenea se abrira en el navegador. No cierres esta ventana mientras la uses.
node --disable-warning=ExperimentalWarning server\index.js --abrir
pause
