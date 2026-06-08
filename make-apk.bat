@echo off
echo =============================================
echo   CodeQuiz APK Generator
echo =============================================
echo.

REM 检查 Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Java JDK 17+
    echo 请先安装: https://adoptium.net/download
    pause
    exit /b 1
)

echo [1/3] 安装 bubblewrap...
call npm install -g @bubblewrap/cli 2>nul
if %errorlevel% neq 0 (
    echo 使用 npx 方式运行...
)

echo.
echo [2/3] 初始化 TWA 项目（会弹出几个问题，全部回车默认即可）
echo.
mkdir codequiz-apk 2>nul
cd codequiz-apk
call npx @bubblewrap/cli init --manifest https://codequiz.liyaoyao.top/manifest.webmanifest

echo.
echo [3/3] 构建 APK...
call npx @bubblewrap/cli build

echo.
echo =============================================
echo   APK 生成完成！
echo   文件在 codequiz-apk\ 目录下
echo   查找 .apk 文件，传到手机安装
echo =============================================
pause
