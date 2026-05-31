#!/usr/bin/env bash
# Rebuild and redeploy the site to GitHub Pages.
# Usage:  ./deploy.sh
set -e

REPO="https://github.com/advayshende-sketch/cannabis-brain.git"

echo "→ Building…"
npm run build

echo "→ Publishing dist/ to gh-pages…"
cd dist
touch .nojekyll
rm -rf .git
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.email=asmishende@gmail.com -c user.name=advayshende commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git remote add origin "$REPO"
git config http.postBuffer 524288000
git push -f -q -u origin gh-pages
cd ..

echo "✓ Deployed → https://advayshende-sketch.github.io/cannabis-brain/"
echo "  (live in ~30–60s)"
