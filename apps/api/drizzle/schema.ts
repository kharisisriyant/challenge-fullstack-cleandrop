import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const roleEnum = pgEnum('role', ['admin', 'user']);
export const serviceStatusEnum = pgEnum('service_status', ['active', 'draft', 'inactive']);
export const categoryEnum = pgEnum('category', ['Residential', 'Commercial', 'Specialty', 'Industrial']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const services = pgTable('services', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  category: categoryEnum('category').notNull(),
  company: text('company').notNull(),
  status: serviceStatusEnum('status').notNull().default('draft'),
  duration: integer('duration').notNull(),
  basePrice: integer('base_price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
