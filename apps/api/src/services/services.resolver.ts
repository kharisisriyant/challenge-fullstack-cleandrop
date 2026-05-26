import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import {
  ServiceType,
  PaginatedServices,
  ServiceStatsType,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceFiltersInput,
  ServicePaginationInput,
  ServiceSortInput,
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
    @Args('filters', { type: () => ServiceFiltersInput, nullable: true }) filters?: ServiceFiltersInput,
    @Args('pagination', { type: () => ServicePaginationInput, nullable: true }) pagination?: ServicePaginationInput,
    @Args('sort', { type: () => ServiceSortInput, nullable: true }) sort?: ServiceSortInput,
  ): Promise<PaginatedServices> {
    console.log({filters, pagination, sort})
    const result = await this.servicesService.findAll({ filters, pagination, sort });
    return { items: result.items as unknown as ServiceType[], total: result.total };
  }

  @Query(() => ServiceStatsType)
  async serviceStats(
    @Args('filters', { type: () => ServiceFiltersInput, nullable: true }) filters?: ServiceFiltersInput,
  ): Promise<ServiceStatsType> {
    return this.servicesService.getStats(filters);
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
