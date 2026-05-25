import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import {
  ServiceType,
  PaginatedServices,
  CreateServiceInput,
  UpdateServiceInput,
} from './services.types';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => ServiceType)
@UseGuards(GqlAuthGuard, RolesGuard)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @Query(() => PaginatedServices)
  async services(
    @Args('search', { nullable: true }) search?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('category', { nullable: true }) category?: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page = 1,
    @Args('limit', { type: () => Int, defaultValue: 6 }) limit = 6,
  ): Promise<PaginatedServices> {
    const result = await this.servicesService.findAll({ search, status, category, page, limit });
    return { items: result.items as unknown as ServiceType[], total: result.total };
  }

  @Query(() => ServiceType)
  async service(@Args('id', { type: () => ID }) id: string): Promise<ServiceType> {
    return this.servicesService.findOne(id) as Promise<ServiceType>;
  }

  @Mutation(() => ServiceType)
  @Roles('admin')
  async createService(@Args('input') input: CreateServiceInput): Promise<ServiceType> {
    return this.servicesService.create(input) as Promise<ServiceType>;
  }

  @Mutation(() => ServiceType)
  @Roles('admin')
  async updateService(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateServiceInput,
  ): Promise<ServiceType> {
    return this.servicesService.update(id, input) as Promise<ServiceType>;
  }

  @Mutation(() => Boolean)
  @Roles('admin')
  async deleteService(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.servicesService.remove(id);
  }
}
