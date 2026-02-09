#!/bin/bash

# Inicialización para Claude Code Terminal
echo "🚀 Iniciando Claude Code Terminal..."
echo "📍 Ubicación: $(pwd)"
echo "👤 Usuario: $(whoami)"
echo ""

# Verificar que Claude Code está instalado
if command -v claude &> /dev/null; then
    echo "✅ Claude Code CLI disponible"
    echo "📝 Versión: $(claude --version 2>/dev/null || echo 'No disponible')"
else
    echo "❌ Claude Code CLI no encontrado"
    echo "🔧 Instalando Claude Code..."
    npm install -g @anthropic-ai/claude-code
fi

echo ""
echo "🎯 Comandos disponibles:"
echo "  claude --help     - Ayuda de Claude Code"
echo "  claude auth       - Configurar autenticación"
echo "  claude             - Iniciar Claude Code"
echo ""
echo "🔗 Para comenzar: claude auth"
echo ""