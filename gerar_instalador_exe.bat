@echo off
setlocal enabledelayedexpansion
title Gerador de Instalador .EXE - PixelAI
color 0E

echo ======================================================================
echo           COMPILADOR DO INSTALADOR EXECUTAVEL (.EXE)
echo ======================================================================
echo Este utilitario ira compilar todos os arquivos do projeto com o layout
echo visual personalizado (Neon/Cyberpunk) no instalador .EXE oficial.
echo ======================================================================
echo.

set "PROJECT_DIR=%~dp0"
set "INNO_COMPILER="

:: 0. Gerar assets visuais (Ícone .ico, Sidebar .bmp, Header .bmp)
echo [*] Gerando assets visuais do layout...
python "%PROJECT_DIR%gerar_assets_instalador.py" >nul 2>&1
if !errorlevel! equ 0 (
    echo [+] Assets visuais preparados com sucesso.
) else (
    echo [!] Aviso: Python nao executou gerar_assets_instalador.py, usando assets existentes.
)
echo.

:: 1. Procurar Inno Setup no sistema
if exist "%LOCALAPPDATA%\Programs\Inno Setup 6\ISCC.exe" (
    set "INNO_COMPILER=%LOCALAPPDATA%\Programs\Inno Setup 6\ISCC.exe"
) else if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" (
    set "INNO_COMPILER=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
) else if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe" (
    set "INNO_COMPILER=%ProgramFiles%\Inno Setup 6\ISCC.exe"
)

:: 2. Se não encontrar, tentar baixar a versão portátil/winget
if not defined INNO_COMPILER (
    echo [*] Inno Setup Compiler nao detectado localmente.
    echo [*] Tentando instalar/localizar o Inno Setup automaticamente via Winget...
    
    winget install --id JRSoftware.InnoSetup -e --silent >nul 2>&1
    
    if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" (
        set "INNO_COMPILER=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
    ) else if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe" (
        set "INNO_COMPILER=%ProgramFiles%\Inno Setup 6\ISCC.exe"
    )
)

:: 3. Compilar o script .iss
if defined INNO_COMPILER (
    echo [+] Compilador Inno Setup localizado: "!INNO_COMPILER!"
    echo [*] Compilando o executavel de instalacao...
    echo.
    
    "!INNO_COMPILER!" "%PROJECT_DIR%inno_setup_installer.iss"
    
    if !errorlevel! equ 0 (
        echo.
        echo ======================================================================
        echo [+] SUCESSO! O arquivo 'Instalador_Cabine_PixelAI_Setup.exe' foi criado!
        echo Voce pode distribuir esse arquivo .EXE para qualquer computador.
        echo ======================================================================
    ) else (
        echo.
        echo [ERRO] Ocorreu uma falha durante a compilacao do .EXE.
    )
) else (
    echo.
    echo [!] Nao foi possivel localizar o compilador ISCC.exe do Inno Setup.
    echo Para gerar o .EXE:
    echo  1. Baixe e instale o Inno Setup gratuitamente em: https://jrsoftware.org/isdl.php
    echo  2. Clique com o botao direito em 'inno_setup_installer.iss' e selecione 'Compile'.
    echo.
    echo DICA: Voce tambem pode rodar diretamente o instalador 'instalar_tudo.bat'!
)

echo.
pause
