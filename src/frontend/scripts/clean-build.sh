#!/bin/bash

# Clean build script for BISAULI Store frontend
# Performs a cache-free build suitable for deployment verification

set -e

echo "🧹 Starting clean build process..."

# Navigate to frontend directory
cd "$(dirname "$0")/.."

echo "📦 Removing build artifacts and caches..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .turbo/
rm -rf node_modules/.cache/

echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔍 Running TypeScript type check..."
pnpm typescript-check

echo "🏗️  Building application..."
pnpm build:skip-bindings

echo "✅ Clean build completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 POST-DEPLOYMENT VALIDATION CHECKLIST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🚀 Deploy the canisters:"
echo "   dfx deploy"
echo ""
echo "2. 🔍 Verify backend health (in a fresh browser session):"
echo "   - Open browser DevTools Console"
echo "   - Navigate to your site"
echo "   - Check that healthCheck() returns \"Running\""
echo ""
echo "3. 🛍️  Verify public catalog access (no login required):"
echo "   - Home page loads immediately with skeleton UI"
echo "   - Products and categories display without errors"
echo "   - No prolonged blank screens or spinners"
echo ""
echo "4. 📊 Verify admin dashboard (requires Internet Identity login):"
echo "   - Login with Internet Identity"
echo "   - Navigate to /admin"
echo "   - Dashboard shows stats or clear error messages (not misleading zeros)"
echo "   - Retry buttons work when backend becomes available"
echo ""
echo "5. ⚡ Verify fail-fast behavior:"
echo "   - If backend is stopped, errors appear within ~8 seconds"
echo "   - No indefinite loading states"
echo "   - Clear English error messages with Retry buttons"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
