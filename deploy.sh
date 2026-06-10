#!/bin/bash
# ============================================================================
# v13 一键部署脚本
# 构建 → 测试 → 双平台部署 (Railway + GitHub Pages)
# ============================================================================

set -e  # 任何一步失败立即停止

echo "========================================"
echo "  v13 Macau Sync — Deploy Script"
echo "========================================"

# Step 1: 构建 + 测试
echo ""
echo "[1/4] Building..."
node build.js
if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

# Step 2: 复制到 GitHub Pages 目录
echo ""
echo "[2/4] Copying to GitHub Pages..."
GHPAGES_DIR="../macau-sync-v2/docs"
if [ -d "$GHPAGES_DIR" ]; then
  cp dist/index.html "$GHPAGES_DIR/index.html"
  echo "  ✓ Copied to $GHPAGES_DIR/"
else
  echo "  ⚠ GitHub Pages dir not found: $GHPAGES_DIR — creating..."
  mkdir -p "$GHPAGES_DIR"
  cp dist/index.html "$GHPAGES_DIR/index.html"
fi

# Step 3: 双平台 push
echo ""
echo "[3/4] Pushing to Railway..."
git add dist/index.html version.json
git commit -m "v$(node -e "console.log(require('./version.json').version)") — $(date +%Y-%m-%d)" || echo "  (no changes to commit)"
git push

echo ""
echo "[4/4] Pushing to GitHub Pages..."
if [ -d "../macau-sync-v2" ]; then
  cd ../macau-sync-v2
  git add docs/index.html
  git commit -m "v$(node -e "console.log(require('../v13-new/version.json').version)") — $(date +%Y-%m-%d)" || echo "  (no changes to commit)"
  git push
  cd -
fi

echo ""
echo "========================================"
echo "  ✅ Deploy complete!"
echo "  Railway: https://macau-sync-production-4a7b.up.railway.app"
echo "  GitHub:  https://prada741126-ship-it.github.io/macau-sync-v2/"
echo "========================================"
