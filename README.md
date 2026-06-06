# CodeQuiz - 跨平台刷题应用

CodeQuiz 是一个前后端分离的跨平台刷题应用，支持 PC Web 端和移动端 App，提供完整的刷题闭环体验。

## 技术栈

- **后端**: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis
- **Web 前端**: React 18 + Vite + Ant Design + Zustand
- **移动端**: React Native CLI + TypeScript + React Navigation
- **共享类型**: TypeScript 接口定义，前后端复用
- **判题服务**: Piston API / Judge0
- **OTA 更新**: react-native-code-push

## 项目结构

```
codequiz/
├── packages/
│   ├── api/          # 后端 API 服务
│   ├── web/          # PC Web 前端
│   ├── mobile/       # React Native 移动端
│   └── types/        # 共享类型定义
├── docker-compose.yml
├── pnpm-workspace.yaml
├── nx.json
├── render.yaml       # Render 部署配置
└── package.json
```

## 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose

### 1. 克隆项目

```bash
git clone <repo-url>
cd codequiz
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动数据库服务

```bash
docker-compose up -d
```

### 4. 配置环境变量

```bash
cp .env.example .env
# 根据需要修改 .env 中的配置
```

### 5. 初始化数据库

```bash
# 运行数据库迁移
pnpm db:migrate

# 填充种子数据
pnpm db:seed
```

### 6. 启动开发服务

```bash
# 同时启动前后端
pnpm dev

# 或单独启动
pnpm dev:api    # 后端 API (http://localhost:3000)
pnpm dev:web    # Web 前端 (http://localhost:5173)
```

### 7. 移动端开发

```bash
cd packages/mobile

# Android
pnpm android

# iOS
pnpm ios
```

## API 文档

启动后端服务后，访问 http://localhost:3000/api-docs 查看 Swagger 文档。

## 功能特性

- 用户注册/登录（邮箱 + JWT 认证）
- 题库管理（单选、多选、填空、编程四种题型）
- 刷题模式（顺序练习、随机练习、模拟考试）
- 编程题在线判题（Piston/Judge0）
- 错题本、收藏夹、私人笔记
- 学习统计（正确率趋势、分类掌握度）
- 讨论区（题目评论）
- 暗色模式
- 移动端 OTA 热更新（CodePush）

## 代码规范

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

---

## 免费部署指南

本项目可完全免费部署到云端，使用以下服务：

| 服务 | 用途 | 免费额度 |
|------|------|----------|
| **Render** | 后端 API 托管 | 750 小时/月 |
| **Vercel** | Web 前端托管 | 无限带宽 |
| **Neon** | PostgreSQL 数据库 | 0.5 GB 存储 |
| **Upstash** | Redis 缓存 | 10,000 命令/天 |

### 第一步：创建 Neon PostgreSQL 数据库

1. 访问 [neon.tech](https://neon.tech/) 注册账号
2. 点击 **Create Project**，选择区域（推荐 Singapore）
3. 创建完成后，在 Dashboard 复制 **Connection String**
4. 格式类似：`postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
5. 保存此连接字符串，后面需要填入 `DATABASE_URL`

> **注意**：Neon 免费版支持自动挂起（5 分钟无活动自动暂停），首次连接可能有冷启动延迟。

### 第二步：创建 Upstash Redis

1. 访问 [upstash.com](https://upstash.com/) 注册账号
2. 点击 **Create Database**，选择区域（与 Neon 同区域最佳）
3. 创建完成后，复制 **UPSTASH_REDIS_REST_URL** 或传统 Redis URL
4. 传统连接格式：`rediss://default:xxx@us1-xxx.upstash.io:6379`

> **注意**：Upstash 免费版每天 10,000 命令，对本项目足够。使用 `rediss://`（带 SSL）协议。

### 第三步：部署后端 API 到 Render

1. 访问 [render.com](https://render.com/) 注册账号
2. 点击 **New** → **Web Service**
3. 连接你的 GitHub 仓库
4. 配置如下：
   - **Name**: `codequiz-api`
   - **Root Directory**: `packages/api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build:prod`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
   - **Plan**: `Free`
5. 添加环境变量：
   - `DATABASE_URL` = Neon 连接字符串
   - `REDIS_URL` = Upstash Redis URL
   - `JWT_SECRET` = 随机字符串（可用 `openssl rand -hex 32` 生成）
   - `JWT_REFRESH_SECRET` = 另一个随机字符串
   - `JWT_EXPIRES_IN` = `15m`
   - `JWT_REFRESH_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`
   - `JUDGE_SERVICE_URL` = `https://emkc.org/api/v2/piston`
   - `FRONTEND_URL` = Vercel 部署后的地址（先留空，部署前端后填写）
   - `RUN_SEED` = `true`（首次部署时填充种子数据）
6. 点击 **Create Web Service**，等待构建完成
7. 部署成功后，记录 API 地址，格式如：`https://codequiz-api.onrender.com`

> **注意**：Render 免费版服务 15 分钟无请求会休眠，首次访问需要等待约 30 秒冷启动。

#### 使用 render.yaml 一键部署（可选）

也可以使用 Render Blueprint 一键部署：

1. 确保 `render.yaml` 在仓库根目录
2. 在 Render Dashboard 点击 **Blueprints** → **New Blueprint Instance**
3. 连接 GitHub 仓库，Render 会自动读取 `render.yaml` 配置
4. 手动填写 `DATABASE_URL` 和 `REDIS_URL` 等敏感环境变量

### 第四步：部署 Web 前端到 Vercel

1. 访问 [vercel.com](https://vercel.com/) 注册账号
2. 点击 **Add New** → **Project**
3. 导入 GitHub 仓库
4. 配置如下：
   - **Framework Preset**: `Vite`
   - **Root Directory**: `packages/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 部署成功后，记录前端地址，格式如：`https://codequiz-web.vercel.app`

#### 更新 API 代理地址

1. 修改 `packages/web/vercel.json` 中的 `destination` 为你的 Render API 地址：
   ```json
   "rewrites": [
     { "source": "/api/(.*)", "destination": "https://codequiz-api.onrender.com/api/$1" }
   ]
   ```
2. 在 Render 环境变量中添加 `FRONTEND_URL` = 你的 Vercel 地址
3. 重新部署两个服务使配置生效

### 第五步：初始化种子数据

如果部署时设置了 `RUN_SEED=true`，种子数据会自动填充。否则可手动触发：

1. 在 Render Dashboard 中打开 API 服务的 **Shell**
2. 执行：
   ```bash
   cd packages/api
   npx prisma db seed
   ```

### 第六步：验证部署

1. 访问 Vercel 前端地址，测试注册/登录功能
2. 访问 `https://codequiz-api.onrender.com/api/health` 检查 API 状态
3. 访问 `https://codequiz-api.onrender.com/api-docs` 查看 Swagger 文档

### 移动端配置

移动端已内置生产环境 API 地址（`https://codequiz-api.onrender.com/api`）。如果 Render 服务名不同，修改 `packages/mobile/src/api/client.ts` 中的生产环境地址即可。

### 常见问题

**Q: Render 免费版冷启动太慢？**
A: 可使用 [cron-job.org](https://cron-job.org/) 每 14 分钟 ping 一次 `https://codequiz-api.onrender.com/api/health`，保持服务活跃。

**Q: Neon 数据库连接超时？**
A: Neon 免费版有冷启动，首次连接可能需要几秒。Prisma 已配置连接池，后续请求会更快。

**Q: Upstash Redis 命令数不够？**
A: 本项目 Redis 仅用于存储 Refresh Token，每日命令量极低，免费额度完全够用。

**Q: 如何更新部署？**
A: 推送代码到 GitHub 后，Render 和 Vercel 会自动重新部署。
