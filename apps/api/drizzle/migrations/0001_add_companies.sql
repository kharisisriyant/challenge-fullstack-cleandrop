CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
INSERT INTO "companies" ("id", "name")
SELECT gen_random_uuid()::text, c FROM (SELECT DISTINCT "company" AS c FROM "services") s;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "company_id" text;--> statement-breakpoint
UPDATE "services" SET "company_id" = c."id" FROM "companies" c WHERE c."name" = "services"."company";--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "company_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "company";
