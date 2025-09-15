import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth';
import auth from './routes/auth';
import main from './routes/main';
import photos from './routes/photos';
import admin from './routes/admin';
import { Env } from './types';

const app = new Hono<Env>();

// Middleware
app.use('*', cors());
app.use('*', authMiddleware);

// Routes
app.route('/', auth);
app.route('/', main);
app.route('/', photos);
app.route('/', admin);

// 404 handler
app.notFound((c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>404 - Page Not Found</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 2rem; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #dc2626; margin-bottom: 1rem; }
            a { color: #2563eb; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <p><a href="/">Return to home</a></p>
        </div>
    </body>
    </html>
  `);
});

export default app;