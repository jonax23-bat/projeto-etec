@echo off
setlocal enabledelayedexpansion
title Servidor PixelAI - Cabine
color 0B

:: ==================================================
:: CONFIGURAÇÃO MANUAL (OPCIONAL)
:: Se o script não encontrar o Python, você pode colocar o caminho completo abaixo:
:: Exemplo: set "CUSTOM_PYTHON_PATH=C:\Python311\python.exe"
set "CUSTOM_PYTHON_PATH="
:: ==================================================

echo ==================================================
echo        INICIANDO SERVIDOR DA CABINE PIXELAI
echo ==================================================
echo.

:: 1. Tentar usar o caminho manual se definido
if defined CUSTOM_PYTHON_PATH (
    if exist "!CUSTOM_PYTHON_PATH!" (
        set "PYTHON_EXE=!CUSTOM_PYTHON_PATH!"
        goto :python_found
    )
)

:: 2. Detecção Automática Inteligente
set "PYTHON_EXE="

:: Testar 'py' (Python Launcher - Geralmente o mais confiável no Windows)
py --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "delims=" %%i in ('where py') do (
        set "PYTHON_EXE=%%i"
        goto :python_found
    )
)

:: Testar 'python' (evitando o stub da Windows Store)
python --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "delims=" %%i in ('where python') do (
        echo %%i | findstr /i "WindowsApps" >nul
        if errorlevel 1 (
            set "PYTHON_EXE=%%i"
            goto :python_found
        )
    )
)

:: Testar 'python3'
python3 --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "delims=" %%i in ('where python3') do (
        set "PYTHON_EXE=%%i"
        goto :python_found
    )
)

if not defined PYTHON_EXE (
    echo [ERRO] Python nao encontrado automaticamente! 
    echo.
    echo DICA: Edite este arquivo .bat e coloque o caminho do seu python.exe
    echo na variavel CUSTOM_PYTHON_PATH no topo do arquivo.
    pause
    exit /b
)

:python_found
echo [+] Python localizado em: "!PYTHON_EXE!"
echo.

:: Verificar se as bibliotecas essenciais de IA já estão instaladas
"!PYTHON_EXE!" -c "import rembg, flask, PIL, cv2" >nul 2>&1
if !errorlevel! neq 0 (
    echo [*] Bibliotecas de IA nao detectadas. Instalando diretamente na maquina com python -m pip...
    "!PYTHON_EXE!" -m ensurepip --default-pip >nul 2>&1
    "!PYTHON_EXE!" -m pip install --upgrade pip >nul 2>&1
    "!PYTHON_EXE!" -m pip install -r "%~dp0requirements.txt"
    if !errorlevel! neq 0 (
        echo [*] Tentando instalacao direta de emergencia do rembg e dependencias...
        "!PYTHON_EXE!" -m pip install rembg[cpu] flask flask-cors Pillow opencv-python-headless requests
    )
)

echo.
echo [*] Abrindo a Cabine no seu navegador em http://localhost:5000 ...
start "" http://localhost:5000
echo.
echo ==================================================
echo   SERVIDOR INICIADO COM SUCESSO!
echo   Pressione Ctrl+C para encerrar.
echo ==================================================
"!PYTHON_EXE!" "%~dp0server.py"
pause
