import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../../drizzle/schema';
import { eq, ilike, and, SQL, sql, asc, desc } from 'drizzle-orm';
import { CreateServiceInput, UpdateServiceInput, SortOrder } from './services.types';

@Injectable()
export class ServicesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll(opts: {
    search?: string;
    status?: string;
    category?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: SortOrder;
  }) {
    const conditions: SQL[] = [];
    if (opts.search) conditions.push(ilike(schema.services.name, `%${opts.search}%`));
    if (opts.status) conditions.push(eq(schema.services.status, opts.status as schema.Service['status']));
    if (opts.category) conditions.push(eq(schema.services.category, opts.category as schema.Service['category']));

    const where = conditions.length ? and(...conditions) : undefined;
    const offset = (opts.page - 1) * opts.limit;

    const sortableColumns = {
      name: schema.services.name,
      category: schema.services.category,
      company: schema.services.company,
      status: schema.services.status,
      duration: schema.services.duration,
    };
    type SortKey = keyof typeof sortableColumns;
    const sortKey: SortKey = (opts.sortBy && opts.sortBy in sortableColumns)
      ? (opts.sortBy as SortKey)
      : 'name';
    const orderExpr = opts.sortOrder === SortOrder.desc ? desc(sortableColumns[sortKey]) : asc(sortableColumns[sortKey]);

    const [items, [countRow]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(schema.services)
        .where(where)
        .orderBy(orderExpr)
        .limit(opts.limit)
        .offset(offset),
      this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.services)
        .where(where),
    ]);

    return { items, total: countRow?.count ?? 0 };
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
