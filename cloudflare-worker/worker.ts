// Cloudflare Worker 反向代理
// 部署到 Cloudflare Workers 后，国内用户可通过此代理访问 Vercel 服务

const API_HOST = 'codequiz-api.vercel.app';
const WEB_HOST = 'codequiz-web.vercel.app';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理 CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

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
  const headers = new Headers(request.headers);
  headers.set('Host', new URL(targetUrl).host);
  headers.set('Accept-Encoding', 'identity');
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ipcountry');
  headers.delete('cf-ray');
  headers.delete('cf-visitor');

  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  });

  try {
    const response = await fetch(proxyRequest);

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
      JSON.stringify({
        success: false,
        data: null,
        message: `Proxy error: ${error.message || '请求后端服务失败'}`,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
}
