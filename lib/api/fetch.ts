type FetchOptions = RequestInit & {
  skipAuthRedirect?: boolean;
};

export class AuthError extends Error {
  constructor(message: string = '인증이 만료되었습니다.') {
    super(message);
    this.name = 'AuthError';
  }
}

export async function authFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuthRedirect, ...fetchOptions } = options;

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
  });

  if (
    (response.status === 401 || response.status === 403) &&
    !skipAuthRedirect
  ) {
    if (typeof window !== 'undefined') {
      const { clearAuthCookie } = await import('@/app/auth/actions');
      await clearAuthCookie();

      window.location.href = '/login';
    }

    throw new AuthError();
  }

  return response;
}
