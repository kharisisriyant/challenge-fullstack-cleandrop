import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../drizzle/schema';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private sql: ReturnType<typeof postgres>;
  readonly db: PostgresJsDatabase<typeof schema>;

  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is required');
    this.sql = postgres(url);
    this.db = drizzle(this.sql, { schema });
  }

  async onModuleDestroy() {
    await this.sql.end();
  }
}
