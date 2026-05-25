import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');

const sql = postgres(url);
const db = drizzle(sql, { schema });

const HASH_ROUNDS = 10;

await db.delete(schema.services);
await db.delete(schema.users);

await db.insert(schema.users).values([
  {
    email: 'admin@cleandrop.com',
    password: await bcrypt.hash('admin123', HASH_ROUNDS),
    name: 'Dev Admin',
    role: 'admin',
  },
  {
    email: 'user@cleandrop.com',
    password: await bcrypt.hash('user123', HASH_ROUNDS),
    name: 'Regular User',
    role: 'user',
  },
]);

await db.insert(schema.services).values([
  {
    name: 'Standard Clean',
    description: 'Routine apartment cleaning package.',
    category: 'Residential',
    company: 'Acme Cleaning S.r.l.',
    status: 'active',
    duration: 90,
    basePrice: 80,
  },
  {
    name: 'Deep Clean',
    description: 'Extended detail-focused cleaning service.',
    category: 'Residential',
    company: 'Acme Cleaning S.r.l.',
    status: 'active',
    duration: 180,
    basePrice: 150,
  },
  {
    name: 'Office Daily Clean',
    description: 'Daily office maintenance cleaning.',
    category: 'Commercial',
    company: 'Acme Cleaning S.r.l.',
    status: 'active',
    duration: 120,
    basePrice: 120,
  },
  {
    name: 'Post-Renovation Cleanup',
    description: 'Dust and debris removal after works.',
    category: 'Specialty',
    company: 'Acme Cleaning S.r.l.',
    status: 'draft',
    duration: 240,
    basePrice: 300,
  },
  {
    name: 'Move-In / Move-Out',
    description: 'Full reset clean for property handover.',
    category: 'Specialty',
    company: 'BrightHome S.P.A.',
    status: 'active',
    duration: 210,
    basePrice: 220,
  },
  {
    name: 'Retail Floor Refresh',
    description: 'Surface and floor-focused retail cleaning.',
    category: 'Commercial',
    company: 'BrightHome S.P.A.',
    status: 'inactive',
    duration: 100,
    basePrice: 95,
  },
  {
    name: 'Industrial Deep Scrub',
    description: 'Heavy-duty industrial facility cleaning.',
    category: 'Industrial',
    company: 'BrightHome S.P.A.',
    status: 'active',
    duration: 480,
    basePrice: 600,
  },
  {
    name: 'Carpet Steam Clean',
    description: 'Professional carpet steam treatment.',
    category: 'Residential',
    company: 'Acme Cleaning S.r.l.',
    status: 'active',
    duration: 150,
    basePrice: 130,
  },
  {
    name: 'Window & Facade Clean',
    description: 'Exterior window and facade washing service.',
    category: 'Commercial',
    company: 'BrightHome S.P.A.',
    status: 'draft',
    duration: 200,
    basePrice: 180,
  },
]);

console.log('Seed complete: 2 users, 9 services');
await sql.end();
