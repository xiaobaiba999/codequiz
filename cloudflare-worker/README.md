# Cloudflare Worker 部署指南

## 概述

使用 Cloudflare Worker 作为反向代理，让国内用户可以访问部署在 Vercel 上的 CodeQuiz 应用。

Cloudflare Workers 免费额度：每天 100,000 次请求，完全够用。

## 部署步骤

### 方式一：在线部署（推荐，最简单）

1. 访问 [dash.cloudflare.com](https://dash.cloudflare.com/) 注册登录
2. 点击左侧 **Workers & Pages**
3. 点击 **Create** → **Create Worker**
4. 给 Worker 起名：`codequiz-proxy`
5. 点击 **Deploy**
6. 点击 **Edit Code**，删除编辑器中的默认代码
7. 将 `worker.ts` 文件中的代码复制粘贴到编辑器中
8. 点击 **Save and Deploy**
9. 部署完成后，你会得到一个 URL，格式如：`https://codequiz-proxy.你的子域名.workers.dev`

### 方式二：使用 Wrangler CLI 部署

```bash
# 安装 wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署
cd cloudflare-worker
wrangler deploy
```

## 使用方式

部署完成后，通过 Worker URL 访问：

- 前端页面：`https://codequiz-proxy.xxx.workers.dev/`
- API 接口：`https://codequiz-proxy.xxx.workers.dev/api/health`

所有 `/api/*` 请求会被转发到后端，其他请求转发到前端。

## 更新前端 API 地址

如果前端已经部署在 Vercel 上，需要更新环境变量 `VITE_API_URL` 为 Worker 地址：

```
VITE_API_URL=https://codequiz-proxy.xxx.workers.dev/api
```

然后在 Vercel 重新部署前端。

## 绑定自定义域名（可选）

如果你有自己的域名：
1. 在 Cloudflare Dashboard 中添加你的域名
2. 在 Worker 设置中添加 Custom Domain
3. 例如绑定 `codequiz.yourdomain.com`
