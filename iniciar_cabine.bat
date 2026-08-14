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
echo [*] Verificando dependencias...
"!PYTHON_EXE!" -m pip install -r requirements.txt
echo.
echo ==================================================
echo        INICIANDO A INTELIGENCIA ARTIFICIAL
echo ==================================================
echo.
"!PYTHON_EXE!" server.py
pause
