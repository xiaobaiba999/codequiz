# CodeQuiz Vercel 免费部署指南

## 本次改动概述

| 文件 | 改动 |
|---|---|
| `packages/api/vercel.json` | 使用 `npx prisma generate` 构建，锁定 `@vercel/node@3` 运行时 |
| `packages/web/vercel.json` | 使用 `pnpm` 构建/安装 |
| `.npmrc`（新建） | pnpm hoist 配置，确保 Prisma 在 serverless 正常加载 |
| `.env.production.example`（新建） | 生产环境变量模板 |
| `packages/api/src/config/redis.ts`（新建） | Redis 封装 — **无 Redis 时自动降级为内存存储** |
| `packages/api/src/app.ts` | Redis 改为从 `config/redis` 引入 |

> **关键改进**: 即使没有 Redis，API 也能正常运行（refresh token 存在内存中，冷启动时丢失意味着用户需重新登录）。

---

## 第一步：准备 Git 仓库

Vercel 从 GitHub/GitLab/Bitbucket 导入代码。确保项目已推到远端：

```bash
git init   # 如果还没有初始化
git add .
git commit -m "feat: vercel deployment config"
git remote add origin https://github.com/<你的用户名>/codequiz.git
git push -u origin main
```

---

## 第二步：创建免费 PostgreSQL（Neon）

[Neon](https://neon.tech) 提供 0.5GB 免费 PostgreSQL。

1. 注册 → 创建 Project → 记下 **Connection string**
2. 格式: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

---

## 第三步：Redis（可选）

Redis 用于 refresh token 持久化。**不配置也能用**（代码已做内存降级）。

如果需要 Redis:
- [Upstash](https://console.upstash.com) 免费版 → 创建 Redis → 复制 `rediss://` 连接串

---

## 第四步：部署 API 到 Vercel

### 4.1 导入项目

1. 打开 [vercel.com/new](https://vercel.com/new)
2. 导入你的 GitHub 仓库
3. **关键配置**:
   | 设置项 | 值 |
   |---|---|
   | Framework Preset | **Other** |
   | Root Directory | `packages/api` |
   | Build Command | `npx prisma generate`（vercel.json 已配置） |
   | Output Directory | 留空（serverless 不需要） |
   | Install Command | `pnpm install`（vercel.json 已配置） |

### 4.2 设置环境变量

在项目 Settings → Environment Variables 中添加：

| Key | 值 | 来源 |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Neon 连接串 |
| `JWT_SECRET` | 随机生成 64 位 hex | `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | 随机生成 64 位 hex | `openssl rand -hex 64` |
| `JWT_EXPIRES_IN` | `15m` | |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | |
| `JUDGE_SERVICE_URL` | `https://emkc.org/api/v2/piston` | |
| `JUDGE_SERVICE_TYPE` | `piston` | |
| `NODE_ENV` | `production` | |
| `REDIS_URL` | Upstash 连接串（可选） | 不设置则用内存 |

### 4.3 运行数据库迁移

部署后，需要初始化数据库表。在本地执行（需先 `pnpm install`）：

```bash
# Windows (cmd)
set DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
cd packages\api
npx prisma db push

# macOS / Linux
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require" \
  npx prisma db push
```

> `prisma db push` 会直接在数据库创建所有表，无需 migration 文件。如果要用 migration，改为 `npx prisma migrate deploy`。

### 4.4 验证

访问 `https://<你的项目>.vercel.app/api/health`，应该返回:
```json
{"success": true, "data": {"status": "ok"}, "message": "Server is running"}
```

记下 API 域名（如 `codequiz-api.vercel.app`）。

---

## 第五步：部署 Web 前端

### 5.1 导入项目

1. 再次打开 [vercel.com/new](https://vercel.com/new)
2. 导入**同一个** GitHub 仓库
3. **关键配置**:
   | 设置项 | 值 |
   |---|---|
   | Framework Preset | **Vite** |
   | Root Directory | `packages/web` |
   | Build Command | `pnpm build` |
   | Output Directory | `dist` |
   | Install Command | `pnpm install` |

### 5.2 设置环境变量

| Key | 值 |
|---|---|
| `VITE_API_URL` | `https://<你的API域名>.vercel.app/api` |

> ⚠️ `VITE_API_URL` 必须以 `/api` 结尾，前端所有请求都拼接在这个 base URL 后面。

### 5.3 部署并验证

部署完成后访问 Web 域名，确认能正常注册/登录（数据会写入 Neon 数据库）。

---

## 第六步：配置 CORS（重要）

回到 **API 项目** Settings → Environment Variables，添加：

| Key | 值 |
|---|---|
| `FRONTEND_URL` | `https://<你的Web域名>.vercel.app` |

然后重新部署 API（在 Deployments 页面点 Redeploy）。

---

## 常见问题

### Q: API 部署后 404？
A: 检查 Vercel 项目 Functions 页面，确认 `api/index.ts` 被识别为 Serverless Function。

### Q: Prisma 报错 "Can't reach database server"？
A: Neon 的免费数据库在 5 分钟无活动后会休眠。首次请求（冷启动）需要 2-5 秒唤醒。

### Q: 前端请求 API 跨域报错？
A: 确认 API 的 `FRONTEND_URL` 环境变量已设置，并重新部署 API。

### Q: 刷新页面后需要重新登录？
A: 没有配置 Redis 时，refresh token 存在内存中。API 冷启动后内存清空，用户需重新登录。建议配置 Upstash Redis。

---

## 免费服务配额参考

| 服务 | 免费额度 | 够用吗 |
|---|---|---|
| Vercel | 100GB 带宽/月, 100GB-Hrs 计算 | ✅ 个人项目绰绰有余 |
| Neon | 0.5GB 存储, 100 小时计算/月 | ✅ 小项目足够 |
| Upstash Redis | 10K 命令/天 | ✅ refresh token 操作极少 |
| Piston (判题) | 免费 API，无认证 | ✅ |
