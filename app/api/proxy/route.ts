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

async function handleProxyRequest(request: NextRequest, method: string) {
  try {
    const path = request.nextUrl.searchParams.get('path');
    if (!path) {
      return new Response('Path parameter is required', { status: 400 });
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

    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
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
    console.error('Proxy API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
