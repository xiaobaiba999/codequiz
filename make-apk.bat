@echo off
set JAVA_HOME=D:\develop\jdk17
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d %~dp0

echo ============================================
echo   CodeQuiz APK Generator
echo ============================================
echo.
echo 接下来会进入交互界面，按提示操作：
echo.
echo   Q1: Do you want Bubblewrap to install the JDK?
echo   A1: 输入 n 然后回车
echo.
echo   Q2: Path to your existing JDK 17:
echo   A2: 输入 D:\develop\jdk17 然后回车
echo.
echo   其他问题全部回车默认即可
echo ============================================
echo.
pause

rmdir /s /q codequiz-apk 2>nul
npx @bubblewrap/cli init --manifest https://codequiz.liyaoyao.top/manifest.webmanifest --directory codequiz-apk

if not exist "codequiz-apk\twa-manifest.json" (
    echo 初始化失败，请重试
    pause
    exit /b 1
)

cd codequiz-apk
echo.
echo 初始化成功，开始构建...
call npx @bubblewrap/cli build

echo.
echo ============================================
echo   构建完成！
echo   APK 在 codequiz-apk 目录下
echo ============================================
pause
