'use server';

import { cookies } from 'next/headers';

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return { success: true };
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('jwt');
  return { success: true };
}
