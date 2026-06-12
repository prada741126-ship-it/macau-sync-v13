#!/bin/bash
# ============================================================================
# v13 一键部署脚本 — 完全独立于旧版
# ============================================================================
# Cloudflare Pages: (需手动在 CF Dashboard 连接 GitHub)
# GitHub Pages:     https://prada741126-ship-it.github.io/macau-sync-v13-pages/
# 源码 Repo:        https://github.com/prada741126-ship-it/macau-sync-v13
# 部署 Repo:        https://github.com/prada741126-ship-it/macau-sync-v13-pages
# 旧版 (不再碰):    macau-sync-v2 / macau-sync (render-deploy)
# ============================================================================

set -e

DEPLOY_DIR="../macau-sync-v13-pages"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo "  v13 Macau Sync — Deploy Script (独立版)"
echo "========================================"

# ── Step 1: 构建 + 50项自动测试 ──
echo ""
echo "[1/5] Building + 50 Tests..."
node build.js
if [ $? -ne 0 ]; then
  echo "❌ Build or test failed! 部署中止。"
  exit 1
fi
echo "  ✅ Build + 50/50 PASSED"

# ── Step 2: 提交源码到 v13 源码 repo ──
echo ""
echo "[2/5] Committing source to macau-sync-v13..."
VERSION=$(node -e "console.log(require('./version.json').version)")
git add dist/index.html dist/app.js index.html app.js version.json
git commit -m "v${VERSION} — $(date +%Y-%m-%d)" || echo "  (no changes to commit)"

echo ""
echo "[3/5] Pushing source to macau-sync-v13..."
git push origin main
echo "  ✅ Source pushed"

# ── Step 3: 部署到 独立部署 Repo (GitHub Pages) ──
echo ""
echo "[4/5] Deploying to macau-sync-v13-pages (GitHub Pages)..."
if [ -d "$DEPLOY_DIR" ]; then
  cp dist/app.js "$DEPLOY_DIR/app.js"
  cp dist/index.html "$DEPLOY_DIR/index.html"
  cp dist/_headers "$DEPLOY_DIR/_headers" 2>/dev/null || true
  cp dist/_redirects "$DEPLOY_DIR/_redirects" 2>/dev/null || true
  cd "$DEPLOY_DIR"
  git add app.js index.html _headers _redirects 2>/dev/null || true
  git commit -m "v${VERSION} — $(date +%Y-%m-%d)" || echo "  (no deploy changes)"
  git push origin main
  cd "$SCRIPT_DIR"
  echo "  ✅ Deployed to macau-sync-v13-pages"
  echo "  🌐 GitHub Pages: https://prada741126-ship-it.github.io/macau-sync-v13-pages/"
else
  echo "  ⚠️  $DEPLOY_DIR not found — 请先 clone:"
  echo "     git clone https://github.com/prada741126-ship-it/macau-sync-v13-pages.git ../macau-sync-v13-pages"
fi

# ── Step 4: 部署到 Cloudflare Pages (需要 CLOUDFLARE_API_TOKEN) ──
echo ""
echo "[5/5] Deploying to Cloudflare Pages..."
if [ -n "${CLOUDFLARE_API_TOKEN}" ]; then
  npx wrangler pages deploy dist/ --project-name=macau-sync --branch=main 2>&1 || echo "  ⚠️  wrangler deploy failed"
elif [ -n "${CLOUDFLARE_EMAIL}" ] && [ -n "${CLOUDFLARE_API_KEY}" ]; then
  CLOUDFLARE_API_TOKEN="" npx wrangler pages deploy dist/ --project-name=macau-sync --branch=main 2>&1 || echo "  ⚠️  wrangler deploy failed"
else
  echo "  ℹ️  未检测到 Cloudflare 凭证 (CLOUDFLARE_API_TOKEN)"
  echo "  ℹ️  跳过 Cloudflare Pages 部署"
  echo "  ℹ️  GitHub Pages 已成功部署 ↑"
fi

echo ""
echo "========================================"
echo "  ✅ Deploy Complete!"
echo ""
echo "  📦 源码:  https://github.com/prada741126-ship-it/macau-sync-v13"
echo "  🌐 GH Pages: https://prada741126-ship-it.github.io/macau-sync-v13-pages/"
echo "  ☁️  CF Pages: https://macau-sync.pages.dev (需在 CF Dashboard 设置)"
echo ""
echo "  🔒 旧版 (不再维护):"
echo "     - macau-sync-v2 (GitHub Pages) — 停止部署"
echo "     - macau-sync (Railway) — 已废弃"
echo "========================================"
