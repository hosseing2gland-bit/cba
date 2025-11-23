#!/bin/bash

# Script برای اجرای سریع Desktop App

echo "🚀 Starting Anti-Detect Browser..."
echo ""

cd "$(dirname "$0")/desktop-app"

echo "📦 Starting React dev server and Electron..."
npm run dev

