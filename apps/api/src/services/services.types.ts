import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum ServiceStatus {
  active = 'active',
  draft = 'draft',
  inactive = 'inactive',
}

export enum ServiceCategory {
  Residential = 'Residential',
  Commercial = 'Commercial',
  Specialty = 'Specialty',
  Industrial = 'Industrial',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

registerEnumType(ServiceStatus, { name: 'ServiceStatus' });
registerEnumType(ServiceCategory, { name: 'ServiceCategory' });
registerEnumType(SortOrder, { name: 'SortOrder' });

@InputType()
export class ServiceFiltersInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;
}

@InputType()
export class ServicePaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 6 })
  @IsNumber()
  @IsOptional()
  limit?: number;
}

@InputType()
export class ServiceSortInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @Field(() => SortOrder, { nullable: true })
  @IsString()
  @IsOptional()
  sortOrder?: SortOrder;
}

@ObjectType()
export class ServiceType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => ServiceCategory)
  category!: ServiceCategory;

  @Field()
  company!: string;

  @Field(() => ServiceStatus)
  status!: ServiceStatus;

  @Field(() => Int)
  duration!: number;

  @Field(() => Int)
  basePrice!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class PaginatedServices {
  @Field(() => [ServiceType])
  items!: ServiceType[];

  @Field(() => Int)
  total!: number;
}

@ObjectType()
export class ServiceStatsType {
  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  active!: number;

  @Field(() => Int)
  drafts!: number;

  @Field(() => Int)
  avgBasePrice!: number;
}

@InputType()
export class CreateServiceInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ServiceCategory)
  category!: ServiceCategory;

  @Field()
  company!: string;

  @Field(() => ServiceStatus, { nullable: true })
  status?: ServiceStatus;

  @Field(() => Int)
  duration!: number;

  @Field(() => Int)
  basePrice!: number;
}

@InputType()
export class UpdateServiceInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ServiceCategory, { nullable: true })
  category?: ServiceCategory;

  @Field({ nullable: true })
  company?: string;

  @Field(() => ServiceStatus, { nullable: true })
  status?: ServiceStatus;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => Int, { nullable: true })
  basePrice?: number;
}
