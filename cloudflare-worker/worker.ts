// Cloudflare Worker 反向代理
// 部署到 Cloudflare Workers 后，国内用户可通过此代理访问 Vercel 服务

const API_HOST = 'codequiz-api.vercel.app';
const WEB_HOST = 'codequiz-web.vercel.app';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // API 请求转发到后端
    if (path.startsWith('/api/')) {
      const targetUrl = `https://${API_HOST}${path}${url.search}`;
      return proxyRequest(request, targetUrl);
    }

    // 其他请求转发到前端
    const targetUrl = `https://${WEB_HOST}${path}${url.search}`;
    return proxyRequest(request, targetUrl);
  },
};

async function proxyRequest(request: Request, targetUrl: string): Promise<Response> {
  // 构建代理请求头
  const headers = new Headers(request.headers);
  headers.set('Host', new URL(targetUrl).host);
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ipcountry');
  headers.delete('cf-ray');
  headers.delete('cf-visitor');

  // 构建代理请求
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  });

  try {
    const response = await fetch(proxyRequest);

    // 复制响应并添加 CORS 头
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, data: null, message: error.message || '代理请求失败' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
