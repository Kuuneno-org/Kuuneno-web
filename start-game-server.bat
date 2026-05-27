@echo off
REM Script de démarrage du serveur de jeu Java pour Windows
REM Utilisation: start-game-server.bat [port]

setlocal enabledelayedexpansion

set PORT=%1
if "%PORT%"=="" set PORT=8080

set JAR_PATH=public\games\KuenosGame.jar

echo 🎮 Demarrage du serveur de jeu Java...
echo 📡 Port: %PORT%
echo 📦 JAR: %JAR_PATH%
echo.

REM Verifier que le JAR existe
if not exist "%JAR_PATH%" (
    echo ❌ Erreur: Le fichier JAR n'existe pas a %JAR_PATH%
    pause
    exit /b 1
)

REM Verifier que Java est installe
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Erreur: Java n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)

REM Afficher la version de Java
echo ✅ Version de Java:
java -version

echo.
echo 🚀 Demarrage du serveur...
echo.

REM Demarrer le serveur
set PORT=%PORT%
node server.js

pause
