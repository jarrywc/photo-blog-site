import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { DatabaseService } from '../utils/database';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { loginPage, registerPage } from '../views/login';
import { signupValidationMiddleware, loginValidationMiddleware } from '../middleware/validation';
import { Env } from '../types';

const auth = new Hono<Env>();

auth.get('/login', (c) => {
  const user = c.get('user');
  if (user) {
    return c.redirect('/');
  }
  return c.html(loginPage());
});

auth.post('/login', loginValidationMiddleware(), async (c) => {
  try {
    const { email, password } = c.get('validatedData');
    const db = new DatabaseService(c.env.DB);

    // Check if user exists
    const user = await db.getUserByEmail(email);
    if (!user) {
      return c.html(loginPage('No account found with this email address', email));
    }

    // Verify password
    if (!(await verifyPassword(password, user.password))) {
      return c.html(loginPage('Incorrect password. Please try again.', email));
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
    return c.html(loginPage('An unexpected error occurred. Please try again.'));
  }
});

auth.get('/register', (c) => {
  const user = c.get('user');
  if (user) {
    return c.redirect('/');
  }
  return c.html(registerPage());
});

auth.post('/register', signupValidationMiddleware(), async (c) => {
  try {
    const { name, email, password, code } = c.get('validatedData');
    const db = new DatabaseService(c.env.DB);

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return c.html(registerPage('An account with this email already exists. Try logging in instead.', name, email));
    }

    // Validate signup code (now required)
    const signupCode = await db.getCodeByCode(code);
    if (!signupCode) {
      return c.html(registerPage('Invalid signup code', name, email));
    }

    // Check if code is for signup
    if (signupCode.type !== 'signup') {
      return c.html(registerPage('Invalid signup code type', name, email));
    }

    const now = new Date();
    const startDate = new Date(signupCode.start_datetime);
    const endDate = new Date(signupCode.end_datetime);

    if (now < startDate) {
      return c.html(registerPage('Signup code is not yet active', name, email));
    }

    if (now > endDate) {
      return c.html(registerPage('Signup code has expired', name, email));
    }

    if (signupCode.used_at) {
      return c.html(registerPage('Signup code has already been used', name, email));
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const user = await db.createUser(email, hashedPassword, name);

    // Mark code as used
    await db.useCode(code, user.id);

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
    return c.html(registerPage('An unexpected error occurred. Please try again.'));
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