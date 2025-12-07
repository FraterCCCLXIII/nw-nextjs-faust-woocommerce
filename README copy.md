[![Lighthouse CI](https://img.shields.io/github/actions/workflow/status/w3bdesign/nextjs-woocommerce/lighthouse.yml?branch=master&label=Lighthouse%20CI&logo=lighthouse&logoColor=white)](https://github.com/w3bdesign/nextjs-woocommerce/actions/workflows/lighthouse.yml)
[![Playwright Tests](https://img.shields.io/github/actions/workflow/status/w3bdesign/nextjs-woocommerce/playwright.yml?branch=master&label=Playwright%20Tests&logo=playwright&logoColor=white)](https://github.com/w3bdesign/nextjs-woocommerce/actions/workflows/playwright.yml)
[![Codacy Badge](https://img.shields.io/codacy/grade/29de6847b01142e6a0183988fc3df46a?logo=codacy&logoColor=white)](https://app.codacy.com/gh/w3bdesign/nextjs-woocommerce?utm_source=github.com&utm_medium=referral&utm_content=w3bdesign/nextjs-woocommerce&utm_campaign=Badge_Grade_Settings)
[![CodeFactor](https://img.shields.io/codefactor/grade/github/w3bdesign/nextjs-woocommerce?logo=codefactor&logoColor=white)](https://www.codefactor.io/repository/github/w3bdesign/nextjs-woocommerce)
[![Quality Gate Status](https://img.shields.io/sonar/alert_status/w3bdesign_nextjs-woocommerce?server=https%3A%2F%2Fsonarcloud.io&logo=sonarcloud&logoColor=white)](https://sonarcloud.io/dashboard?id=w3bdesign_nextjs-woocommerce)

![bilde](https://github.com/user-attachments/assets/08047025-0950-472a-ae7d-932c7faee1db)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=w3bdesign/nextjs-woocommerce&type=Date)](https://star-history.com/#w3bdesign/nextjs-woocommerce&Date)

# Next.js Ecommerce site with WooCommerce backend

## Live URL: <https://next-woocommerce.dfweb.no>

## Table Of Contents (TOC)

- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [WordPress Plugin Setup](#step-1-wordpress-plugin-setup)
  - [WordPress CORS Configuration](#step-2-wordpress-cors-configuration)
  - [Next.js Project Setup](#step-3-nextjs-project-setup)
  - [WordPress WooCommerce Setup](#step-4-wordpress-woocommerce-setup)
  - [Custom Fields Setup](#step-5-custom-fields-setup-optional)
  - [Image Configuration](#step-6-image-configuration)
  - [Testing](#step-7-testing)
- [Coolify Deployment](#coolify-deployment)
- [Custom Fields Setup](#custom-fields-setup)
- [Features](#features)
- [Lighthouse Performance Monitoring](#lighthouse-performance-monitoring)
- [Troubleshooting](#troubleshooting)
- [Issues](#issues)
- [TODO](#todo)
- [Future Improvements](SUGGESTIONS.md)

## Installation

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- WordPress site with WooCommerce installed
- Access to WordPress admin panel

### Step 1: WordPress Plugin Setup

Install and activate the following required plugins in your WordPress site:

**Required Plugins:**
- [WooCommerce](https://wordpress.org/plugins/woocommerce) - Ecommerce for WordPress
- [WP GraphQL](https://wordpress.org/plugins/wp-graphql) - Exposes GraphQL API for WordPress
- [WP GraphQL WooCommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) - Adds WooCommerce functionality to WPGraphQL schema
- [WP GraphQL CORS](https://wordpress.org/plugins/wp-graphql-cors/) - Enables CORS for GraphQL requests

**Optional Plugins:**
- [Advanced Custom Fields (ACF)](https://www.advancedcustomfields.com/) - For product custom fields (see [Custom Fields Setup](#custom-fields-setup))
- [WPGraphQL for Advanced Custom Fields](https://wordpress.org/plugins/wp-graphql-acf/) - Exposes ACF fields to GraphQL (required if using ACF)
- [wp-algolia-woo-indexer](https://github.com/w3bdesign/wp-algolia-woo-indexer) - Required for Algolia search functionality
- [headless-wordpress](https://github.com/w3bdesign/headless-wp) - Disables WordPress frontend (optional)

**Tested Versions:**
- WordPress: 6.8.1+
- WooCommerce: 9.9.5+
- WP GraphQL: 2.3.3+
- WP GraphQL WooCommerce: 0.19.0+
- WP GraphQL CORS: 2.1+

### Step 2: WordPress CORS Configuration

**Critical:** This must be configured correctly or the Next.js app won't be able to communicate with WordPress.

1. Go to **WordPress Admin** → **Settings** → **WPGraphQL CORS**
2. In the **Access-Control-Allow-Origin** field, add your Next.js domain:
   - For local development: `http://localhost:3000`
   - For production: `https://your-nextjs-domain.com`
   - Example: `https://try.moleculepeptides.com`
3. Enable **"Send site credentials"** checkbox
4. Enable **"Add Site Address to Access-Control-Allow-Origin header"** checkbox
5. Save settings

**Important:** The server must return a specific origin (not `*`) when using `credentials: 'include'`. The CORS plugin handles this automatically when you add your domain to the allowed origins list.

### Step 3: Next.js Project Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd wordpress-coolify/nextjs-woocommerce
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: `--legacy-peer-deps` is required due to React 19 compatibility

3. **Configure environment variables:**
   
   Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set the following variables:
   ```env
   # Required: Your WordPress GraphQL endpoint
   NEXT_PUBLIC_GRAPHQL_URL=https://your-wordpress-site.com/graphql
   
   # Optional: Algolia Search (only if using search)
   # If not configured, search components will be hidden automatically
   NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
   NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY=your_algolia_public_key
   NEXT_PUBLIC_ALGOLIA_INDEX_NAME=your_index_name
   
   # Optional: Stripe WooCommerce Gateway ID
   # Default: 'stripe' (matches webhook URL format wc-api=wc_stripe)
   # Other common values: 'stripe_cc', 'woocommerce_gateway_stripe'
   # Check your WooCommerce → Settings → Payments → Stripe to find the exact ID
   # If your webhook URL shows wc-api=wc_stripe, use 'stripe'
   NEXT_PUBLIC_STRIPE_GATEWAY_ID=stripe
   
   # Optional: Placeholder images
   NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL=https://via.placeholder.com/300
   NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL=https://via.placeholder.com/800
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Step 4: WordPress WooCommerce Setup

1. **Create products:**
   - Go to **Products** → **Add New**
   - Add at least one product with:
     - Product name
     - Price
     - Product image (recommended)
     - Description
     - Publish the product

2. **Enable payment method:**
   - Go to **WooCommerce** → **Settings** → **Payments**
   - Enable **Cash on Delivery (COD)** payment method
   - Configure as needed

3. **Verify GraphQL endpoint:**
   - Visit `https://your-wordpress-site.com/graphql` in your browser
   - You should see a GraphQL playground or API response
   - If you see an error, verify WP GraphQL plugin is activated

### Step 5: Custom Fields Setup (Optional)

To enable the product detail tabs (Description, COA, Research), you need to set up custom fields in WordPress.

**Quick Setup with ACF:**
1. Install **Advanced Custom Fields** plugin
2. Install **WPGraphQL for Advanced Custom Fields** plugin
3. Create a Field Group named "Product Detail Tabs"
4. Add three fields with these exact names:
   - `description` - Extended description
   - `coa` - Certificate of Analysis
   - `research` - Research information

For detailed instructions, see [WORDPRESS_CUSTOM_FIELDS_SETUP.md](WORDPRESS_CUSTOM_FIELDS_SETUP.md).

### Step 6: Image Configuration

The project is configured to load images from:
- `store.moleculepeptides.com` (already configured)
- Your WordPress media library

If you need to add additional image domains, edit `next.config.js`:
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-image-domain.com',
      pathname: '**',
    },
  ],
}
```

### Step 7: Testing

1. **Test product listing:**
   - Visit `/catalog` or `/products`
   - Products should load from WordPress

2. **Test product page:**
   - Click on a product
   - Verify product details, images, and tabs display correctly

3. **Test cart functionality:**
   - Add a product to cart
   - Verify cart updates
   - Proceed to checkout

4. **Test GraphQL connection:**
   - Open browser DevTools → Network tab
   - Look for requests to `/graphql`
   - Verify no CORS errors

### Development Tools

For debugging and testing, install browser extensions:

- **Apollo Client DevTools:**
  - [Chrome](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm)
  - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/apollo-developer-tools/)

These tools help you:
- Inspect GraphQL queries and responses
- Debug Apollo Client cache
- Monitor network requests

## Coolify Deployment

This project is configured for deployment on [Coolify](https://coolify.io/), a self-hosted alternative to Heroku/Vercel.

### Prerequisites

- A Coolify instance running
- Access to your WordPress/WooCommerce GraphQL endpoint
- Algolia account (optional, only if using search functionality)

### Environment Variables

Set the following environment variables in Coolify:

**Required:**
- `NEXT_PUBLIC_GRAPHQL_URL` - Your WooCommerce GraphQL endpoint URL (e.g., `https://your-wordpress-site.com/graphql`)

**Algolia Search (Required if using search):**
- `NEXT_PUBLIC_ALGOLIA_APP_ID` - Your Algolia Application ID
- `NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY` - Your Algolia Public API Key
- `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` - Your Algolia Index Name

**Optional:**
- `NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL` - Placeholder image URL for small product images (default: `https://via.placeholder.com/300`)
- `NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL` - Placeholder image URL for large product images (default: `https://via.placeholder.com/800`)

### Deployment Steps

1. **Connect your repository** to Coolify
2. **Set build pack to Dockerfile** (not Nixpacks or static site)
3. **Set environment variables** in Coolify's environment variable section
4. **Configure build settings**:
   - Build Command: `npm run build` (default, automatically handled by Dockerfile)
   - Start Command: Automatically detected from Dockerfile
   - Port: `3000` (default)
5. **Deploy** - Coolify will automatically build and deploy using the Dockerfile

### Docker Configuration

The project includes:
- **Dockerfile**: Multi-stage build optimized for production
- **.dockerignore**: Excludes unnecessary files from Docker build context

The Dockerfile uses a multi-stage build:
1. **Dependencies stage**: Installs npm dependencies with `--legacy-peer-deps` to handle React 19 compatibility
2. **Builder stage**: Builds the Next.js application with standalone output
3. **Runner stage**: Creates a minimal production image with only necessary files

### Important Notes

- **Build Pack**: Use **Dockerfile** (not Nixpacks or static site) - this is a Node.js application with server-side rendering
- The application runs on port 3000 by default
- The Dockerfile uses Node.js 20 Alpine for a smaller image size
- The application runs as a non-root user for security
- Standalone output mode is enabled in `next.config.js` for optimal Docker deployment

### Troubleshooting

**Build fails:**
- Check that all required environment variables are set correctly
- Verify that your GraphQL endpoint is accessible from the build environment
- Check Coolify build logs for specific errors

**Application won't start:**
- Verify port 3000 is exposed and accessible
- Check environment variables are properly set
- Review application logs in Coolify

**Images not loading:**
- Ensure your WordPress site allows image access from your Next.js domain
- Check `next.config.js` remote patterns include your image domains
- Verify CORS settings on your WordPress site

For more detailed information, see [COOLIFY.md](COOLIFY.md).

## Custom Fields Setup

The product detail tabs (Description, COA, Research) require custom fields to be set up in WordPress.

**Quick Start:**
1. Install **Advanced Custom Fields (ACF)** plugin
2. Install **WPGraphQL for Advanced Custom Fields** plugin
3. Create a Field Group with three fields:
   - `description` - Extended description
   - `coa` - Certificate of Analysis
   - `research` - Research information

**For detailed step-by-step instructions, see [WORDPRESS_CUSTOM_FIELDS_SETUP.md](WORDPRESS_CUSTOM_FIELDS_SETUP.md).**

## Features

- Next.js version 15.1.7
- React version 18.3.1
- Typescript
- Tests with Playwright
- Connect to Woocommerce GraphQL API and list name, price and display image for products
- Support for simple products and variable products
- Cart handling and checkout with WooCommerce using Zustand for state management
  - Persistent cart state with localStorage sync
  - Efficient updates through selective subscriptions
  - Type-safe cart operations
  - Cash On Delivery payment method
- Algolia search (requires [algolia-woo-indexer](https://github.com/w3bdesign/algolia-woo-indexer))
- Meets WCAG accessibility standards where possible
- Placeholder for products without images
- State Management:
  - Zustand for global state management
  - Apollo Client with GraphQL
- React Hook Form
- Native HTML5 form validation
- Animations with Framer motion, Styled components and Animate.css
- Loading spinner created with Styled Components
- Shows page load progress with Nprogress during navigation
- Fully responsive design
- Category and product listings
- Show stock status
- Pretty URLs with builtin Nextjs functionality
- Tailwind 3 for styling
- JSDoc comments
- Automated Lighthouse performance monitoring
  - Continuous performance, accessibility, and best practices checks
  - Automated reports on every pull request
  - Performance metrics tracking for:
    - Performance score
    - Accessibility compliance
    - Best practices adherence
    - SEO optimization
    - Progressive Web App readiness
- Product filtering:
  - Dynamic color filtering using Tailwind's color system
  - Mobile-optimized filter layout
  - Accessible form controls with ARIA labels
  - Price range slider
  - Size and color filters
  - Product type categorization
  - Sorting options (popularity, price, newest)

## Lighthouse Performance Monitoring

This project uses automated Lighthouse testing through GitHub Actions to ensure high-quality web performance. On every pull request:

- Performance, accessibility, best practices, and SEO are automatically evaluated
- Results are posted directly to the pull request
- Minimum score thresholds are enforced for:
  - Performance: Analyzing loading performance, interactivity, and visual stability
  - Accessibility: Ensuring WCAG compliance and inclusive design
  - Best Practices: Validating modern web development standards
  - SEO: Checking search engine optimization fundamentals
  - PWA: Assessing Progressive Web App capabilities

View the latest Lighthouse results in the GitHub Actions tab under the "Lighthouse Check" workflow.

## Troubleshooting

### CORS Errors

**Error:** `Access to fetch at 'https://your-site.com/graphql' from origin 'https://your-nextjs.com' has been blocked by CORS policy`

**Solution:**
1. Go to WordPress Admin → Settings → WPGraphQL CORS
2. Add your Next.js domain to the "Access-Control-Allow-Origin" field
3. Enable "Send site credentials"
4. Save settings
5. Clear any caching plugins

### GraphQL Connection Errors

**Error:** `Failed to fetch` or `Network error`

**Solutions:**
1. Verify `NEXT_PUBLIC_GRAPHQL_URL` is set correctly in `.env.local`
2. Check that WP GraphQL plugin is activated
3. Test the GraphQL endpoint directly: `https://your-site.com/graphql`
4. Verify CORS is configured (see above)
5. Check WordPress site is accessible and not behind a firewall

### Products Not Displaying

**Possible causes:**
1. **No products in WooCommerce:**
   - Create at least one published product
   - Ensure product has a price set

2. **GraphQL query errors:**
   - Check browser console for errors
   - Verify WP GraphQL WooCommerce plugin is active
   - Test GraphQL endpoint in browser

3. **Products with null prices:**
   - Products without prices are automatically filtered out
   - Set a price for all products

### Images Not Loading

**Error:** `Failed to load resource: the server responded with a status of 400`

**Solutions:**
1. Verify image domain is in `next.config.js` `remotePatterns`
2. Check that images exist in WordPress media library
3. Ensure WordPress allows external image access
4. Verify image URLs are accessible

### Add to Cart Not Working

**Possible causes:**
1. **CORS error:** See CORS Errors section above
2. **GraphQL mutation error:** Check browser console
3. **Product not purchasable:** Verify product stock status in WooCommerce
4. **Missing variation selection:** For variable products, ensure a variation is selected

### TypeScript Errors During Build

**Error:** `Type error: ...`

**Solutions:**
1. Run type checking locally: `npx tsc --noEmit`
2. Fix any TypeScript errors before deploying
3. Ensure all dependencies are installed: `npm install --legacy-peer-deps`

### Build Fails in Coolify/Docker

**Error:** `npm run build` fails

**Solutions:**
1. Check build logs for specific errors
2. Verify all environment variables are set
3. Ensure `package.json` has all required dependencies
4. Check that Node.js version matches (20.x)

### Product Detail Tabs Show "No content available"

**Solution:**
1. Set up custom fields in WordPress (see [Custom Fields Setup](#custom-fields-setup))
2. Add content to the `description`, `coa`, and `research` fields
3. Verify fields are exposed to GraphQL (if using ACF, install WPGraphQL for ACF plugin)
4. Check GraphQL query includes `metaData` field

### Catalog Page Shows "No products found"

**Solutions:**
1. Verify products exist in WooCommerce
2. Check products are published (not draft)
3. Ensure products have prices set
4. Verify GraphQL endpoint is accessible
5. Check browser console for errors

### Algolia Search Errors (changeme-dsn.algolia.net)

**Error:** `Failed to load resource: net::ERR_NAME_NOT_RESOLVED` for `changeme-dsn.algolia.net`

**Solutions:**
1. **If you're not using Algolia search:** The search components will automatically hide when Algolia credentials are not configured. No action needed.
2. **If you want to use Algolia search:**
   - Set up an Algolia account at https://www.algolia.com/
   - Configure the following environment variables:
     - `NEXT_PUBLIC_ALGOLIA_APP_ID` - Your Algolia Application ID
     - `NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY` - Your Algolia Public API Key
     - `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` - Your Algolia Index Name
   - Ensure values are not "changeme" or "changethis" (these are placeholders)
   - Install and configure the [wp-algolia-woo-indexer](https://github.com/w3bdesign/wp-algolia-woo-indexer) WordPress plugin to sync products to Algolia

### Invalid Payment Method Error

**Error:** `ApolloError: Invalid payment method` during checkout

**Solutions:**
1. **Check the Stripe gateway ID in WordPress:**
   - Go to **WooCommerce → Settings → Payments → Stripe**
   - Note the exact gateway ID (most common: `stripe` - matches webhook URL `wc-api=wc_stripe`)
   - Other possible values: `stripe_cc`, `woocommerce_gateway_stripe`
2. **Set the environment variable (if different from default):**
   - The default is `stripe` which matches the webhook URL format `wc-api=wc_stripe`
   - If your gateway ID is different, add `NEXT_PUBLIC_STRIPE_GATEWAY_ID=your_gateway_id` to your `.env.local` file
   - Replace `your_gateway_id` with the actual ID from step 1
3. **Verify webhook URL matches:**
   - If your webhook URL shows `wc-api=wc_stripe`, use `stripe` as the gateway ID
   - This is the most common configuration
3. **Verify Stripe plugin is active:**
   - Ensure WooCommerce Stripe plugin is installed and activated
   - Check that Stripe payment method is enabled in WooCommerce settings
4. **Restart your development server** after changing environment variables

### I am getting a cart undefined error or other GraphQL errors

**Solution:**
- Check that you are using version 0.19.0+ of the [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) plugin
- Verify WP GraphQL CORS plugin is configured correctly
- Check that cart mutations are enabled in WooCommerce settings

### The products page isn't loading

**Solution:**
- Check the attributes of the products. The application works with products that have or don't have Size and Color attributes
- Verify products are published and have prices
- Check browser console for specific errors

## Issues

Overall the application is working as intended, but it has not been tested extensively in a production environment.
More testing and debugging is required before deploying it in a production environment.

With that said, keep the following in mind:

- Currently only simple products and variable products work without any issues. Other product types are not known to work.
- Only Cash On Delivery (COD) is currently supported. More payment methods may be added later.

This project is tested with BrowserStack.

## TODO

- Implement UserRegistration.component.tsx in a registration page
- Add user dashboard with order history
- Add Cloudflare Turnstile on registration page
- Ensure email is real on registration page
- Add total to cart/checkout page
- Copy billing address to shipping address
- Hide products not in stock
