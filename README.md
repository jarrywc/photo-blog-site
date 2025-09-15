# Photo Blog Site

A photo sharing application built with Hono.js and Cloudflare Workers, featuring user authentication, role-based access control, and R2 storage for images.

## Features

- **User Authentication**: Login/Register with secure password hashing
- **Role-based Access**: Admin and user roles with many-to-many relationship
- **Photo Upload**: Upload images to Cloudflare R2 storage
- **Photo Feed**: Browse all uploaded photos
- **Admin Dashboard**: Manage users and roles
- **Responsive Design**: Clean, modern UI that works on all devices

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Authentication**: JWT with secure cookies
- **Password Hashing**: @noble/hashes (Web Crypto API compatible)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account
- Wrangler CLI installed globally (`npm install -g wrangler`)

### Installation

1. Clone and install dependencies:
   ```bash
   npm install
   ```

2. Login to Cloudflare:
   ```bash
   wrangler auth login
   ```

3. Create D1 database:
   ```bash
   wrangler d1 create photo-blog-db
   ```
   Update the `database_id` in `wrangler.toml` with the returned ID.

4. Create R2 bucket:
   ```bash
   wrangler r2 bucket create photo-blog-bucket
   ```

5. Run database migrations:
   ```bash
   # For local development
   npx wrangler d1 migrations apply photo-blog-db --local

   # For production (after deployment)
   npx wrangler d1 migrations apply photo-blog-db --remote
   ```

6. Update environment variables in `wrangler.toml`:
   - Set a secure `JWT_SECRET`
   - Update `database_id` with your D1 database ID

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8787`

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

Don't forget to run migrations on production:
```bash
npx wrangler d1 migrations apply photo-blog-db --remote
```

## Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `password`: Hashed password
- `name`: User's display name
- `created_at`, `updated_at`: Timestamps

### Roles Table
- `id`: Primary key
- `name`: Role name (admin, user)
- `description`: Role description
- `created_at`: Timestamp

### User_Roles Table (Many-to-Many)
- `user_id`: Foreign key to users
- `role_id`: Foreign key to roles
- `assigned_at`: Timestamp

### Photos Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `title`: Photo title
- `description`: Optional description
- `filename`: R2 object key
- `url`: Public URL path
- `created_at`: Timestamp

## API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Login user
- `GET /register` - Registration page
- `POST /register` - Register new user
- `GET /logout` - Logout user

### Main Pages
- `GET /` - Home page
- `GET /feed` - Photo feed
- `GET /upload` - Upload form (authenticated)
- `POST /upload` - Upload photo (authenticated)

### Admin
- `GET /admin` - Admin dashboard (admin only)
- `POST /admin/users` - Create new user (admin only)
- `POST /admin/users/:id/toggle-role` - Add/remove user roles (admin only)

### Photos
- `GET /photos/:filename` - Serve photo from R2
- `POST /photos/:id/delete` - Delete photo (owner or admin)

## Default Roles

The system comes with two default roles:
- **admin**: Full access to all features including user management
- **user**: Basic access to upload and manage own photos

## Security Features

- Password hashing with scrypt (Web Crypto API compatible)
- JWT authentication with HTTP-only cookies using jose library
- CSRF protection through SameSite cookies
- Role-based access control
- Input validation and sanitization
- Secure file upload handling
- Cloudflare Workers security sandbox

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License