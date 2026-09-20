@echo off
setlocal enabledelayedexpansion
title Instalador Completo - Cabine Fotografica PixelAI
color 0A

echo ======================================================================
echo           INSTALADOR COMPLETO DA CABINE FOTOGRAFICA PIXELAI
echo ======================================================================
echo  Este instalador ira configurar automaticamente:
echo    1. Python 3 e Gerenciador de Pacotes (Pip)
echo    2. Bibliotecas de Inteligencia Artificial (rembg, ONNX, OpenCV, Flask)
echo    3. Pre-download dos modelos de IA para processamento instantaneo
echo    4. Suporte a Cameras DroidCam e Webcams HD
echo    5. Atalho de inicializacao direta na Area de Trabalho
echo ======================================================================
echo.

set "PROJECT_DIR=%~dp0"

:: ----------------------------------------------------------------------
:: ETAPA 1: VERIFICAÇÃO / INSTALAÇÃO DO PYTHON
:: ----------------------------------------------------------------------
echo [ETAPA 1/5] Verificando instalacao do Python...

set "PYTHON_CMD="
py --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=py"
) else (
    python --version >nul 2>&1
    if !errorlevel! equ 0 (
        for /f "delims=" %%i in ('where python') do (
            echo %%i | findstr /i "WindowsApps" >nul
            if errorlevel 1 (
                set "PYTHON_CMD=python"
            )
        )
    )
)

if not defined PYTHON_CMD (
    echo [!] Python nao encontrado no sistema.
    echo [*] Baixando e instalando Python 3.11 oficial silenciosamente...
    
    set "PY_INSTALLER=%TEMP%\python_installer.exe"
    powershell -Command "Write-Host 'Baixando Python 3.11...'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe', '$env:TEMP\python_installer.exe')"
    
    if exist "!PY_INSTALLER!" (
        echo [*] Executando instalacao do Python (Adicionando ao PATH)...
        "!PY_INSTALLER!" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
        timeout /t 5 >nul
        del "!PY_INSTALLER!" >nul 2>&1
        set "PYTHON_CMD=python"
    ) else (
        echo [ERRO] Falha ao baixar o Python. Por favor instale manualmente de python.org
        pause
        exit /b 1
    )
)

echo [+] Python detectado e pronto para uso:
!PYTHON_CMD! --version
echo.

:: ----------------------------------------------------------------------
:: ETAPA 2: INSTALAÇÃO DAS DEPENDÊNCIAS PYTHON
:: ----------------------------------------------------------------------
echo [ETAPA 2/4] Instalando dependencias de Inteligencia Artificial e Servidor...
echo [*] Verificando e atualizando Pip com python -m...
!PYTHON_CMD! -m ensurepip --default-pip >nul 2>&1
!PYTHON_CMD! -m pip install --upgrade pip >nul 2>&1

echo [*] Instalando bibliotecas do requirements.txt (rembg, opencv, flask, onnxruntime, pillow)...
!PYTHON_CMD! -m pip install -r "%PROJECT_DIR%requirements.txt"

if !errorlevel! neq 0 (
    echo [!] Tentando instalacao direta e forcada do rembg[cpu] e pacotes essenciais...
    !PYTHON_CMD! -m pip install rembg[cpu] onnxruntime opencv-python-headless flask flask-cors Pillow requests numpy
)

!PYTHON_CMD! -c "import rembg, flask, PIL, cv2" >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo [ERRO] Ocorreu uma falha ao instalar as dependencias.
    echo Verifique sua conexao com a internet e tente novamente.
    pause
    exit /b 1
)
echo [+] Todas as bibliotecas Python (rembg, Flask, etc) foram instaladas com sucesso!
echo.

:: ----------------------------------------------------------------------
:: ETAPA 3: PRÉ-DOWNLOAD DOS MODELOS DE IA
:: ----------------------------------------------------------------------
echo [ETAPA 3/4] Pre-carregando pesos da Inteligencia Artificial (Modo Offline Instantaneo)...
if exist "%PROJECT_DIR%preload_models.py" (
    !PYTHON_CMD! "%PROJECT_DIR%preload_models.py"
)
echo.

:: ----------------------------------------------------------------------
:: ETAPA 4: CRIAÇÃO DO ATALHO NA ÁREA DE TRABALHO
:: ----------------------------------------------------------------------
echo [ETAPA 4/4] Criando atalho na Area de Trabalho...
set "SHORTCUT_SCRIPT=%TEMP%\create_shortcut.vbs"
set "TARGET_BAT=%PROJECT_DIR%iniciar_cabine.bat"

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%SHORTCUT_SCRIPT%"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\Cabine Fotografica PixelAI.lnk" >> "%SHORTCUT_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%SHORTCUT_SCRIPT%"
echo oLink.TargetPath = "%TARGET_BAT%" >> "%SHORTCUT_SCRIPT%"
echo oLink.WorkingDirectory = "%PROJECT_DIR%" >> "%SHORTCUT_SCRIPT%"
echo oLink.Description = "Iniciar Servidor e Cabine Fotografica AI" >> "%SHORTCUT_SCRIPT%"
echo oLink.Save >> "%SHORTCUT_SCRIPT%"

cscript /nologo "%SHORTCUT_SCRIPT%" >nul 2>&1
del "%SHORTCUT_SCRIPT%" >nul 2>&1
echo [+] Atalho 'Cabine Fotografica PixelAI' criado na sua Area de Trabalho!
echo.

:: ----------------------------------------------------------------------
:: FINALIZAÇÃO
:: ----------------------------------------------------------------------
echo ======================================================================
echo                  INSTALACAO CONCLUIDA COM SUCESSO!
echo ======================================================================
echo  O ambiente esta 100%% configurado e pronto para uso.
echo.
echo  Para iniciar o sistema:
echo    - Clique no atalho 'Cabine Fotografica PixelAI' na sua Area de Trabalho
echo    OU
echo    - Execute o arquivo 'iniciar_cabine.bat'
echo ======================================================================
echo.
pause
