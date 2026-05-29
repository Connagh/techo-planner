#!/bin/bash
# Double-click this file in Finder to start the techo planner dev server.

cd "$(dirname "$0")" || exit 1

echo "techo — starting dev server…"
echo "Project: $(pwd)"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install it from https://nodejs.org/ and try again."
  read -r -p "Press Enter to close…"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run)…"
  npm install || {
    echo "npm install failed."
    read -r -p "Press Enter to close…"
    exit 1
  }
  echo ""
fi

echo "Opening http://localhost:5173/"
echo "Press Ctrl+C in this window to stop the server."
echo ""

npm run dev -- --open
