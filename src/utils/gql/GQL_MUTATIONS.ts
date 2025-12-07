import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
  ) {
    registerCustomer(
      input: {
        username: $username
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      customer {
        id
        email
        firstName
        lastName
        username
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    loginWithCookies(input: { login: $username, password: $password }) {
      status
      clientMutationId
    }
  }
`;

export const REFRESH_AUTH_TOKEN = gql`
  mutation RefreshAuthToken($refreshToken: String!) {
    refreshJwtAuthToken(input: { jwtRefreshToken: $refreshToken }) {
      authToken
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation ($input: AddToCartInput!) {
    addToCart(input: $input) {
      cartItem {
        key
        product {
          node {
            id
            databaseId
            name
            description
            type
            onSale
            slug
            averageRating
            reviewCount
            image {
              id
              sourceUrl
              altText
            }
            galleryImages {
              nodes {
                id
                sourceUrl
                altText
              }
            }
          }
        }
        variation {
          node {
            id
            databaseId
            name
            description
            type
            onSale
            price
            regularPrice
            salePrice
            image {
              id
              sourceUrl
              altText
            }
            attributes {
              nodes {
                id
                attributeId
                name
                value
              }
            }
          }
        }
        quantity
        total
        subtotal
        subtotalTax
      }
    }
  }
`;

export const CHECKOUT_MUTATION = gql`
  mutation CHECKOUT_MUTATION($input: CheckoutInput!) {
    checkout(input: $input) {
      result
      redirect
      order {
        id
        databaseId
        orderNumber
        orderKey
        status
        date
        total
        subtotal
        totalTax
        shippingTotal
        paymentMethod
        paymentMethodTitle
        currency
        billing {
          firstName
          lastName
          address1
          address2
          city
          state
          postcode
          country
          email
          phone
          company
        }
        shipping {
          firstName
          lastName
          address1
          address2
          city
          state
          postcode
          country
        }
        lineItems {
          nodes {
            id
            productId
            quantity
            subtotal
            total
            product {
              node {
                id
                name
                image {
                  sourceUrl
                  altText
                }
              }
            }
            variation {
              node {
                id
                name
                image {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;
export const UPDATE_CART = gql`
  mutation ($input: UpdateItemQuantitiesInput!) {
    updateItemQuantities(input: $input) {
      items {
        key
        product {
          node {
            id
            databaseId
            name
            description
            type
            onSale
            slug
            averageRating
            reviewCount
            image {
              id
              sourceUrl
              altText
            }
            galleryImages {
              nodes {
                id
                sourceUrl
                altText
              }
            }
          }
        }

        variation {
          node {
            id
            databaseId
            name
            description
            type
            onSale
            price
            regularPrice
            salePrice
            image {
              id
              sourceUrl
              altText
            }
            attributes {
              nodes {
                id
                attributeId
                name
                value
              }
            }
          }
        }
        quantity
        total
        subtotal
        subtotalTax
      }
      removed {
        key
        product {
          node {
            id
            databaseId
          }
        }
        variation {
          node {
            id
            databaseId
          }
        }
      }
      updated {
        key
        product {
          node {
            id
            databaseId
          }
        }

        variation {
          node {
            id
            databaseId
          }
        }
      }
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation Logout {
    logout {
      status
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        id
        email
        firstName
        lastName
        username
        billing {
          firstName
          lastName
          address1
          address2
          city
          postcode
          country
          email
          phone
        }
        shipping {
          firstName
          lastName
          address1
          address2
          city
          postcode
          country
        }
      }
    }
  }
`;
