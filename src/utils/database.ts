import { User, Role, Photo, UserRole, Post, Comment, PostPhoto, Code } from '../types';

export class DatabaseService {
  constructor(private db: D1Database) {}

  async createUser(email: string, hashedPassword: string, name: string): Promise<User> {
    const result = await this.db.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?) RETURNING *'
    ).bind(email, hashedPassword, name).first<User>();

    if (!result) throw new Error('Failed to create user');
    return result;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>();
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(id).first<User>();
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all<User>();
    return result.results;
  }

  async assignRole(userId: number, roleId: number): Promise<void> {
    await this.db.prepare(
      'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)'
    ).bind(userId, roleId).run();
  }

  async removeRole(userId: number, roleId: number): Promise<void> {
    await this.db.prepare(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?'
    ).bind(userId, roleId).run();
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const result = await this.db.prepare(`
      SELECT r.* FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `).bind(userId).all<Role>();
    return result.results;
  }

  async getAllRoles(): Promise<Role[]> {
    const result = await this.db.prepare('SELECT * FROM roles ORDER BY name').all<Role>();
    return result.results;
  }

  async createPhoto(userId: number, title: string, description: string, filename: string, url: string, isStandalone: boolean = true): Promise<Photo> {
    const result = await this.db.prepare(
      'INSERT INTO photos (user_id, title, description, filename, url, is_standalone) VALUES (?, ?, ?, ?, ?, ?) RETURNING *'
    ).bind(userId, title, description, filename, url, isStandalone).first<Photo>();

    if (!result) throw new Error('Failed to create photo');
    return result;
  }

  async getAllPhotos(): Promise<Photo[]> {
    const result = await this.db.prepare(`
      SELECT p.*, u.name as user_name FROM photos p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `).all();
    return result.results as unknown as Photo[];
  }

  async getPhotosByUser(userId: number): Promise<Photo[]> {
    const result = await this.db.prepare(
      'SELECT * FROM photos WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all<Photo>();
    return result.results;
  }

  async deletePhoto(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM photos WHERE id = ?').bind(id).run();
  }

  // Post methods
  async createPost(userId: number, title: string, content?: string): Promise<Post> {
    const result = await this.db.prepare(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?) RETURNING *'
    ).bind(userId, title, content || '').first<Post>();

    if (!result) throw new Error('Failed to create post');
    return result;
  }

  async getPostById(id: number): Promise<Post | null> {
    const result = await this.db.prepare(`
      SELECT p.*, u.name as user_name FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).bind(id).first();
    return result as unknown as Post || null;
  }

  async getAllPosts(): Promise<Post[]> {
    const result = await this.db.prepare(`
      SELECT p.*, u.name as user_name FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `).all();
    return result.results as unknown as Post[];
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    const result = await this.db.prepare(`
      SELECT p.*, u.name as user_name FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `).bind(userId).all();
    return result.results as unknown as Post[];
  }

  async deletePost(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  }

  // Post-Photo association methods
  async addPhotoToPost(postId: number, photoId: number, displayOrder: number = 0): Promise<void> {
    await this.db.prepare(
      'INSERT INTO post_photos (post_id, photo_id, display_order) VALUES (?, ?, ?)'
    ).bind(postId, photoId, displayOrder).run();

    // Mark photo as not standalone
    await this.db.prepare(
      'UPDATE photos SET is_standalone = FALSE WHERE id = ?'
    ).bind(photoId).run();
  }

  async getPostPhotos(postId: number): Promise<Photo[]> {
    const result = await this.db.prepare(`
      SELECT p.* FROM photos p
      JOIN post_photos pp ON p.id = pp.photo_id
      WHERE pp.post_id = ?
      ORDER BY pp.display_order, pp.created_at
    `).bind(postId).all();
    return result.results as unknown as Photo[];
  }

  async removePhotoFromPost(postId: number, photoId: number): Promise<void> {
    await this.db.prepare(
      'DELETE FROM post_photos WHERE post_id = ? AND photo_id = ?'
    ).bind(postId, photoId).run();

    // Check if photo is used in other posts, if not mark as standalone
    const usageResult = await this.db.prepare(
      'SELECT COUNT(*) as count FROM post_photos WHERE photo_id = ?'
    ).bind(photoId).first<{ count: number }>();

    if (usageResult && usageResult.count === 0) {
      await this.db.prepare(
        'UPDATE photos SET is_standalone = TRUE WHERE id = ?'
      ).bind(photoId).run();
    }
  }

  // Comment methods
  async createComment(postId: number, userId: number, content: string): Promise<Comment> {
    const result = await this.db.prepare(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?) RETURNING *'
    ).bind(postId, userId, content).first<Comment>();

    if (!result) throw new Error('Failed to create comment');
    return result;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    const result = await this.db.prepare(`
      SELECT c.*, u.name as user_name FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).bind(postId).all();
    return result.results as unknown as Comment[];
  }

  async deleteComment(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
  }

  // Combined methods for feed
  async getPostsWithPhotosAndComments(): Promise<Post[]> {
    const posts = await this.getAllPosts();

    for (const post of posts) {
      post.photos = await this.getPostPhotos(post.id);
      post.comments = await this.getPostComments(post.id);
    }

    return posts;
  }

  async getStandalonePhotos(): Promise<Photo[]> {
    const result = await this.db.prepare(`
      SELECT p.*, u.name as user_name FROM photos p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_standalone = TRUE
      ORDER BY p.created_at DESC
    `).all();
    return result.results as unknown as Photo[];
  }

  // Code methods
  async createCode(code: string, startDatetime: string, endDatetime: string, type: string, target: string): Promise<Code> {
    const result = await this.db.prepare(
      'INSERT INTO codes (code, start_datetime, end_datetime, type, target) VALUES (?, ?, ?, ?, ?) RETURNING *'
    ).bind(code, startDatetime, endDatetime, type, target).first<Code>();

    if (!result) throw new Error('Failed to create code');
    return result;
  }

  async getCodeByCode(code: string): Promise<Code | null> {
    return await this.db.prepare(
      'SELECT * FROM codes WHERE code = ?'
    ).bind(code).first<Code>();
  }

  async useCode(code: string, userId: number): Promise<void> {
    await this.db.prepare(
      'UPDATE codes SET used_at = CURRENT_TIMESTAMP, used_by_user_id = ? WHERE code = ?'
    ).bind(userId, code).run();
  }

  async getAllCodes(): Promise<Code[]> {
    const result = await this.db.prepare('SELECT * FROM codes ORDER BY created_at DESC').all<Code>();
    return result.results;
  }
}