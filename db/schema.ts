import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  googleSub: text('google_sub').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  branch: text('branch').notNull().default('CSE'),
  semester: text('semester').notNull().default('1'),
  bio: text('bio').notNull().default(''),
})
export const sessions = sqliteTable('sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires').notNull(),
})
export const loginNonces = sqliteTable('login_nonces', {
  nonce: text('nonce').primaryKey(),
  expires: integer('expires').notNull(),
})
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  author: text('author').notNull(),
  authorEmail: text('author_email').notNull(),
  createdAt: text('created_at').notNull(),
  sampleLikes: integer('sample_likes').notNull().default(0),
})
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
})
export const likes = sqliteTable('likes', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.postId, table.userId] })])
export const saved = sqliteTable('saved', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.postId, table.userId] })])
export const announcements = sqliteTable('announcements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  createdAt: text('created_at').notNull(),
  isPinned: integer('is_pinned').notNull().default(0),
})
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})
