import { gql } from '@apollo/client';
import blocks from '@/wp-blocks';

export const GET_SINGLE_PRODUCT = gql`
  query Product($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      averageRating
      slug
      description
      onSale
      image {
        id
        uri
        title
        srcSet
        sourceUrl
      }
      name
      metaData(keysIn: ["description", "reviews"]) {
        key
        value
      }
      ... on SimpleProduct {
        salePrice
        regularPrice
        price
        id
        stockQuantity
      }
      ... on VariableProduct {
        salePrice
        regularPrice
        price
        id
        variations {
          nodes {
            id
            databaseId
            name
            stockStatus
            stockQuantity
            purchasable
            onSale
            price
            salePrice
            regularPrice
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
      }
      ... on ExternalProduct {
        price
        id
        externalUrl
      }
      ... on GroupProduct {
        products {
          nodes {
            ... on SimpleProduct {
              id
              price
            }
          }
        }
        id
      }
    }
  }
`;

/**
 * Fetch first 4 products from a specific category
 */

export const FETCH_FIRST_PRODUCTS_FROM_HOODIES_QUERY = `
 query MyQuery {
  products(first: 4, where: {category: "Hoodies"}) {
    nodes {
      productId
      name
      onSale
      slug
      image {
        sourceUrl
      }
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
      }
      ... on VariableProduct {
        price
        regularPrice
        salePrice
      }
    }
  }
}
 `;

/**
 * Fetch first 200 Woocommerce products from GraphQL
 */
export const FETCH_ALL_PRODUCTS_QUERY = gql`
  query MyQuery {
    products(first: 50) {
      nodes {
        databaseId
        name
        onSale
        slug
        image {
          sourceUrl
        }
        ... on SimpleProduct {
          databaseId
          price
          regularPrice
          salePrice
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
        ... on VariableProduct {
          databaseId
          price
          regularPrice
          salePrice
          productCategories {
            nodes {
              name
              slug
            }
          }
          variations {
            nodes {
              price
              regularPrice
              salePrice
              attributes {
                nodes {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetch first 20 categories from GraphQL
 */
export const FETCH_ALL_CATEGORIES_QUERY = gql`
  query Categories {
    productCategories(first: 20) {
      nodes {
        id
        name
        slug
      }
    }
  }
`;

export const GET_PRODUCTS_FROM_CATEGORY = gql`
  query ProductsFromCategory($id: ID!) {
    productCategory(id: $id) {
      id
      name
      products(first: 50) {
        nodes {
          id
          databaseId
          onSale
          averageRating
          slug
          description
          image {
            id
            uri
            title
            srcSet
            sourceUrl
          }
          name
          ... on SimpleProduct {
            salePrice
            regularPrice
            onSale
            price
            id
          }
          ... on VariableProduct {
            salePrice
            regularPrice
            onSale
            price
            id
          }
          ... on ExternalProduct {
            price
            id
            externalUrl
          }
          ... on GroupProduct {
            products {
              nodes {
                ... on SimpleProduct {
                  id
                  price
                }
              }
            }
            id
          }
        }
      }
    }
  }
`;

export const GET_CART = gql`
  query GET_CART {
    cart {
      contents {
        nodes {
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
                srcSet
                altText
                title
              }
              galleryImages {
                nodes {
                  id
                  sourceUrl
                  srcSet
                  altText
                  title
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
                srcSet
                altText
                title
              }
              attributes {
                nodes {
                  id
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

      subtotal
      subtotalTax
      shippingTax
      shippingTotal
      total
      totalTax
      feeTax
      feeTotal
      discountTax
      discountTotal
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GET_CURRENT_USER {
    customer {
      id
      firstName
      lastName
      email
      username
      billing {
        firstName
        lastName
        address1
        address2
        city
        postcode
        country
        state
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
        state
      }
    }
  }
`;

export const GET_CUSTOMER_ORDERS = gql`
  query GET_CUSTOMER_ORDERS {
    customer {
      orders {
        nodes {
          id
          orderNumber
          status
          total
          date
        }
      }
    }
  }
`;

/**
 * Fetch all blog posts for research page
 */
export const GET_ALL_POSTS = gql`
  query GetAllPosts {
    posts(first: 50, where: { status: PUBLISH }) {
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        date
        author {
          node {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

/**
 * Fetch a single post by slug
 */
export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      content
      excerpt
      date
      author {
        node {
          name
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
      editorBlocks(flat: false) {
        __typename
        name
        renderedHtml
        clientId
        parentClientId
        ... on CoreParagraph {
          attributes {
            content
            className
          }
        }
        ... on CoreHeading {
          attributes {
            content
            level
            className
          }
        }
        ... on CoreImage {
          attributes {
            url
            alt
            caption
            width
            height
            className
          }
        }
        ... on CoreGallery {
          attributes {
            images {
              url
              alt
              id
            }
            columns
            className
          }
        }
        ... on CoreQuote {
          attributes {
            value
            citation
            className
          }
        }
        ... on CoreCode {
          attributes {
            content
            className
          }
        }
        ... on CoreButton {
          attributes {
            text
            url
            className
          }
        }
        ... on CoreColumns {
          attributes {
            className
          }
        }
        ... on CoreColumn {
          attributes {
            width
            className
          }
        }
      }
    }
  }
`;

/**
 * Get all post slugs for static paths
 */
export const GET_ALL_POST_SLUGS = gql`
  query GetAllPostSlugs {
    posts(first: 100, where: { status: PUBLISH }) {
      nodes {
        slug
      }
    }
  }
`;

/**
 * Get all pages for navigation
 */
export const GET_PAGES = gql`
  query GetPages {
    pages(first: 50, where: { status: PUBLISH }) {
      nodes {
        id
        title
        slug
        uri
      }
    }
  }
`;

/**
 * Get a single page by slug
 * Note: WordPress pages don't support idType: SLUG, so we query by URI
 */
export const GET_PAGE_BY_SLUG = gql`
  ${blocks.CoreParagraph.fragments.entry}
  ${blocks.CoreHeading.fragments.entry}
  ${blocks.CoreImage.fragments.entry}
  ${blocks.CoreQuote.fragments.entry}
  ${blocks.CoreCode.fragments.entry}
  ${blocks.CoreButton.fragments.entry}
  ${blocks.CoreButtons.fragments.entry}
  ${blocks.CoreColumns.fragments.entry}
  ${blocks.CoreColumn.fragments.entry}
  ${blocks.CoreList.fragments.entry}
  ${blocks.CoreSeparator.fragments.entry}
  query GetPageBySlug($uri: String!) {
    pageBy(uri: $uri) {
      id
      databaseId
      title
      slug
      content
      date
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      editorBlocks(flat: false) {
        __typename
        name
        renderedHtml
        id: clientId
        parentId: parentClientId
        ...${blocks.CoreParagraph.fragments.key}
        ...${blocks.CoreHeading.fragments.key}
        ...${blocks.CoreImage.fragments.key}
        ...${blocks.CoreQuote.fragments.key}
        ...${blocks.CoreCode.fragments.key}
        ...${blocks.CoreButton.fragments.key}
        ...${blocks.CoreButtons.fragments.key}
        ...${blocks.CoreColumns.fragments.key}
        ...${blocks.CoreColumn.fragments.key}
        ...${blocks.CoreList.fragments.key}
        ...${blocks.CoreSeparator.fragments.key}
      }
    }
  }
`;

/**
 * Get all page slugs for static paths
 */
export const GET_ALL_PAGE_SLUGS = gql`
  query GetAllPageSlugs {
    pages(first: 100, where: { status: PUBLISH }) {
      nodes {
        slug
      }
    }
  }
`;

export const GET_AVAILABLE_PAYMENT_GATEWAYS = gql`
  query GetAvailablePaymentGateways {
    paymentGateways {
      nodes {
        id
        title
        description
      }
    }
  }
`;

export const GET_STRIPE_PAYMENT_INTENT = gql`
  query GetStripePaymentIntent($stripePaymentMethod: StripePaymentMethodEnum!) {
    stripePaymentIntent(stripePaymentMethod: $stripePaymentMethod) {
      amount
      clientSecret
      error
      id
      currency
    }
  }
`;
