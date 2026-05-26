import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyType } from '../services/services.types';
import { CreateCompanyInput } from './companies.types';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => CompanyType)
@UseGuards(GqlAuthGuard, RolesGuard)
export class CompaniesResolver {
  constructor(private readonly companiesService: CompaniesService) {}

  @Query(() => [CompanyType])
  async companies(): Promise<CompanyType[]> {
    return this.companiesService.findAll() as Promise<CompanyType[]>;
  }

  @Query(() => CompanyType)
  async company(@Args('id', { type: () => ID }) id: string): Promise<CompanyType> {
    return this.companiesService.findOne(id) as Promise<CompanyType>;
  }

  @Mutation(() => CompanyType)
  @Roles('admin')
  async createCompany(@Args('input') input: CreateCompanyInput): Promise<CompanyType> {
    return this.companiesService.create(input) as Promise<CompanyType>;
  }
}
