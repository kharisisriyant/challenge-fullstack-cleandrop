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
await db.delete(schema.companies);
await db.delete(schema.users);

await db.insert(schema.users).values([
  {
    email: 'admin@cleandrop.io',
    password: await bcrypt.hash('admin123', HASH_ROUNDS),
    name: 'Dev Admin',
    role: 'admin',
  },
  {
    email: 'user@cleandrop.io',
    password: await bcrypt.hash('user123', HASH_ROUNDS),
    name: 'Regular User',
    role: 'user',
  },
]);

const insertedCompanies = await db
  .insert(schema.companies)
  .values([
    { name: 'Acme Cleaning S.r.l.' },
    { name: 'BrightHome S.P.A.' },
    { name: 'SparkleWorks Ltd.' },
    { name: 'PureSpace Group' },
    { name: 'NordClean GmbH' },
    { name: 'UrbanShine Co.' },
  ])
  .returning();

const companyByName = Object.fromEntries(insertedCompanies.map((c) => [c.name, c.id]));
const acmeId = companyByName['Acme Cleaning S.r.l.'];
const brightId = companyByName['BrightHome S.P.A.'];
const sparkleId = companyByName['SparkleWorks Ltd.'];
const pureId = companyByName['PureSpace Group'];
const nordId = companyByName['NordClean GmbH'];
const urbanId = companyByName['UrbanShine Co.'];

await db.insert(schema.services).values([
  // Acme Cleaning S.r.l.
  { name: 'Standard Clean', description: 'Routine apartment cleaning package.', category: 'Residential', companyId: acmeId, status: 'active', duration: 90, basePrice: 80 },
  { name: 'Deep Clean', description: 'Extended detail-focused cleaning service.', category: 'Residential', companyId: acmeId, status: 'active', duration: 180, basePrice: 150 },
  { name: 'Office Daily Clean', description: 'Daily office maintenance cleaning.', category: 'Commercial', companyId: acmeId, status: 'active', duration: 120, basePrice: 120 },
  { name: 'Post-Renovation Cleanup', description: 'Dust and debris removal after works.', category: 'Specialty', companyId: acmeId, status: 'draft', duration: 240, basePrice: 300 },
  { name: 'Carpet Steam Clean', description: 'Professional carpet steam treatment.', category: 'Residential', companyId: acmeId, status: 'active', duration: 150, basePrice: 130 },
  { name: 'Upholstery Refresh', description: 'Fabric sofa and chair deep cleaning.', category: 'Residential', companyId: acmeId, status: 'inactive', duration: 120, basePrice: 110 },
  { name: 'Warehouse Floor Strip', description: 'Industrial floor strip and reseal.', category: 'Industrial', companyId: acmeId, status: 'draft', duration: 360, basePrice: 520 },

  // BrightHome S.P.A.
  { name: 'Move-In / Move-Out', description: 'Full reset clean for property handover.', category: 'Specialty', companyId: brightId, status: 'active', duration: 210, basePrice: 220 },
  { name: 'Retail Floor Refresh', description: 'Surface and floor-focused retail cleaning.', category: 'Commercial', companyId: brightId, status: 'inactive', duration: 100, basePrice: 95 },
  { name: 'Industrial Deep Scrub', description: 'Heavy-duty industrial facility cleaning.', category: 'Industrial', companyId: brightId, status: 'active', duration: 480, basePrice: 600 },
  { name: 'Window & Facade Clean', description: 'Exterior window and facade washing service.', category: 'Commercial', companyId: brightId, status: 'draft', duration: 200, basePrice: 180 },
  { name: 'Holiday Rental Turnover', description: 'Same-day turnover for short-term rentals.', category: 'Residential', companyId: brightId, status: 'active', duration: 75, basePrice: 70 },
  { name: 'Mattress Sanitization', description: 'Allergen and dust mite mattress treatment.', category: 'Specialty', companyId: brightId, status: 'active', duration: 60, basePrice: 65 },
  { name: 'Showroom Polish', description: 'High-gloss surface polish for showrooms.', category: 'Commercial', companyId: brightId, status: 'draft', duration: 150, basePrice: 160 },

  // SparkleWorks Ltd.
  { name: 'Weekly Home Maintenance', description: 'Weekly recurring residential clean.', category: 'Residential', companyId: sparkleId, status: 'active', duration: 120, basePrice: 90 },
  { name: 'Eco Green Clean', description: 'Plant-based products with low VOC impact.', category: 'Residential', companyId: sparkleId, status: 'active', duration: 150, basePrice: 140 },
  { name: 'Coworking Space Reset', description: 'Overnight reset for shared coworking floors.', category: 'Commercial', companyId: sparkleId, status: 'active', duration: 180, basePrice: 200 },
  { name: 'Construction Final Clean', description: 'Final builders clean before handover.', category: 'Specialty', companyId: sparkleId, status: 'draft', duration: 300, basePrice: 380 },
  { name: 'Tile & Grout Restoration', description: 'Deep restoration of tile and grout lines.', category: 'Specialty', companyId: sparkleId, status: 'active', duration: 240, basePrice: 260 },
  { name: 'Restaurant Kitchen Degrease', description: 'Heavy degrease for commercial kitchens.', category: 'Commercial', companyId: sparkleId, status: 'inactive', duration: 200, basePrice: 240 },

  // PureSpace Group
  { name: 'Hospital Disinfection', description: 'Medical-grade disinfection protocol.', category: 'Industrial', companyId: pureId, status: 'active', duration: 300, basePrice: 480 },
  { name: 'School Sanitization', description: 'Classroom and common area sanitization.', category: 'Commercial', companyId: pureId, status: 'active', duration: 240, basePrice: 280 },
  { name: 'Air Duct Cleaning', description: 'HVAC duct and vent cleaning service.', category: 'Specialty', companyId: pureId, status: 'active', duration: 180, basePrice: 220 },
  { name: 'Studio Apartment Quick', description: 'Compact studio one-hour refresh.', category: 'Residential', companyId: pureId, status: 'active', duration: 60, basePrice: 55 },
  { name: 'Gym & Locker Room Clean', description: 'Sweat-zone deep sanitization.', category: 'Commercial', companyId: pureId, status: 'draft', duration: 150, basePrice: 170 },
  { name: 'Mold Remediation', description: 'Targeted mold removal with sealing.', category: 'Specialty', companyId: pureId, status: 'inactive', duration: 360, basePrice: 540 },
  { name: 'Solar Panel Wash', description: 'Non-abrasive solar panel cleaning.', category: 'Industrial', companyId: pureId, status: 'draft', duration: 120, basePrice: 180 },

  // NordClean GmbH
  { name: 'Villa Estate Clean', description: 'Full-day villa and estate cleaning.', category: 'Residential', companyId: nordId, status: 'active', duration: 360, basePrice: 420 },
  { name: 'Bank Branch Daily', description: 'Daily branch open-hours maintenance.', category: 'Commercial', companyId: nordId, status: 'active', duration: 90, basePrice: 110 },
  { name: 'Data Center Dust Control', description: 'Anti-static cleaning for server rooms.', category: 'Industrial', companyId: nordId, status: 'active', duration: 240, basePrice: 380 },
  { name: 'Crime Scene Biohazard', description: 'Biohazard remediation and disposal.', category: 'Specialty', companyId: nordId, status: 'draft', duration: 420, basePrice: 800 },
  { name: 'Pre-Sale Staging Clean', description: 'Property prep clean for listing photos.', category: 'Residential', companyId: nordId, status: 'active', duration: 180, basePrice: 170 },
  { name: 'Conference Hall Turnover', description: 'Between-event hall reset and polish.', category: 'Commercial', companyId: nordId, status: 'inactive', duration: 120, basePrice: 140 },

  // UrbanShine Co.
  { name: 'Apartment Block Common Areas', description: 'Lobby, hallway and stairwell cleaning.', category: 'Residential', companyId: urbanId, status: 'active', duration: 150, basePrice: 130 },
  { name: 'Boutique Retail Clean', description: 'Small boutique store nightly clean.', category: 'Commercial', companyId: urbanId, status: 'active', duration: 90, basePrice: 85 },
  { name: 'Pressure Washing Exterior', description: 'High-pressure exterior wall and driveway wash.', category: 'Specialty', companyId: urbanId, status: 'active', duration: 180, basePrice: 200 },
  { name: 'Factory Line Wipe-Down', description: 'Production line surface decontamination.', category: 'Industrial', companyId: urbanId, status: 'draft', duration: 240, basePrice: 340 },
  { name: 'Airbnb 2-Bedroom Turnover', description: 'Two-bedroom short-let turnover with linens.', category: 'Residential', companyId: urbanId, status: 'active', duration: 100, basePrice: 95 },
  { name: 'Graffiti Removal', description: 'Surface-safe graffiti removal treatment.', category: 'Specialty', companyId: urbanId, status: 'inactive', duration: 120, basePrice: 160 },
]);

console.log('Seed complete: 2 users, 6 companies, 40 services');
await sql.end();
