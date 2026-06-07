# Laf.dev 部署指南

## 概述

由于 Vercel 在国内无法直接访问，我们使用 Laf.dev 作为反向代理，将国内用户的请求转发到 Vercel 后端 API。

## 部署步骤

### 1. 注册 Laf.dev

访问 [laf.dev](https://laf.dev/) ，使用 GitHub 或手机号注册登录。

### 2. 创建应用

1. 点击 **新建应用**
2. 选择 **空应用**
3. 区域选择 **Singapore** 或默认

### 3. 创建代理函数

1. 在应用中点击 **+ 新建函数**
2. 函数名输入 `api`
3. 请求方法选择 **ALL**（匹配所有 HTTP 方法）
4. 将 `proxy.ts` 文件中的代码复制粘贴到函数编辑器中
5. 点击 **保存** 并 **发布**

### 4. 获取函数 URL

发布后，Laf 会分配一个 URL，格式如：
```
https://xxx.laf.dev/api
```

这个 URL 就是你的 API 代理地址。

### 5. 测试

在浏览器中访问：
```
https://xxx.laf.dev/api/health
```

如果返回 `{"success":true,"data":{"status":"ok"},...}`，说明代理配置成功。

## 前端配置

将前端 API 地址改为 Laf 代理地址即可。

## 注意事项

- Laf 免费版有请求限制，但对于刷题应用足够
- 如果 Vercel API 地址变更，需要更新 proxy.ts 中的 VERCEL_API 变量
- 代理会增加约 100-300ms 延迟，但比无法访问好得多
