import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyToken } from '../utils/auth';
import { DatabaseService } from '../utils/database';
import { Env } from '../types';

export async function authMiddleware(c: Context<Env>, next: Next) {
  const token = getCookie(c, 'auth-token') || c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    c.set('user', null);
    return next();
  }

  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    c.set('user', null);
    return next();
  }

  const db = new DatabaseService(c.env.DB);
  const user = await db.getUserById(payload.userId);

  if (!user) {
    c.set('user', null);
    return next();
  }

  const roles = await db.getUserRoles(user.id);
  c.set('user', { ...user, roles });
  return next();
}

export function requireAuth(c: Context<Env>) {
  const user = c.get('user');
  if (!user) {
    return c.redirect('/login');
  }
  return user;
}

export function requireRole(roleName: string) {
  return (c: Context<Env>) => {
    const user = c.get('user');
    if (!user) {
      return c.redirect('/login');
    }

    const hasRole = user.roles?.some((role: any) => role.name === roleName);
    if (!hasRole) {
      return c.text('Forbidden', 403);
    }

    return user;
  };
}