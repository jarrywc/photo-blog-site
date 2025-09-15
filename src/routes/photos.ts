import { Hono } from 'hono';
import { DatabaseService } from '../utils/database';
import { uploadToR2, generateUniqueFileName, deleteFromR2 } from '../utils/storage';
import { requireAuth } from '../middleware/auth';
import { feedPage } from '../views/feed';
import { Env } from '../types';

const photos = new Hono<Env>();

photos.get('/feed', async (c) => {
  const user = c.get('user');
  const db = new DatabaseService(c.env.DB);

  try {
    const posts = await db.getPostsWithPhotosAndComments();
    const standalonePhotos = await db.getStandalonePhotos();

    // Get user's photos for the create post form if user is logged in
    let userPhotos: any[] = [];
    if (user && typeof user === 'object') {
      userPhotos = await db.getPhotosByUser(user.id);
    }

    return c.html(feedPage(posts, standalonePhotos, user, userPhotos));
  } catch (error) {
    return c.html(feedPage([], [], user, []));
  }
});


photos.post('/create-post', async (c) => {
  const user = requireAuth(c);
  if (!user || typeof user !== 'object') return user;

  const db = new DatabaseService(c.env.DB);

  try {
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string || '';
    const selectedPhotos = formData.getAll('photos') as string[];

    if (!title || title.trim() === '') {
      return c.text('Post title is required', 400);
    }

    // Create the post
    const post = await db.createPost(user.id, title.trim(), content.trim());

    // Add selected photos to the post
    if (selectedPhotos && selectedPhotos.length > 0) {
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photoId = parseInt(selectedPhotos[i]);
        if (photoId) {
          await db.addPhotoToPost(post.id, photoId, i);
        }
      }
    }

    return c.redirect('/feed');
  } catch (error) {
    console.error('Create post error:', error);
    return c.text('Failed to create post', 500);
  }
});

photos.get('/upload', (c) => {
  const user = requireAuth(c);
  if (!user || typeof user !== 'object') return user;

  const content = `
    <div class="card" style="max-width: 600px; margin: 0 auto;">
        <div class="card-header">
            <h2>Upload Photo</h2>
        </div>
        <div class="card-body">
            <form method="POST" action="/upload" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">Description (optional)</label>
                    <textarea id="description" name="description" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="photo">Photo</label>
                    <input type="file" id="photo" name="photo" accept="image/*" required>
                </div>
                <button type="submit" class="btn" style="width: 100%;">Upload Photo</button>
            </form>
        </div>
    </div>
  `;

  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Upload Photo - Photo Blog</title>
        ${`<style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 20px 0; }
            .card-header { padding: 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
            .card-body { padding: 16px; }
            .form-group { margin-bottom: 16px; }
            .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
            .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
            .btn { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; }
            .btn:hover { background: #1d4ed8; }
        </style>`}
    </head>
    <body>
        <div class="container">
            <div style="margin-bottom: 20px;">
                <a href="/">← Back to Home</a>
            </div>
            ${content}
        </div>
    </body>
    </html>
  `);
});

photos.post('/upload', async (c) => {
  const user = requireAuth(c);
  if (!user || typeof user !== 'object') return user;

  try {
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const photoFile = formData.get('photo');

    if (!photoFile || typeof photoFile === 'string') {
      return c.text('Photo file is required', 400);
    }

    if (!title) {
      return c.text('Title is required', 400);
    }

    // Upload to R2
    const file = photoFile as File;
    const filename = generateUniqueFileName(file.name);
    await uploadToR2(c.env.BUCKET, file, filename);

    // Save to database
    const db = new DatabaseService(c.env.DB);
    const photoUrl = `/photos/${filename}`;
    await db.createPhoto(user.id, title, description, filename, photoUrl);

    return c.redirect('/feed');
  } catch (error) {
    console.error('Upload error:', error);
    return c.text('Upload failed', 500);
  }
});

photos.get('/photos/:filename', async (c) => {
  const filename = c.req.param('filename');

  try {
    const object = await c.env.BUCKET.get(filename);
    if (!object) {
      return c.notFound();
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    return c.notFound();
  }
});

photos.post('/posts/:id/comment', async (c) => {
  const user = requireAuth(c);
  if (!user || typeof user !== 'object') return user;

  const postId = parseInt(c.req.param('id'));
  const db = new DatabaseService(c.env.DB);

  try {
    const formData = await c.req.formData();
    const content = formData.get('content') as string;

    if (!content || content.trim() === '') {
      return c.text('Comment content is required', 400);
    }

    // Check if post exists
    const post = await db.getPostById(postId);
    if (!post) {
      return c.notFound();
    }

    // Create comment
    await db.createComment(postId, user.id, content.trim());

    return c.redirect('/feed');
  } catch (error) {
    console.error('Comment error:', error);
    return c.text('Failed to post comment', 500);
  }
});

photos.post('/photos/:id/delete', async (c) => {
  const user = requireAuth(c);
  if (!user || typeof user !== 'object') return user;

  const photoId = parseInt(c.req.param('id'));
  const db = new DatabaseService(c.env.DB);

  try {
    // Get photo to check ownership
    const photos = await db.getAllPhotos();
    const photo = photos.find(p => p.id === photoId);

    if (!photo) {
      return c.notFound();
    }

    // Check if user owns the photo or is admin
    const isOwner = photo.user_id === user.id;
    const isAdmin = user.roles?.some((r: any) => r.name === 'admin');

    if (!isOwner && !isAdmin) {
      return c.text('Forbidden', 403);
    }

    // Delete from R2
    await deleteFromR2(c.env.BUCKET, photo.filename);

    // Delete from database
    await db.deletePhoto(photoId);

    return c.redirect('/feed');
  } catch (error) {
    console.error('Delete error:', error);
    return c.text('Delete failed', 500);
  }
});

export default photos;