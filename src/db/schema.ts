import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table linked to Firebase Authentication
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table linked to users through Firebase Auth UID
export const orders = pgTable('orders', {
  id: text('id').primaryKey(), // e.g. ORD-1234
  userUid: text('user_uid').references(() => users.uid), // Can be null for guest checkouts, or linked to user
  clientName: text('client_name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  address: text('address').notNull(),
  itemsJson: text('items_json').notNull(), // Serialized array of products
  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').notNull(),
  shipping: integer('shipping').notNull(),
  total: integer('total').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'cod' | 'qris'
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'APPROVED' | 'DELIVERED'
  csrfToken: text('csrf_token').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
