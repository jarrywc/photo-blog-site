import { eq, desc, and, count } from 'drizzle-orm';
import type { Database } from '../db';
import { users, roles, userRoles, photos, posts, postPhotos, comments, codes } from '../db/schema';

export class DrizzleDatabaseService {
  constructor(private db: Database) {}

  // User methods
  async createUser(email: string, hashedPassword: string, name: string) {
    const result = await this.db.insert(users)
      .values({ email, password: hashedPassword, name })
      .returning();
    return result[0];
  }

  async getUserByEmail(email: string) {
    const result = await this.db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  }

  async getUserById(id: number) {
    const result = await this.db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getAllUsers() {
    return await this.db.select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  // Role methods
  async assignRole(userId: number, roleId: number) {
    await this.db.insert(userRoles)
      .values({ userId, roleId })
      .onConflictDoNothing();
  }

  async removeRole(userId: number, roleId: number) {
    await this.db.delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  }

  async getUserRoles(userId: number) {
    return await this.db.select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      createdAt: roles.createdAt,
    })
      .from(roles)
      .innerJoin(userRoles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, userId));
  }

  async getAllRoles() {
    return await this.db.select()
      .from(roles)
      .orderBy(roles.name);
  }

  // Photo methods
  async createPhoto(userId: number, title: string, description: string, filename: string, url: string, isStandalone: boolean = true) {
    const result = await this.db.insert(photos)
      .values({ userId, title, description, filename, url, isStandalone })
      .returning();
    return result[0];
  }

  async getAllPhotos() {
    return await this.db.select({
      id: photos.id,
      userId: photos.userId,
      title: photos.title,
      description: photos.description,
      filename: photos.filename,
      url: photos.url,
      isStandalone: photos.isStandalone,
      createdAt: photos.createdAt,
      user_name: users.name,
    })
      .from(photos)
      .innerJoin(users, eq(photos.userId, users.id))
      .orderBy(desc(photos.createdAt));
  }

  async getPhotosByUser(userId: number) {
    return await this.db.select()
      .from(photos)
      .where(eq(photos.userId, userId))
      .orderBy(desc(photos.createdAt));
  }

  async deletePhoto(id: number) {
    await this.db.delete(photos)
      .where(eq(photos.id, id));
  }

  // Post methods
  async createPost(userId: number, title: string, content?: string) {
    const result = await this.db.insert(posts)
      .values({ userId, title, content: content || '' })
      .returning();
    return result[0];
  }

  async getPostById(id: number) {
    const result = await this.db.select({
      id: posts.id,
      userId: posts.userId,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      user_name: users.name,
    })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getAllPosts() {
    return await this.db.select({
      id: posts.id,
      userId: posts.userId,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      user_name: users.name,
    })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));
  }

  async getPostsByUser(userId: number) {
    return await this.db.select({
      id: posts.id,
      userId: posts.userId,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      user_name: users.name,
    })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async deletePost(id: number) {
    await this.db.delete(posts)
      .where(eq(posts.id, id));
  }

  // Post-Photo association methods
  async addPhotoToPost(postId: number, photoId: number, displayOrder: number = 0) {
    await this.db.insert(postPhotos)
      .values({ postId, photoId, displayOrder });

    await this.db.update(photos)
      .set({ isStandalone: false })
      .where(eq(photos.id, photoId));
  }

  async getPostPhotos(postId: number) {
    return await this.db.select({
      id: photos.id,
      userId: photos.userId,
      title: photos.title,
      description: photos.description,
      filename: photos.filename,
      url: photos.url,
      isStandalone: photos.isStandalone,
      createdAt: photos.createdAt,
    })
      .from(photos)
      .innerJoin(postPhotos, eq(photos.id, postPhotos.photoId))
      .where(eq(postPhotos.postId, postId))
      .orderBy(postPhotos.displayOrder, postPhotos.createdAt);
  }

  async removePhotoFromPost(postId: number, photoId: number) {
    await this.db.delete(postPhotos)
      .where(and(eq(postPhotos.postId, postId), eq(postPhotos.photoId, photoId)));

    const usageResult = await this.db.select({ count: count() })
      .from(postPhotos)
      .where(eq(postPhotos.photoId, photoId));

    if (usageResult[0].count === 0) {
      await this.db.update(photos)
        .set({ isStandalone: true })
        .where(eq(photos.id, photoId));
    }
  }

  // Comment methods
  async createComment(postId: number, userId: number, content: string) {
    const result = await this.db.insert(comments)
      .values({ postId, userId, content })
      .returning();
    return result[0];
  }

  async getPostComments(postId: number) {
    return await this.db.select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      user_name: users.name,
    })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);
  }

  async deleteComment(id: number) {
    await this.db.delete(comments)
      .where(eq(comments.id, id));
  }

  // Code methods
  async createCode(code: string, startDatetime: string, endDatetime: string, type: string, target: string) {
    const result = await this.db.insert(codes)
      .values({ code, startDatetime, endDatetime, type, target })
      .returning();
    return result[0];
  }

  async getCodeByCode(code: string) {
    const result = await this.db.select()
      .from(codes)
      .where(eq(codes.code, code))
      .limit(1);
    return result[0] || null;
  }

  async useCode(code: string, userId: number) {
    await this.db.update(codes)
      .set({ usedAt: new Date().toISOString(), usedByUserId: userId })
      .where(eq(codes.code, code));
  }

  async getAllCodes() {
    return await this.db.select()
      .from(codes)
      .orderBy(desc(codes.createdAt));
  }

  // Combined methods for feed
  async getPostsWithPhotosAndComments() {
    const allPosts = await this.getAllPosts();

    for (const post of allPosts) {
      const postPhotos = await this.getPostPhotos(post.id);
      const postComments = await this.getPostComments(post.id);
      (post as any).photos = postPhotos;
      (post as any).comments = postComments;
    }

    return allPosts;
  }

  async getStandalonePhotos() {
    return await this.db.select({
      id: photos.id,
      userId: photos.userId,
      title: photos.title,
      description: photos.description,
      filename: photos.filename,
      url: photos.url,
      isStandalone: photos.isStandalone,
      createdAt: photos.createdAt,
      user_name: users.name,
    })
      .from(photos)
      .innerJoin(users, eq(photos.userId, users.id))
      .where(eq(photos.isStandalone, true))
      .orderBy(desc(photos.createdAt));
  }
}