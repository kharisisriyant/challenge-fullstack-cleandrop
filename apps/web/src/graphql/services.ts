import { gql } from '@apollo/client';

export const GET_SERVICES = gql`
  query GetServices($filters: ServiceFiltersInput, $pagination: ServicePaginationInput, $sort: ServiceSortInput) {
    services(filters: $filters, pagination: $pagination, sort: $sort) {
      items {
        id
        name
        description
        category
        companyId
        company {
          id
          name
        }
        status
        duration
        basePrice
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const GET_SERVICE_STATS = gql`
  query GetServiceStats($filters: ServiceFiltersInput) {
    serviceStats(filters: $filters) {
      total
      active
      drafts
      avgBasePrice
    }
  }
`;

export const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      name
      description
      category
      companyId
      company {
        id
        name
      }
      status
      duration
      basePrice
    }
  }
`;

export const UPDATE_SERVICE = gql`
  mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      name
      description
      category
      companyId
      company {
        id
        name
      }
      status
      duration
      basePrice
    }
  }
`;

export const DELETE_SERVICE = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id)
  }
`;
