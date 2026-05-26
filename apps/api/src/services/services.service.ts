import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../../drizzle/schema';
import { eq, ilike, and, SQL, sql, asc, desc, gte, lte } from 'drizzle-orm';
import { CreateServiceInput, UpdateServiceInput, SortOrder, ServiceFiltersInput, ServicePaginationInput, ServiceSortInput, ServiceStatsType } from './services.types';

type ServiceWithCompany = schema.Service & { company: schema.Company };

@Injectable()
export class ServicesService {
  constructor(private readonly drizzle: DrizzleService) {}

  private shape(row: { services: schema.Service; companies: schema.Company }): ServiceWithCompany {
    return { ...row.services, company: row.companies };
  }

  private buildConditions(filters?: ServiceFiltersInput): SQL[] {
    const conditions: SQL[] = [];
    if (filters?.search) conditions.push(ilike(schema.services.name, `%${filters.search}%`));
    if (filters?.status) conditions.push(eq(schema.services.status, filters.status as schema.Service['status']));
    if (filters?.category) conditions.push(eq(schema.services.category, filters.category as schema.Service['category']));
    if (filters?.companyId) conditions.push(eq(schema.services.companyId, filters.companyId));
    if (typeof filters?.durationMin === 'number') conditions.push(gte(schema.services.duration, filters.durationMin));
    if (typeof filters?.durationMax === 'number') conditions.push(lte(schema.services.duration, filters.durationMax));
    return conditions;
  }

  async findAll(opts: {
    filters?: ServiceFiltersInput;
    pagination?: ServicePaginationInput;
    sort?: ServiceSortInput;
  }) {
    const { filters, pagination, sort } = opts;
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 6;

    const conditions = this.buildConditions(filters);
    const where = conditions.length ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    const sortableColumns = {
      name: schema.services.name,
      category: schema.services.category,
      company: schema.companies.name,
      status: schema.services.status,
      duration: schema.services.duration,
    };
    type SortKey = keyof typeof sortableColumns;
    const sortKey: SortKey = (sort?.sortBy && sort.sortBy in sortableColumns)
      ? (sort.sortBy as SortKey)
      : 'name';
    const orderExpr = sort?.sortOrder === SortOrder.desc ? desc(sortableColumns[sortKey]) : asc(sortableColumns[sortKey]);

    const [rows, [countRow]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(schema.services)
        .innerJoin(schema.companies, eq(schema.services.companyId, schema.companies.id))
        .where(where)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.services)
        .innerJoin(schema.companies, eq(schema.services.companyId, schema.companies.id))
        .where(where),
    ]);

    return { items: rows.map((r) => this.shape(r)), total: countRow?.count ?? 0 };
  }

  async getStats(filters?: ServiceFiltersInput): Promise<ServiceStatsType> {
    const conditions = this.buildConditions(filters);
    const where = conditions.length ? and(...conditions) : undefined;

    const [row] = await this.drizzle.db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${schema.services.status} = 'active')::int`,
        drafts: sql<number>`count(*) filter (where ${schema.services.status} = 'draft')::int`,
        avgBasePrice: sql<number>`coalesce(round(avg(${schema.services.basePrice}))::int, 0)`,
      })
      .from(schema.services)
      .innerJoin(schema.companies, eq(schema.services.companyId, schema.companies.id))
      .where(where);

    return {
      total: row?.total ?? 0,
      active: row?.active ?? 0,
      drafts: row?.drafts ?? 0,
      avgBasePrice: row?.avgBasePrice ?? 0,
    };
  }

  async findOne(id: string): Promise<ServiceWithCompany> {
    const [row] = await this.drizzle.db
      .select()
      .from(schema.services)
      .innerJoin(schema.companies, eq(schema.services.companyId, schema.companies.id))
      .where(eq(schema.services.id, id))
      .limit(1);
    if (!row) throw new NotFoundException(`Service ${id} not found`);
    return this.shape(row);
  }

  private async assertCompanyExists(companyId: string) {
    const [c] = await this.drizzle.db
      .select({ id: schema.companies.id })
      .from(schema.companies)
      .where(eq(schema.companies.id, companyId))
      .limit(1);
    if (!c) throw new NotFoundException(`Company ${companyId} not found`);
  }

  async create(input: CreateServiceInput) {
    await this.assertCompanyExists(input.companyId);
    const [created] = await this.drizzle.db
      .insert(schema.services)
      .values({
        name: input.name,
        description: input.description ?? '',
        category: input.category,
        companyId: input.companyId,
        status: input.status ?? 'draft',
        duration: input.duration,
        basePrice: input.basePrice,
      })
      .returning();
    return this.findOne(created.id);
  }

  async update(id: string, input: UpdateServiceInput) {
    await this.findOne(id);
    if (input.companyId) await this.assertCompanyExists(input.companyId);
    await this.drizzle.db
      .update(schema.services)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(schema.services.id, id));
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.drizzle.db.delete(schema.services).where(eq(schema.services.id, id));
    return true;
  }
}
