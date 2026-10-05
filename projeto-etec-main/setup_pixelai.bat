@echo off
setlocal enabledelayedexpansion
title Instalador de Dependencias - PixelAI
color 0B

echo ==================================================
echo       INSTALADOR DE AMBIENTE PIXELAI
echo ==================================================
echo Este script ira preparar seu computador para rodar
echo o servidor e a Inteligencia Artificial.
echo.

:: ==================================================
:: CONFIGURAÇÃO MANUAL (OPCIONAL)
set "CUSTOM_PYTHON_PATH="
:: ==================================================

:: 1. Tentar usar o caminho manual se definido
if defined CUSTOM_PYTHON_PATH (
    if exist "!CUSTOM_PYTHON_PATH!" (
        set "PYTHON_EXE=!CUSTOM_PYTHON_PATH!"
        goto :python_found
    )
)

:: 2. Detecção Automática Inteligente
set "PYTHON_EXE="

:: Testar 'py'
py --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "delims=" %%i in ('where py') do (
        set "PYTHON_EXE=%%i"
        goto :python_found
    )
)

:: Testar 'python'
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
    echo [!] Python nao detectado no sistema.
    echo.
    echo Deseja que eu tente instalar o Python 3.11 automaticamente para voce? (S/N)
    echo (Requer Windows 10/11 com Winget habilitado)
    set /p install_py="> "
    if /I "!install_py!"=="S" (
        echo.
        echo Tentando instalar via Windows Package Manager (Winget)...
        winget install -e --id Python.Python.3.11
        if !errorlevel! neq 0 (
            echo.
            echo [ERRO] Nao foi possivel instalar automaticamente via Winget.
            echo Por favor, baixe e instale manualmente em: https://www.python.org/downloads/
            pause
            exit /b
        )
        echo [+] Python instalado com sucesso! Reinicie o script.
        pause
        exit /b
    ) else (
        echo Instalacao cancelada.
        pause
        exit /b
    )
)

:python_found
echo [+] Python localizado: "!PYTHON_EXE!"
"!PYTHON_EXE!" --version
echo.


:: Garantir que as próximas chamadas usem o comando correto
set "PYTHON_EXEC=!PYTHON_EXE!"

:: 2. Verificar/Atualizar Pip
echo [*] Verificando Pip...
"!PYTHON_EXEC!" -m ensurepip >nul 2>&1
"!PYTHON_EXEC!" -m pip install --upgrade pip
echo [+] Pip configurado.
echo.

:: 3. Instalar bibliotecas do requirements.txt
if exist requirements.txt (
    echo [*] Instalando bibliotecas necessarias...
    echo (Isso pode levar alguns minutos na primeira vez)
    echo.
    "!PYTHON_EXEC!" -m pip install -r requirements.txt
    if !errorlevel! neq 0 (
        echo.
        echo [ERRO] Ocorreu um problema ao instalar as bibliotecas.
        echo Verifique sua conexao com a internet e tente novamente.
        pause
        exit /b
    )

    echo.
    echo [+] Todas as bibliotecas foram instaladas com sucesso!
) else (
    echo [!] AVISO: Arquivo requirements.txt nao encontrado.
    echo Algumas bibliotecas podem estar faltando.
)

echo.
echo ==================================================
echo        CONFIGURACAO CONCLUIDA!
echo ==================================================
echo Agora voce pode iniciar o servidor usando:
echo iniciar_cabine.bat
echo.
pause
