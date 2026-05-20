#!/bin/bash
# Script para inicializar git y subir el proyecto a GitHub.
# Uso: bash push_to_github.sh
# Requiere: git instalado y credenciales de GitHub configuradas
# (vía SSH key o GitHub CLI `gh auth login` o un Personal Access Token).

set -e

cd "$(dirname "$0")"

REPO_URL="https://github.com/JorgeZO/EcoCampus.git"

# 1. Inicializar repo si no existe
if [ ! -d ".git" ]; then
  echo ">> Inicializando repositorio git..."
  git init -b main
fi

# 2. Configurar usuario (cambia si quieres otros)
git config user.name  "Jorge Azuniga"
git config user.email "jazuniga.o@outlook.com"

# 3. Agregar remote si no existe
if ! git remote get-url origin >/dev/null 2>&1; then
  echo ">> Agregando remote origin..."
  git remote add origin "$REPO_URL"
fi

# 4. Add + commit
echo ">> Preparando commit..."
git add .
if git diff --cached --quiet; then
  echo ">> No hay cambios para commitear."
else
  git commit -m "Initial commit: EcoMonitor Industrial - sistema completo

Backend Node.js + Express + Mongoose con autenticación JWT.
Frontend HTML + CSS + JS vanilla con dashboard y reporte imprimible.
Documento de análisis, diagramas y seed con datos demo."
fi

# 5. Push
echo ">> Subiendo a GitHub..."
git branch -M main
git push -u origin main

echo ""
echo ">> LISTO. Revisa el repo: $REPO_URL"
