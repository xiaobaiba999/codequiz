# CodeQuiz APK 生成 — 在你的电脑上运行

## 前提条件（一次性）
1. 安装 JDK 17+:  https://adoptium.net/download
2. 确认安装成功:  `java -version`  应该显示 17 或更高

## 生成 APK（3 条命令）

```bash
# 1. 下载 bubblewrap
npm install -g @bubblewrap/cli

# 2. 初始化项目（交互式，按提示选默认即可）
bubblewrap init --manifest https://codequiz.liyaoyao.top/manifest.webmanifest

# 3. 构建 APK
cd  # 进入刚生成的目录
bubblewrap build
```

## 安装
把生成的 `.apk` 文件传到手机安装即可。
