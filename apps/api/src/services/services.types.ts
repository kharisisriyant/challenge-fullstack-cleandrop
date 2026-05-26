import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql';

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
