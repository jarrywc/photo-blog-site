import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { DatabaseService } from '../utils/database';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { loginPage, registerPage } from '../views/login';
import { Env } from '../types';

const auth = new Hono<Env>();

auth.get('/login', (c) => {
  const user = c.get('user');
  if (user) {
    return c.redirect('/');
  }
  return c.html(loginPage());
});

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.parseBody();
    const emailStr = email as string;
    const passwordStr = password as string;

    // Input validation
    if (!emailStr || !passwordStr) {
      return c.html(loginPage('Email and password are required', emailStr));
    }

    if (!emailStr.trim()) {
      return c.html(loginPage('Email is required', emailStr));
    }

    if (!passwordStr.trim()) {
      return c.html(loginPage('Password is required', emailStr));
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      return c.html(loginPage('Please enter a valid email address', emailStr));
    }

    const db = new DatabaseService(c.env.DB);

    // Check if user exists
    const user = await db.getUserByEmail(emailStr);
    if (!user) {
      return c.html(loginPage('No account found with this email address', emailStr));
    }

    // Verify password
    if (!(await verifyPassword(passwordStr, user.password))) {
      return c.html(loginPage('Incorrect password. Please try again.', emailStr));
    }

    // Generate token and set cookie
    const token = await generateToken(user, c.env.JWT_SECRET);
    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return c.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    try {
      const body = await c.req.parseBody();
      const email = (body.email as string) || '';
      return c.html(loginPage('An unexpected error occurred. Please try again.', email));
    } catch {
      return c.html(loginPage('An unexpected error occurred. Please try again.'));
    }
  }
});

auth.get('/register', (c) => {
  const user = c.get('user');
  if (user) {
    return c.redirect('/');
  }
  return c.html(registerPage());
});

auth.post('/register', async (c) => {
  try {
    const { name, email, password } = await c.req.parseBody();
    const nameStr = name as string;
    const emailStr = email as string;
    const passwordStr = password as string;

    // Input validation
    if (!nameStr || !emailStr || !passwordStr) {
      return c.html(registerPage('All fields are required', nameStr, emailStr));
    }

    if (!nameStr.trim()) {
      return c.html(registerPage('Name is required', nameStr, emailStr));
    }

    if (nameStr.trim().length < 2) {
      return c.html(registerPage('Name must be at least 2 characters', nameStr, emailStr));
    }

    if (!emailStr.trim()) {
      return c.html(registerPage('Email is required', nameStr, emailStr));
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      return c.html(registerPage('Please enter a valid email address', nameStr, emailStr));
    }

    if (!passwordStr.trim()) {
      return c.html(registerPage('Password is required', nameStr, emailStr));
    }

    if (passwordStr.length < 6) {
      return c.html(registerPage('Password must be at least 6 characters', nameStr, emailStr));
    }

    const db = new DatabaseService(c.env.DB);

    // Check if user already exists
    const existingUser = await db.getUserByEmail(emailStr);
    if (existingUser) {
      return c.html(registerPage('An account with this email already exists. Try logging in instead.', nameStr, emailStr));
    }

    // Create new user
    const hashedPassword = await hashPassword(passwordStr);
    const user = await db.createUser(emailStr, hashedPassword, nameStr.trim());

    // Assign default user role
    await db.assignRole(user.id, 2); // Assuming role ID 2 is 'user'

    const token = await generateToken(user, c.env.JWT_SECRET);
    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return c.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    try {
      const body = await c.req.parseBody();
      const name = (body.name as string) || '';
      const email = (body.email as string) || '';
      return c.html(registerPage('An unexpected error occurred. Please try again.', name, email));
    } catch {
      return c.html(registerPage('An unexpected error occurred. Please try again.'));
    }
  }
});

auth.get('/logout', (c) => {
  setCookie(c, 'auth-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 0,
  });
  return c.redirect('/login');
});

export default auth;