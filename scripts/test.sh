#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Executing Automated Application Tests"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT/tests"

if [ ! -d "node_modules" ]; then
    echo "Installing test dependencies..."
    npm install
fi

npm test

echo "✅ All automated unit tests passed successfully!"
