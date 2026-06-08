#!/bin/bash
# ============================================
# 最快：用在线工具生成 APK（30 秒，无需任何软件）
# ============================================
echo "📦 在线生成 APK 方案"
echo ""
echo "👉 打开浏览器访问: https://www.pwabuilder.com"
echo "   输入: https://codequiz.liyaoyao.top"
echo "   点击 Android → Store Package → 下载 APK"
echo "   把下载的 .apk 放到当前目录即可"
echo ""
echo "========================================="
echo ""
echo "📦 本地生成 APK 方案（需要 Node.js 18+）"
echo "========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
  echo "❌ 未找到 Node.js，请先安装: https://nodejs.org"
  echo "   然后用方案一（在线工具）最快"
  exit 1
fi

# 用 bubbly 生成（纯 Node.js，不需要 Android SDK）
echo ">>> 安装 bubbly..."
npm install -g bubbly 2>/dev/null || true

echo ">>> 生成 APK 配置..."
mkdir -p .apk-build
cd .apk-build

# 创建 TWA manifest
cat > twa-manifest.json << 'JSONEOF'
{
  "packageId": "top.liyaoyao.codequiz",
  "host": "codequiz.liyaoyao.top",
  "name": "CodeQuiz",
  "launcherName": "CodeQuiz",
  "display": "standalone",
  "themeColor": "#1677ff",
  "backgroundColor": "#ffffff",
  "startUrl": "/",
  "iconUrl": "https://codequiz.liyaoyao.top/icon-512.svg",
  "maskableIconUrl": "https://codequiz.liyaoyao.top/icon-192.svg"
}
JSONEOF

echo ""
echo "配置文件已生成: .apk-build/twa-manifest.json"
echo ""
echo "现在运行以下命令完成 APK 生成:"
echo ""
echo "  npx @bubblewrap/cli init --manifest https://codequiz.liyaoyao.top/manifest.webmanifest"
echo "  cd 生成的目录 && npx @bubblewrap/cli build"
echo ""
echo "  或直接访问 https://www.pwabuilder.com 下载"
