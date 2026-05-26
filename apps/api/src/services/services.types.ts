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
  @IsString()
  id!: string;

  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  description!: string;

  @Field(() => ServiceCategory)
  @IsString()
  category!: ServiceCategory;

  @Field()
  @IsString()
  company!: string;

  @Field(() => ServiceStatus)
  @IsString()
  status!: ServiceStatus;

  @Field(() => Int)
  @IsNumber()
  duration!: number;

  @Field(() => Int)
  @IsNumber()
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
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ServiceCategory)
  @IsString()
  category!: ServiceCategory;

  @Field()
  @IsString()
  company!: string;

  @Field(() => ServiceStatus, { nullable: true })
  @IsString()
  @IsOptional()
  status?: ServiceStatus;

  @Field(() => Int)
  @IsNumber()
  duration!: number;

  @Field(() => Int)
  @IsNumber()
  basePrice!: number;
}

@InputType()
export class UpdateServiceInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ServiceCategory, { nullable: true })
  @IsString()
  @IsOptional()
  category?: ServiceCategory;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  company?: string;

  @Field(() => ServiceStatus, { nullable: true })
  @IsString()
  @IsOptional()
  status?: ServiceStatus;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  basePrice?: number;
}
