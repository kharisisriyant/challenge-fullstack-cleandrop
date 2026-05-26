import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../../drizzle/schema';
import { CreateCompanyInput } from './companies.types';

@Injectable()
export class CompaniesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll() {
    return this.drizzle.db.select().from(schema.companies).orderBy(asc(schema.companies.name));
  }

  async findOne(id: string) {
    const [c] = await this.drizzle.db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, id))
      .limit(1);
    if (!c) throw new NotFoundException(`Company ${id} not found`);
    return c;
  }

  async create(input: CreateCompanyInput) {
    const name = input.name.trim();
    if (!name) throw new ConflictException('Company name required');
    const [existing] = await this.drizzle.db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.name, name))
      .limit(1);
    if (existing) throw new ConflictException(`Company '${name}' already exists`);
    const [created] = await this.drizzle.db
      .insert(schema.companies)
      .values({ name })
      .returning();
    return created;
  }
}
