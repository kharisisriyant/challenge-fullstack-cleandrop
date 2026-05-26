import { gql } from '@apollo/client';

export const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
    }
  }
`;

export const CREATE_COMPANY = gql`
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      id
      name
    }
  }
`;
