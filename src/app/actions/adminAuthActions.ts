'use server';

import {
  authenticateAdmin,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from '@/services/adminAuthService';
import { redirect } from 'next/navigation';

export interface LoginActionResult {
  error?: string;
  success?: boolean;
}

export async function loginAdminAction(formData: FormData): Promise<LoginActionResult | void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' };
  }

  const authResult = await authenticateAdmin(email, password);

  if (!authResult.success || !authResult.admin) {
    return { error: authResult.error || 'Autentikasi gagal.' };
  }

  await setAdminSessionCookie(authResult.admin);
  redirect('/admin');
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSessionCookie();
  redirect('/admin/login');
}
