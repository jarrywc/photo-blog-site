import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const userRoles = sqliteTable('user_roles', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: text('assigned_at').default('CURRENT_TIMESTAMP'),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));

export const photos = sqliteTable('photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  isStandalone: integer('is_standalone', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').default(''),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const postPhotos = sqliteTable('post_photos', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  photoId: integer('photo_id').notNull().references(() => photos.id, { onDelete: 'cascade' }),
  displayOrder: integer('display_order').default(0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
}, (table) => ({
  pk: primaryKey({ columns: [table.postId, table.photoId] }),
}));

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const codes = sqliteTable('codes', {
  code: text('code').primaryKey(),
  startDatetime: text('start_datetime').notNull(),
  endDatetime: text('end_datetime').notNull(),
  type: text('type').notNull().default('signup'),
  target: text('target').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  usedAt: text('used_at'),
  usedByUserId: integer('used_by_user_id').references(() => users.id, { onDelete: 'set null' }),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  photos: many(photos),
  posts: many(posts),
  comments: many(comments),
  usedCodes: many(codes),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const photosRelations = relations(photos, ({ one, many }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
  postPhotos: many(postPhotos),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  postPhotos: many(postPhotos),
  comments: many(comments),
}));

export const postPhotosRelations = relations(postPhotos, ({ one }) => ({
  post: one(posts, {
    fields: [postPhotos.postId],
    references: [posts.id],
  }),
  photo: one(photos, {
    fields: [postPhotos.photoId],
    references: [photos.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const codesRelations = relations(codes, ({ one }) => ({
  usedByUser: one(users, {
    fields: [codes.usedByUserId],
    references: [users.id],
  }),
}));