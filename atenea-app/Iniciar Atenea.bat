@echo off
rem Iniciador de Atenea. Sin bloques entre parentesis: la ruta de la carpeta puede
rem traer parentesis (por ejemplo "Atenea (1)") y romperlos.
if "%~1"=="__dentro" goto inicio
start "Atenea - Centro de mando" /min cmd /k call "%~f0" __dentro
exit /b

:inicio
cd /d "%~dp0"
where node >nul 2>nul || goto sinnode
if not exist package.json goto sinzip
echo Iniciando Atenea... (esta ventana puede quedar minimizada; cerrarla detiene la app)
node --disable-warning=ExperimentalWarning iniciar.mjs
echo.
echo Atenea se detuvo. Si ves un error arriba, copialo y envialo para revisarlo.
goto :eof

:sinnode
echo No encuentro Node.js. Instala la version LTS desde https://nodejs.org y vuelve a abrir este archivo.
goto :eof

:sinzip
echo No encuentro los archivos de la app en esta carpeta.
echo Si abriste el archivo desde dentro del ZIP, primero descomprime todo con clic derecho y "Extraer todo".
goto :eof
