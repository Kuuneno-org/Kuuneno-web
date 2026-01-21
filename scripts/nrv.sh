#!/bin/bash

# NRV: Nickel Rendez-Vous (Lint & Test Runner)
# Usage: ./scripts/nrv.sh [--fix]

FIX_MODE=false

# Check arguments
if [[ "$1" == "--fix" ]]; then
  FIX_MODE=true
fi

echo "🚀 NRV: Démarrage des vérifications..."

# 1. Linting
if [ "$FIX_MODE" = true ]; then
  echo "🧹 Exécution du Linting avec auto-fix..."
  npm run lint:fix
else
  echo "🔍 Exécution du Linting..."
  npm run lint
fi

# Capture exit code of linting
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -ne 0 ]; then
  echo "❌ Erreur: Le linting a échoué."
  echo "💡 Astuce: Lance 'nrv --fix' pour corriger automatiquement les problèmes de style."
  exit 1
fi

echo "✅ Linting OK."

# 2. Type Checking
echo "TypeScript Check..."
npm run type-check
TYPE_EXIT_CODE=$?

if [ $TYPE_EXIT_CODE -ne 0 ]; then
  echo "❌ Erreur: La vérification TypeScript a échoué."
  exit 1
fi

echo "✅ TypeScript OK."

# 3. Tests
echo "🧪 Lancement des tests..."
npm run test -- --run

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "❌ Erreur: Les tests ont échoué."
  exit 1
fi

echo "🎉 TOUT EST NICKEL ! PRÊT À PUSH."
exit 0
