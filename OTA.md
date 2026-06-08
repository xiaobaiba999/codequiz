# APK 安装包 + OTA 热更新方案

## 一、生成 APK 安装包

### 方法 1：PWABuilder（推荐，1 分钟）

1. 打开 https://www.pwabuilder.com
2. 输入 `https://codequiz.liyaoyao.top`
3. 等待检测完成 → 点击 **Android** 下的 **Store Package**
4. 填写信息：
   - App Name: `CodeQuiz`
   - Package Name: `top.liyaoyao.codequiz`
   - 上传图标（用 `public/icon-512.svg`）
5. 点击 Download → 得到 `.apk` 文件
6. 传到手机安装

### 方法 2：Bubblewrap CLI（高级）

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://codequiz.liyaoyao.top/manifest.webmanifest
bubblewrap build
```

---

## 二、OTA 热更新机制

CodeQuiz 是 PWA 架构，**天然支持 OTA 热更新**：

| 机制 | 说明 |
|---|---|
| **Service Worker** | 自动缓存 JS/CSS，检测到新版本静默更新 |
| **autoUpdate 模式** | 页面刷新后自动加载新版本 |
| **无需审核** | 代码推到 GitHub → Vercel 自动部署 → 用户刷新即更新 |

### 更新流程

```
你 push 代码 → Vercel 自动部署 → 用户下次打开/刷新 → 自动获取最新版本
                                    ↑
                          弹窗显示更新内容（本次已实现）
```

---

## 三、更新日志管理

### 当前版本

```
v1.2.0
```

### 新增功能时

编辑 `packages/web/src/pages/Profile.tsx` 和 `packages/web/src/components/UpdateNotification.tsx`：

```ts
const CURRENT_VERSION = '1.3.0'; // 改版本号

const CHANGELOG: Record<string, string[]> = {
  '1.3.0': [                    // 新增条目
    '✨ 你的新功能描述',
    '🐛 修复了什么 Bug',
  ],
  '1.2.0': [
    // ... 保持不变
  ],
};
```

版本号加 1，push 后用户打开 App 就会看到更新弹窗。

---

## 四、版本号规则

```
v<主版本>.<次版本>.<修订号>

主版本：重大功能变化（1→2）
次版本：新功能（1.2→1.3）  ← 最常用
修订号：Bug 修复（1.2.0→1.2.1）
```

---

## 五、APK 分发

APK 文件可以通过以下方式分享给用户：

1. **GitHub Releases** — 上传 APK 到 Releases 页面，生成下载链接
2. **蓝奏云 / 123云盘** — 国内用户下载更快
3. **蒲公英 / fir.im** — 扫码直接安装

---

## 六、iOS 安装

iOS 不需要 APK。用户用 Safari 打开 `codequiz.liyaoyao.top` → 点击分享 → **添加到主屏幕** → 即可像 App 一样使用。
