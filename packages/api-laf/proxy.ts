// Laf.dev 反向代理函数
// 将请求转发到 Vercel 后端 API，解决国内无法直接访问 Vercel 的问题

const VERCEL_API = "https://codequiz-api.vercel.app";

export default async function (ctx: any) {
  const { method, path, headers, body, query } = ctx.req;

  // 构建目标 URL
  let targetUrl = `${VERCEL_API}${path || "/"}`;
  if (query && Object.keys(query).length > 0) {
    const qs = new URLSearchParams(query).toString();
    targetUrl += `?${qs}`;
  }

  try {
    const fetchOptions: any = {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    // 转发 Authorization 头
    if (headers?.authorization) {
      fetchOptions.headers["Authorization"] = headers.authorization;
    }

    // GET/HEAD 请求不带 body
    if (method !== "GET" && method !== "HEAD" && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    return ctx.json(data);
  } catch (error: any) {
    return ctx.json({
      success: false,
      data: null,
      message: error.message || "代理请求失败",
    });
  }
}
