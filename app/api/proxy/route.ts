import { NextRequest } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function GET(request: NextRequest) {
  return handleProxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleProxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return handleProxyRequest(request, 'PATCH');
}

async function handleProxyRequest(request: NextRequest, method: string) {
  try {
    const path = request.nextUrl.searchParams.get('path');
    if (!path) {
      return new Response('Path parameter is required', { status: 400 });
    }

    if (!path.startsWith('/api/') && !path.startsWith('/graphql')) {
      return new Response('Invalid path', { status: 400 });
    }

    const url = new URL(`${BASE_URL}${path}`);

    request.nextUrl.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        url.searchParams.append(key, value);
      }
    });

    const headers: HeadersInit = {};

    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    if (isDev && process.env.AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.AUTH_TOKEN}`;
    }

    if (!isDev) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const jwtMatch = cookieHeader.match(/jwt=([^;]+)/);
        if (jwtMatch) {
          headers['Authorization'] = `Bearer ${jwtMatch[1]}`;
        }
      }
    }

    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE' && method !== 'PATCH') {
      body = await request.text();
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
    });

    const responseHeaders: HeadersInit = {};
    response.headers.forEach((value, key) => {
      if (
        key.toLowerCase() === 'content-type' ||
        key.toLowerCase() === 'content-length'
      ) {
        responseHeaders[key] = value;
      }
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    if (isDev) {
      console.error('Proxy API error:', error);
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
