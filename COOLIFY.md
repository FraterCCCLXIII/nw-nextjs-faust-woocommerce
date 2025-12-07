# Coolify Deployment Guide

This project is configured for deployment on Coolify.

## Prerequisites

- A Coolify instance running
- Access to your WordPress/WooCommerce GraphQL endpoint
- Algolia account (if using search functionality)

## Environment Variables

Set the following environment variables in Coolify:

### Required

- `NEXT_PUBLIC_GRAPHQL_URL` - Your WooCommerce GraphQL endpoint URL (e.g., `https://your-wordpress-site.com/graphql`)

### Algolia Search (Required if using search)

- `NEXT_PUBLIC_ALGOLIA_APP_ID` - Your Algolia Application ID
- `NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY` - Your Algolia Public API Key
- `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` - Your Algolia Index Name

### Optional

- `NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL` - Placeholder image URL for small product images (default: `https://via.placeholder.com/300`)
- `NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL` - Placeholder image URL for large product images (default: `https://via.placeholder.com/800`)

## Deployment Steps

1. **Connect your repository** to Coolify
2. **Set environment variables** in Coolify's environment variable section
3. **Configure build settings**:
   - Build Command: `npm run build` (default)
   - Start Command: Automatically detected from Dockerfile
   - Port: `3000` (default)
4. **Deploy** - Coolify will automatically build and deploy using the Dockerfile

## Docker Configuration

The project includes:
- **Dockerfile**: Multi-stage build optimized for production
- **.dockerignore**: Excludes unnecessary files from Docker build context

## Build Process

The Dockerfile uses a multi-stage build:
1. **Dependencies stage**: Installs npm dependencies
2. **Builder stage**: Builds the Next.js application
3. **Runner stage**: Creates a minimal production image with only necessary files

## Notes

- The application runs on port 3000 by default
- The Dockerfile uses Node.js 20 Alpine for a smaller image size
- The application runs as a non-root user for security
- Standalone output mode is enabled in `next.config.js` for optimal Docker deployment

## Troubleshooting

### Build fails
- Check that all environment variables are set correctly
- Verify that your GraphQL endpoint is accessible
- Check Coolify build logs for specific errors

### Application won't start
- Verify port 3000 is exposed and accessible
- Check environment variables are properly set
- Review application logs in Coolify

### Images not loading
- Ensure your WordPress site allows image access from your Next.js domain
- Check `next.config.js` remote patterns include your image domains
- Verify CORS settings on your WordPress site

