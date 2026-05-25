"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = exports.users = exports.categoryEnum = exports.serviceStatusEnum = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.roleEnum = (0, pg_core_1.pgEnum)('role', ['admin', 'user']);
exports.serviceStatusEnum = (0, pg_core_1.pgEnum)('service_status', ['active', 'draft', 'inactive']);
exports.categoryEnum = (0, pg_core_1.pgEnum)('category', ['Residential', 'Commercial', 'Specialty', 'Industrial']);
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    password: (0, pg_core_1.text)('password').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    role: (0, exports.roleEnum)('role').notNull().default('user'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.services = (0, pg_core_1.pgTable)('services', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description').notNull().default(''),
    category: (0, exports.categoryEnum)('category').notNull(),
    company: (0, pg_core_1.text)('company').notNull(),
    status: (0, exports.serviceStatusEnum)('status').notNull().default('draft'),
    duration: (0, pg_core_1.integer)('duration').notNull(),
    basePrice: (0, pg_core_1.integer)('base_price').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
//# sourceMappingURL=schema.js.map