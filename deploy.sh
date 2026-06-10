#!/bin/bash
# ============================================================================
# v13 一键部署脚本
# 构建 → 测试 → Git Push (GitHub Pages 自动部署)
# ============================================================================
# GitHub Pages: https://prada741126-ship-it.github.io/macau-sync-v13/
# GitHub Repo:  https://github.com/prada741126-ship-it/macau-sync-v13
# ============================================================================

set -e  # 任何一步失败立即停止

echo "========================================"
echo "  v13 Macau Sync — Deploy Script"
echo "========================================"

# Step 1: 构建 + 50项自动测试
echo ""
echo "[1/3] Building + Testing..."
node build.js
if [ $? -ne 0 ]; then
  echo "❌ Build or test failed! 部署中止。"
  exit 1
fi

# Step 2: 提交并推送
echo ""
echo "[2/3] Committing..."
VERSION=$(node -e "console.log(require('./version.json').version)")
git add dist/index.html version.json
git commit -m "v${VERSION} — $(date +%Y-%m-%d)" || echo "  (no changes to commit)"

echo ""
echo "[3/3] Pushing to GitHub..."
git push origin main

echo ""
echo "========================================"
echo "  ✅ Deploy complete!"
echo "  GitHub Pages: https://prada741126-ship-it.github.io/macau-sync-v13/"
echo "  GitHub Repo:  https://github.com/prada741126-ship-it/macau-sync-v13"
echo "========================================"
