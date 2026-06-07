#!/bin/bash
set -e

echo ">>> Generating Prisma Client..."
pnpm exec prisma generate

echo ">>> Building output directory..."
mkdir -p public

# Placeholder for static output
echo "" > public/index.html

echo ">>> Build complete"
