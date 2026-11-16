#!/bin/bash
# 双击即可运行：以源码方式启动 WeChat Online 开发服务器
cd "$(dirname "$0")" || exit 1

# 双击启动时 PATH 可能不含这些目录，统一补上
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/share/pnpm:$PATH"

pause_and_exit() {
  echo
  echo "按任意键关闭窗口..."
  read -n 1 -s
  exit "${1:-1}"
}

echo "==================================="
echo "  WeChat Online 源码模式启动"
echo "==================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo "✗ 未找到 Node.js，请先安装 Node.js 18 或更高版本：https://nodejs.org/"
  pause_and_exit
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "✗ 未找到 pnpm，请先在终端执行：npm install -g pnpm"
  pause_and_exit
fi

echo "Node $(node -v) / pnpm $(pnpm -v)"
echo

if [ ! -d packages/web/node_modules ]; then
  echo "首次运行，正在安装依赖（可能需要几分钟）..."
  echo
  pnpm install || { echo; echo "✗ 依赖安装失败，请把上面的报错发给我。"; pause_and_exit; }
  echo
fi

echo "正在启动，服务就绪后会自动打开浏览器（端口 4444）..."
echo "关闭此窗口即停止服务。"
echo

# vite 的 --open 会在服务就绪后自动打开默认浏览器
pnpm -F @wechat-online/web run dev --open

echo
echo "服务已停止。"
pause_and_exit 0
