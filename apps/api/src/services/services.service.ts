import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../../drizzle/schema';
import { eq, ilike, and, SQL, sql, asc, desc } from 'drizzle-orm';
import { CreateServiceInput, UpdateServiceInput, SortOrder, ServiceFiltersInput, ServicePaginationInput, ServiceSortInput, ServiceStatsType } from './services.types';

@Injectable()
export class ServicesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll(opts: {
    filters?: ServiceFiltersInput;
    pagination?: ServicePaginationInput;
    sort?: ServiceSortInput;
  }) {
    const { filters, pagination, sort } = opts;
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 6;

    const conditions: SQL[] = [];
    if (filters?.search) conditions.push(ilike(schema.services.name, `%${filters.search}%`));
    if (filters?.status) conditions.push(eq(schema.services.status, filters.status as schema.Service['status']));
    if (filters?.category) conditions.push(eq(schema.services.category, filters.category as schema.Service['category']));

    const where = conditions.length ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    console.log({where})

    const sortableColumns = {
      name: schema.services.name,
      category: schema.services.category,
      company: schema.services.company,
      status: schema.services.status,
      duration: schema.services.duration,
    };
    type SortKey = keyof typeof sortableColumns;
    const sortKey: SortKey = (sort?.sortBy && sort.sortBy in sortableColumns)
      ? (sort.sortBy as SortKey)
      : 'name';
    const orderExpr = sort?.sortOrder === SortOrder.desc ? desc(sortableColumns[sortKey]) : asc(sortableColumns[sortKey]);

    const [items, [countRow]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(schema.services)
        .where(where)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.services)
        .where(where),
    ]);

    return { items, total: countRow?.count ?? 0 };
  }

  async getStats(filters?: ServiceFiltersInput): Promise<ServiceStatsType> {
    const conditions: SQL[] = [];
    if (filters?.search) conditions.push(ilike(schema.services.name, `%${filters.search}%`));
    if (filters?.status) conditions.push(eq(schema.services.status, filters.status as schema.Service['status']));
    if (filters?.category) conditions.push(eq(schema.services.category, filters.category as schema.Service['category']));

    const where = conditions.length ? and(...conditions) : undefined;

    const [row] = await this.drizzle.db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where status = 'active')::int`,
        drafts: sql<number>`count(*) filter (where status = 'draft')::int`,
        avgBasePrice: sql<number>`coalesce(round(avg(base_price))::int, 0)`,
      })
      .from(schema.services)
      .where(where);

    return {
      total: row?.total ?? 0,
      active: row?.active ?? 0,
      drafts: row?.drafts ?? 0,
      avgBasePrice: row?.avgBasePrice ?? 0,
    };
  }

  async findOne(id: string) {
    const [service] = await this.drizzle.db
      .select()
      .from(schema.services)
      .where(eq(schema.services.id, id))
      .limit(1);
    if (!service) throw new NotFoundException(`Service ${id} not found`);
    return service;
  }

  async create(input: CreateServiceInput) {
    const [created] = await this.drizzle.db
      .insert(schema.services)
      .values({
        name: input.name,
        description: input.description ?? '',
        category: input.category,
        company: input.company,
        status: input.status ?? 'draft',
        duration: input.duration,
        basePrice: input.basePrice,
      })
      .returning();
    return created;
  }

  async update(id: string, input: UpdateServiceInput) {
    await this.findOne(id);
    const [updated] = await this.drizzle.db
      .update(schema.services)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(schema.services.id, id))
      .returning();
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.drizzle.db.delete(schema.services).where(eq(schema.services.id, id));
    return true;
  }
}
