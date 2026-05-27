#!/bin/bash

# Script de démarrage du serveur de jeu Java
# Utilisation: ./start-game-server.sh [port]

PORT=${1:-8080}
JAR_PATH="./public/games/KuenosGame.jar"

echo "🎮 Démarrage du serveur de jeu Java..."
echo "📡 Port: $PORT"
echo "📦 JAR: $JAR_PATH"
echo ""

# Vérifier que le JAR existe
if [ ! -f "$JAR_PATH" ]; then
    echo "❌ Erreur: Le fichier JAR n'existe pas à $JAR_PATH"
    exit 1
fi

# Vérifier que Java est installé
if ! command -v java &> /dev/null; then
    echo "❌ Erreur: Java n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

# Afficher la version de Java
echo "✅ Version de Java:"
java -version

echo ""
echo "🚀 Démarrage du serveur..."
echo ""

# Démarrer le serveur
PORT=$PORT node server.js
