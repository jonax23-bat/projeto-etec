@echo off
title Servidor PixelAI - Cabine
color 0B
echo ==================================================
echo        INICIANDO SERVIDOR DA CABINE PIXELAI
echo ==================================================
echo.
echo Verificando e instalando dependencias (isso pode demorar na primeira vez)...
pip install -r requirements.txt
echo.
echo ==================================================
echo        INICIANDO A INTELIGENCIA ARTIFICIAL
echo ==================================================
echo.
python server.py
pause
