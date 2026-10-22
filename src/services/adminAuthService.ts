import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE_NAME = 'automax_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): string {
  return process.env.ADMIN_SECRET || 'automax_default_dev_secret_key_2026';
}

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  exp: number; // unix timestamp in seconds
}

/**
 * Hash password using standard scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Constant-time password verification supporting scrypt format and seed fallback
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.includes(':')) {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }
  // Fallback for seed plain text
  return password === storedHash;
}

/**
 * Create cryptographically signed HMAC-SHA256 session token
 */
export function createSessionToken(payload: AdminSessionPayload): string {
  const secret = getSecretKey();
  const rawPayload = JSON.stringify(payload);
  const base64Payload = Buffer.from(rawPayload, 'utf-8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(base64Payload).digest('hex');
  return `${base64Payload}.${signature}`;
}

/**
 * Verify session token and check expiration
 */
export function verifySessionToken(token: string): AdminSessionPayload | null {
  if (!token || !token.includes('.')) return null;

  const [base64Payload, signature] = token.split('.');
  const secret = getSecretKey();

  const expectedSignature = crypto.createHmac('sha256', secret).update(base64Payload).digest('hex');

  // Defensive timing safe comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedSigBuffer = Buffer.from(expectedSignature, 'hex');
  if (sigBuffer.length !== expectedSigBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) return null;

  try {
    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const payload: AdminSessionPayload = JSON.parse(jsonStr);

    // Check expiration
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp < nowInSeconds) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Authenticates admin credentials against database
 */
export async function authenticateAdmin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!admin) {
    return { success: false, error: 'Email atau password tidak valid.' };
  }

  const isMatch = verifyPassword(password, admin.password);
  if (!isMatch) {
    return { success: false, error: 'Email atau password tidak valid.' };
  }

  return { success: true, admin };
}

/**
 * Sets session cookie on HTTP response
 */
export async function setAdminSessionCookie(admin: { id: string; email: string; name: string }) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const token = createSessionToken({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    exp,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_SECONDS,
    path: '/',
  });
}

/**
 * Reads and verifies current admin session from cookie
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!tokenCookie || !tokenCookie.value) {
    return null;
  }

  return verifySessionToken(tokenCookie.value);
}

/**
 * Clears admin session cookie
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
