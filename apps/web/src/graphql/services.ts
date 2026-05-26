import { gql } from '@apollo/client';

export const GET_SERVICES = gql`
  query GetServices($search: String, $status: String, $category: String, $page: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
    services(search: $search, status: $status, category: $category, page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
      items {
        id
        name
        description
        category
        company
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

export const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      name
      description
      category
      company
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
      company
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
