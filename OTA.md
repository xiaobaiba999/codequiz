# CodeQuiz OTA 热更新使用说明

## 概述

CodeQuiz 移动端使用 Microsoft App Center 的 CodePush 服务实现 OTA（Over-The-Air）热更新，无需通过应用商店审核即可向用户推送应用更新。

## 前置条件

1. 安装 App Center CLI：
```bash
npm install -g appcenter-cli
```

2. 登录 App Center：
```bash
appcenter login
```

## App Center 注册与配置

### 1. 创建应用

在 [App Center](https://appcenter.ms/) 上创建两个应用（Android 和 iOS 各一个）：

```bash
# Android
appcenter apps create -d CodeQuiz-Android -o Android -p React-Native

# iOS
appcenter apps create -d CodeQuiz-iOS -o iOS -p React-Native
```

### 2. 创建部署环境

每个应用默认有 Staging 和 Production 两个部署环境。如需自定义：

```bash
# Android
appcenter codepush deployment add -a <owner>/CodeQuiz-Android Staging
appcenter codepush deployment add -a <owner>/CodeQuiz-Android Production

# iOS
appcenter codepush deployment add -a <owner>/CodeQuiz-iOS Staging
appcenter codepush deployment add -a <owner>/CodeQuiz-iOS Production
```

### 3. 获取部署 Key

```bash
# Android Staging
appcenter codepush deployment list -a <owner>/CodeQuiz-Android -k

# iOS Staging
appcenter codepush deployment list -a <owner>/CodeQuiz-iOS -k
```

将获取到的 Key 填入 `.env` 文件：

```
CODEPUSH_ANDROID_STAGING_KEY=<your-key>
CODEPUSH_ANDROID_PRODUCTION_KEY=<your-key>
CODEPUSH_IOS_STAGING_KEY=<your-key>
CODEPUSH_IOS_PRODUCTION_KEY=<your-key>
```

## 项目中的 CodePush 集成

### 安装依赖

```bash
cd packages/mobile
pnpm add react-native-code-push
```

### 配置

CodePush 已在 `src/components/CodePushWrapper.tsx` 中集成，主要逻辑：

1. **启动时检查更新**：应用启动时静默检查并下载更新
2. **后台恢复检查**：App 从后台恢复时再次检查更新
3. **非强制更新**：下载完成后提示用户重启应用，用户可选择稍后重启
4. **强制更新**：标记为 mandatory 的更新会立即安装，不允许跳过

### 环境选择

在 `App.tsx` 中通过 CodePush HOC 包装应用，根据构建配置自动选择 Staging 或 Production 的部署 Key。

## 发布更新

### Staging 环境（测试）

```bash
# Android Staging
appcenter codepush release-react -a <owner>/CodeQuiz-Android -d Staging

# iOS Staging
appcenter codepush release-react -a <owner>/CodeQuiz-iOS -d Staging
```

### Production 环境（正式）

```bash
# Android Production
appcenter codepush release-react -a <owner>/CodeQuiz-Android -d Production

# iOS Production
appcenter codepush release-react -a <owner>/CodeQuiz-iOS -d Production
```

### 强制更新

当有重大 API 变更等需要用户必须更新的场景，使用 `--mandatory` 标志：

```bash
appcenter codepush release-react -a <owner>/CodeQuiz-Android -d Production --mandatory
```

### 其他发布选项

```bash
# 指定目标版本
appcenter codepush release-react -a <owner>/CodeQuiz-Android -d Production --target-binary-version "1.0.0"

# 添加发布描述
appcenter codepush release-react -a <owner>/CodeQuiz-Android -d Production --description "修复了答题页面显示问题"

# 回滚到上一版本
appcenter codepush rollback -a <owner>/CodeQuiz-Android -d Production
```

## 更新流程

```
用户打开 App
    ↓
检查 CodePush 更新
    ↓
有更新？──否──→ 正常使用
    ↓ 是
下载更新包（后台静默）
    ↓
下载完成
    ↓
是否强制更新？
    ↓ 是              ↓ 否
立即重启应用      提示用户重启
                       ↓
              用户选择重启或稍后
```

## 注意事项

1. **版本兼容**：发布更新时确保 JS bundle 与当前原生版本兼容，如有原生代码变更需通过应用商店发布新版本
2. **测试流程**：先发布到 Staging 环境测试，确认无误后再发布到 Production
3. **回滚机制**：如发现更新有问题，可使用 `appcenter codepush rollback` 命令回滚
4. **更新大小**：CodePush 只推送 JS bundle 和资源的差异，更新包通常较小
5. **网络要求**：更新需要网络连接，无网络时应用正常运行当前版本
6. **首次安装**：CodePush 更新仅在应用已安装后生效，首次安装仍需通过应用商店或直接安装 APK/IPA
7. **iOS 注意**：iOS 上 CodePush 更新需遵守 Apple 的相关规定，不能修改应用的核心功能

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `appcenter codepush deployment list -a <app> -k` | 查看部署列表和 Key |
| `appcenter codepush release-react -a <app> -d <env>` | 发布更新 |
| `appcenter codepush release-react -a <app> -d <env> --mandatory` | 发布强制更新 |
| `appcenter codepush rollback -a <app> -d <env>` | 回滚更新 |
| `appcenter codepush history -a <app> -d <env>` | 查看发布历史 |
| `appcenter codepush metrics -a <app> -d <env>` | 查看更新指标 |
