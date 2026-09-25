@echo off
rem Se relanza dentro de "cmd /k" para que la ventana nunca se cierre sola y se vea cualquier error.
if not "%~1"=="__dentro" (
  cmd /k ""%~f0" __dentro"
  exit /b
)
title Atenea - Centro de mando
cd /d "%~dp0"
echo Carpeta: %CD%

where node >/dev/null 2>nul
if errorlevel 1 (
  echo No encuentro Node.js. Instala la version LTS desde https://nodejs.org y vuelve a abrir este archivo.
  goto :fin
)
for /f "delims=" %%v in ('node -v') do echo Node.js %%v

if not exist package.json (
  echo No encuentro package.json en esta carpeta.
  echo Si abriste el archivo desde dentro del ZIP, primero descomprime todo con clic derecho y "Extraer todo".
  goto :fin
)

if not exist node_modules (
  echo Instalando dependencias por primera vez, puede tardar unos minutos...
  call npm install --no-audit --no-fund
  if errorlevel 1 goto :error
)

if not exist .env (
  copy .env.example .env >nul
  echo Se creo el archivo .env: agrega tu clave de IA ahi y vuelve a iniciar.
)

echo Preparando la interfaz...
call npm run build --silent
if errorlevel 1 goto :error

echo.
echo Atenea se abrira en el navegador. No cierres esta ventana mientras la uses.
node --disable-warning=ExperimentalWarning server\index.js --abrir
goto :fin

:error
echo.
echo Hubo un error. Copia el mensaje de arriba y envialo para revisarlo.

:fin
echo.
echo (Puedes cerrar esta ventana.)
