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

export default admin;