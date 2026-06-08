@echo off
set JAVA_HOME=D:\develop\jdk17
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d %~dp0
echo ============================================
echo   CodeQuiz APK Generator
echo   JDK: %JAVA_HOME%
echo ============================================

REM 删除旧项目
rmdir /s /q codequiz-apk 2>nul

REM Step 1: Init (交互式，回答两个问题)
echo.
echo [1/2] 初始化项目...
echo 提示：输入 n 回车 → 输入 D:\develop\jdk17 回车
echo.

REM 用 type 把答案管道给 bubblewrap
(echo n && echo D:\develop\jdk17 && echo.) | npx @bubblewrap/cli init --manifest https://codequiz.liyaoyao.top/manifest.webmanifest --directory codequiz-apk

if %errorlevel% neq 0 (
    echo.
    echo 初始化失败，请手动运行：
    echo   npx @bubblewrap/cli init --manifest https://codequiz.liyaoyao.top/manifest.webmanifest
    echo   然后回答: n, D:\develop\jdk17
    pause
    exit /b 1
)

echo.
echo [2/2] 构建 APK...
cd codequiz-apk
call npx @bubblewrap/cli build

echo.
echo ============================================
echo   完成！APK 在 codequiz-apk\ 目录下
echo   查找 .apk 文件传到手机安装
echo ============================================
pause
