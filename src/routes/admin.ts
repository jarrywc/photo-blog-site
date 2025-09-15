import { Hono } from 'hono';
import { DatabaseService } from '../utils/database';
import { hashPassword } from '../utils/auth';
import { requireRole } from '../middleware/auth';
import { adminPage } from '../views/admin';
import { Env } from '../types';

const admin = new Hono<Env>();

admin.get('/admin', async (c) => {
  const user = requireRole('admin')(c);
  if (!user || typeof user !== 'object') return user;

  const db = new DatabaseService(c.env.DB);

  try {
    const users = await db.getAllUsers();
    const roles = await db.getAllRoles();

    // Get roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (u) => {
        const userRoles = await db.getUserRoles(u.id);
        return { ...u, roles: userRoles };
      })
    );

    return c.html(adminPage(usersWithRoles, roles, user));
  } catch (error) {
    console.error('Admin page error:', error);
    return c.text('Error loading admin page', 500);
  }
});

admin.post('/admin/users', async (c) => {
  const user = requireRole('admin')(c);
  if (!user || typeof user !== 'object') return user;

  try {
    const { name, email, password, role } = await c.req.parseBody();

    if (!name || !email || !password || !role) {
      return c.text('All fields are required', 400);
    }

    const db = new DatabaseService(c.env.DB);

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email as string);
    if (existingUser) {
      return c.text('User with this email already exists', 400);
    }

    // Create new user
    const hashedPassword = await hashPassword(password as string);
    const newUser = await db.createUser(email as string, hashedPassword, name as string);

    // Assign role
    await db.assignRole(newUser.id, parseInt(role as string));

    return c.redirect('/admin');
  } catch (error) {
    console.error('Create user error:', error);
    return c.text('Error creating user', 500);
  }
});

admin.post('/admin/users/:id/toggle-role', async (c) => {
  const user = requireRole('admin')(c);
  if (!user || typeof user !== 'object') return user;

  try {
    const userId = parseInt(c.req.param('id'));
    const { role_id, action } = await c.req.parseBody();

    if (!role_id || !action) {
      return c.text('Role ID and action are required', 400);
    }

    const db = new DatabaseService(c.env.DB);
    const roleId = parseInt(role_id as string);

    if (action === 'add') {
      await db.assignRole(userId, roleId);
    } else if (action === 'remove') {
      await db.removeRole(userId, roleId);
    } else {
      return c.text('Invalid action', 400);
    }

    return c.redirect('/admin');
  } catch (error) {
    console.error('Toggle role error:', error);
    return c.text('Error updating user role', 500);
  }
});

// Codes management routes
admin.get('/admin/codes', async (c) => {
  const user = requireRole('admin')(c);
  if (!user || typeof user !== 'object') return user;

  const db = new DatabaseService(c.env.DB);

  try {
    const codes = await db.getAllCodes();
    return c.html(await import('../views/admin').then(m => m.codesPage(codes, user)));
  } catch (error) {
    console.error('Codes page error:', error);
    return c.text('Error loading codes page', 500);
  }
});

admin.post('/admin/codes', async (c) => {
  const user = requireRole('admin')(c);
  if (!user || typeof user !== 'object') return user;

  try {
    const { code, startDatetime, endDatetime, type, target } = await c.req.parseBody();

    if (!code || !startDatetime || !endDatetime || !type || !target) {
      return c.text('All fields are required', 400);
    }

    const db = new DatabaseService(c.env.DB);

    // Check if code already exists
    const existingCode = await db.getCodeByCode(code as string);
    if (existingCode) {
      return c.text('Code already exists', 400);
    }

    // Validate dates
    const start = new Date(startDatetime as string);
    const end = new Date(endDatetime as string);
    if (start >= end) {
      return c.text('End date must be after start date', 400);
    }

    await db.createCode(
      code as string,
      startDatetime as string,
      endDatetime as string,
      type as string,
      target as string
    );

    return c.redirect('/admin/codes');
  } catch (error) {
    console.error('Create code error:', error);
    return c.text('Error creating code', 500);
  }
});

admin.post('/admin/codes/:code/delete', async (c) => {
  const user = requireRole('admin')(c);
  if (!user || typeof user !== 'object') return user;

  try {
    const code = c.req.param('code');
    const db = new DatabaseService(c.env.DB);

    // Check if code exists and is not used
    const existingCode = await db.getCodeByCode(code);
    if (!existingCode) {
      return c.text('Code not found', 404);
    }

    if (existingCode.used_at) {
      return c.text('Cannot delete used code', 400);
    }

    // Delete the code (we'll add this method to DatabaseService)
    await c.env.DB.prepare('DELETE FROM codes WHERE code = ?').bind(code).run();

    return c.redirect('/admin/codes');
  } catch (error) {
    console.error('Delete code error:', error);
    return c.text('Error deleting code', 500);
  }
});

export default admin;