import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../drizzle/schema';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private sql: ReturnType<typeof postgres>;
  readonly db: PostgresJsDatabase<typeof schema>;

  constructor(private config: ConfigService) {
    const url = this.config.getOrThrow<string>('DATABASE_URL');
    this.sql = postgres(url);
    this.db = drizzle(this.sql, { schema });
  }

  async onModuleDestroy() {
    await this.sql.end();
  }
}
