# Next.js WooCommerce with Faust.js

A modern headless e-commerce solution built with Next.js, WooCommerce, and Faust.js. This project provides a fully functional online store with authentication, cart management, checkout, and payment processing.

![Project Preview](public/preview.png)

## 🚀 Features

- **Headless Architecture**: Next.js frontend with WordPress/WooCommerce backend
- **Faust.js Integration**: Seamless WordPress authentication and content management
- **WooCommerce Integration**: Full e-commerce functionality via GraphQL
- **User Authentication**: Login, registration, and account management
- **Shopping Cart**: Persistent cart with session management
- **Checkout Flow**: Complete checkout with billing, shipping, and payment processing ⚠️ **Note: Checkout functionality is currently under review and may require fixes**
- **Stripe Integration**: Secure payment processing with Stripe Elements
- **Product Catalog**: Product listings, categories, and search
- **User Accounts**: Order history, account details, and address management
- **Responsive Design**: Mobile-first, modern UI built with Tailwind CSS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm** or **yarn** package manager
- **WordPress** site (5.8 or higher)
- **PHP** 7.4 or higher (for WordPress)
- **MySQL** 5.7 or higher (for WordPress database)

## 🛠️ Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd nw-nextjs-faust-woocommerce
```

### Step 2: Install Next.js Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local  # If you have an example file
# Or create .env.local manually
```

Add the following environment variables:

```env
# Required: Your WordPress GraphQL endpoint
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql

# Faust.js Configuration
# Your WordPress site URL (base URL, not the GraphQL endpoint)
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8080

# Plugin secret found in WordPress Settings->Faust
FAUST_SECRET_KEY=your-faust-secret-key-here

# Optional: Algolia Search (only if using search)
# NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
# NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY=your_algolia_public_key
# NEXT_PUBLIC_ALGOLIA_INDEX_NAME=your_index_name

# Optional: Placeholder images
NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL=https://via.placeholder.com/300
NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL=https://via.placeholder.com/800

# Stripe Configuration
# Publishable key - safe to use in frontend/client-side code
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Gateway ID - usually 'stripe' but check your WooCommerce Stripe plugin settings
# Common values: 'stripe', 'stripe_cc', 'woocommerce_gateway_stripe'
NEXT_PUBLIC_STRIPE_GATEWAY_ID=stripe

# NOTE: The Stripe SECRET key (sk_test_...) should NOT be added here!
# Secret keys must only be stored in your WordPress/WooCommerce backend (server-side)
# Add the secret key in your WordPress admin: WooCommerce > Settings > Payments > Stripe
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔌 WordPress Backend Setup

### Required WordPress Plugins

Install and activate the following plugins in your WordPress site:

#### Core Plugins (Required)

**Installation Order:** Install and activate plugins in this order for best results.

1. **[WooCommerce](https://wordpress.org/plugins/woocommerce/)**
   - **Purpose**: E-commerce platform for WordPress
   - **Installation**:
     - Go to **Plugins** → **Add New**
     - Search for "WooCommerce"
     - Click **"Install Now"** then **"Activate"**
   - **After Activation**: Complete the WooCommerce setup wizard (see configuration section below)
   - **Version**: Tested with WooCommerce 9.9.5+

2. **[WP GraphQL](https://wordpress.org/plugins/wp-graphql/)**
   - **Purpose**: Exposes GraphQL API for WordPress
   - **Installation**:
     - Go to **Plugins** → **Add New**
     - Search for "WPGraphQL"
     - Click **"Install Now"** then **"Activate"**
   - **After Activation**: 
     - Go to **GraphQL** → **Settings**
     - Enable "Public Introspection" (required for Faust.js)
     - Note your GraphQL endpoint URL (usually `/graphql`)
   - **Version**: Tested with WP GraphQL 2.3.3+

3. **[WP GraphQL WooCommerce](https://github.com/wp-graphql/wp-graphql-woocommerce)**
   - **Purpose**: Adds WooCommerce functionality to WPGraphQL schema
   - **Installation**:
     - Download the latest release from: https://github.com/wp-graphql/wp-graphql-woocommerce/releases
     - Download the `.zip` file (e.g., `wp-graphql-woocommerce-0.19.0.zip`)
     - Go to **Plugins** → **Add New** → **Upload Plugin**
     - Choose the downloaded `.zip` file
     - Click **"Install Now"** then **"Activate"**
   - **Alternative**: Install via WP-CLI:
     ```bash
     wp plugin install https://github.com/wp-graphql/wp-graphql-woocommerce/archive/refs/heads/main.zip --activate
     ```
   - **Version**: Tested with WP GraphQL WooCommerce 0.19.0+
   - **Note**: Requires WooCommerce and WP GraphQL to be installed first

4. **[WP GraphQL CORS](https://wordpress.org/plugins/wp-graphql-cors/)**
   - **Purpose**: Enables CORS for GraphQL requests from your Next.js frontend
   - **Installation**:
     - Go to **Plugins** → **Add New**
     - Search for "WPGraphQL CORS"
     - Click **"Install Now"** then **"Activate"**
   - **After Activation**: Configure CORS settings (see detailed configuration section below)
   - **Version**: Tested with WP GraphQL CORS 2.1+
   - **Critical**: Must be configured correctly or Next.js won't be able to connect

5. **[Faust.js WordPress Plugin](https://wordpress.org/plugins/faustwp/)**
   - **Purpose**: Provides authentication and API endpoints for Faust.js
   - **Installation**:
     - Go to **Plugins** → **Add New**
     - Search for "Faust" or "FaustWP"
     - Click **"Install Now"** then **"Activate"**
   - **After Activation**: Configure Faust.js settings (see detailed configuration section below)
   - **Version**: Tested with FaustWP 1.x+
   - **Note**: Requires WP GraphQL to be installed first

#### Optional Plugins

6. **[WPGraphQL Content Blocks](https://github.com/wpengine/wp-graphql-content-blocks)**
   - **Purpose**: Enables Gutenberg block support in GraphQL
   - **Required**: Only if you want to use WordPress blocks in your Next.js app
   - **Installation**: See [WPGraphQL_CONTENT_BLOCKS_INSTALL.md](./WPGraphQL_CONTENT_BLOCKS_INSTALL.md) for detailed installation instructions
   - **After Installation**: No additional configuration needed - works automatically

7. **[Advanced Custom Fields (ACF)](https://www.advancedcustomfields.com/)**
   - **Purpose**: For custom product fields and additional content fields
   - **Installation**:
     - Go to **Plugins** → **Add New**
     - Search for "Advanced Custom Fields"
     - Click **"Install Now"** then **"Activate"**
   - **Configuration**: See [WORDPRESS_CUSTOM_FIELDS_SETUP.md](./WORDPRESS_CUSTOM_FIELDS_SETUP.md) for detailed setup
   - **Note**: Free version available, Pro version has more features

8. **[WPGraphQL for Advanced Custom Fields](https://wordpress.org/plugins/wp-graphql-acf/)**
   - **Purpose**: Exposes ACF fields to GraphQL (required if using ACF)
   - **Installation**:
     - Go to **Plugins** → **Add New**
     - Search for "WPGraphQL ACF"
     - Click **"Install Now"** then **"Activate"**
   - **After Activation**: 
     - ACF fields will automatically appear in GraphQL
     - Enable "Show in GraphQL" in ACF field group settings
   - **Note**: Requires both ACF and WP GraphQL to be installed

9. **[WooCommerce Stripe Payment Gateway](https://woocommerce.com/products/stripe/)**
   - **Purpose**: Required for Stripe payment processing
   - **Installation**:
     - Go to **WooCommerce** → **Settings** → **Payments**
     - Find **Stripe** in the payment methods list
     - Click **"Set up"** or **"Manage"**
     - If not installed, WooCommerce will prompt you to install it
   - **Configuration**: See detailed Stripe configuration section below
   - **Note**: Stripe plugin is included with WooCommerce, no separate download needed

### WordPress Plugin Configuration

#### 1. WooCommerce Configuration

**Initial Setup:**
1. Go to **WooCommerce** → **Settings**
2. Complete the WooCommerce setup wizard:
   - **Store Details**: Enter your store address, country, and currency
   - **Payment Methods**: Enable at least one payment method (Stripe recommended)
   - **Shipping**: Configure shipping zones and methods
   - **Recommended Plugins**: Skip if desired

**Payment Gateway Setup (Stripe):**
1. Go to **WooCommerce** → **Settings** → **Payments** → **Stripe**
2. Click **"Set up"** or **"Manage"**
3. Configure Stripe settings:
   - **Enable/Disable**: Check "Enable Stripe"
   - **Title**: "Credit Card (Stripe)" (or your preferred title)
   - **Description**: Payment description shown to customers
   - **Test Mode**: Enable for development, disable for production
   - **Publishable Key**: Add your Stripe publishable key (`pk_test_...` or `pk_live_...`)
   - **Secret Key**: Add your Stripe secret key (`sk_test_...` or `sk_live_...`)
     - ⚠️ **Important**: Secret key stays in WordPress, never in Next.js `.env.local`
   - **Webhook Secret**: (Optional) For payment status updates
4. Click **"Save changes"**

**Product Setup:**
1. Go to **Products** → **Add New**
2. Create test products with:
   - Product name and description
   - Price (required)
   - Product image
   - Stock status
   - Product categories
3. Publish products

#### 2. WP GraphQL Configuration

**Basic Settings:**
1. Go to **GraphQL** → **Settings** (or **Settings** → **GraphQL**)
2. Configure the following:
   - **GraphQL Endpoint**: Usually `/graphql` (default)
   - **Enable Public Introspection**: ✅ **Check this box** (required for Faust.js)
   - **Debug Mode**: Enable for development, disable for production
3. Click **"Save Changes"**

**GraphQL Endpoint URL:**
- Your GraphQL endpoint will be: `http://your-wordpress-site.com/graphql`
- Add this to your `.env.local` as `NEXT_PUBLIC_GRAPHQL_URL`

#### 3. WP GraphQL CORS Configuration

**Critical**: This must be configured correctly or the Next.js app won't be able to communicate with WordPress.

1. Go to **Settings** → **WPGraphQL CORS** (or **GraphQL** → **Settings** → **CORS**)
2. Configure the following settings:

   **Access-Control-Allow-Origin:**
   - Add your Next.js frontend URL(s), one per line:
     - For local development: `http://localhost:3000`
     - For production: `https://your-nextjs-domain.com`
   - Example:
     ```
     http://localhost:3000
     https://your-production-domain.com
     ```

   **Access-Control-Allow-Credentials:**
   - ✅ **Enable "Send site credentials"** (required for authentication)
   - ✅ **Enable "Add Site Address to Access-Control-Allow-Origin header"** (recommended)

   **Access-Control-Allow-Headers:**
   - Should include: `Content-Type`, `Authorization`, `X-WP-Nonce`
   - Usually pre-filled, but verify these headers are present

   **Access-Control-Allow-Methods:**
   - Should include: `GET`, `POST`, `OPTIONS`
   - Usually pre-filled

3. Click **"Save Changes"**

**Important Notes:**
- The server must return a specific origin (not `*`) when using `credentials: 'include'`
- The CORS plugin handles this automatically when you add your domain to the allowed origins list
- If you're using multiple environments (dev, staging, production), add all URLs
- Clear any caching plugins after saving CORS settings

#### 4. Faust.js WordPress Plugin Configuration

**Settings Page:**
1. Go to **Settings** → **Faust** (or **Settings** → **Headless**)
2. Configure the following:

   **Front-end site URL:**
   - Set to your Next.js app URL
   - For local development: `http://localhost:3000`
   - For production: `https://your-nextjs-domain.com`
   - Example: `http://localhost:3000`

   **Secret Key:**
   - This is automatically generated when you first access the settings page
   - **Copy this key** - you'll need it for your `.env.local` file
   - Add it as `FAUST_SECRET_KEY` in your Next.js `.env.local`:
     ```env
     FAUST_SECRET_KEY=your-secret-key-here
     ```

   **Enable Redirects:**
   - ✅ Check this if you want WordPress to redirect to your Next.js frontend
   - Useful for headless setups where WordPress frontend is disabled

   **Enable Post Previews:**
   - ✅ Check this to enable post preview functionality
   - Allows previewing unpublished posts in Next.js

3. Click **"Save Changes"**

**Verification:**
- After saving, verify the Secret Key is displayed (you can regenerate if needed)
- Ensure the Front-end site URL matches your Next.js app URL exactly

#### 5. WP GraphQL WooCommerce Configuration

**No Additional Configuration Required:**
- Once installed and activated, WP GraphQL WooCommerce automatically extends the GraphQL schema
- No settings page or configuration needed
- The plugin adds WooCommerce types, queries, and mutations to your GraphQL endpoint

**Verification:**
- Test that WooCommerce queries work in GraphQL:
  ```graphql
  {
    products(first: 5) {
      nodes {
        id
        name
        price
        stockStatus
      }
    }
  }
  ```

#### 6. WooCommerce Stripe Payment Gateway Configuration

**Setup:**
1. Go to **WooCommerce** → **Settings** → **Payments**
2. Find **Stripe** in the payment methods list
3. Click **"Set up"** or **"Manage"**
4. Configure Stripe settings:

   **General Settings:**
   - **Enable/Disable**: ✅ Enable Stripe
   - **Title**: "Credit Card" (or your preferred title)
   - **Description**: "Pay securely with your credit card via Stripe"
   - **Test Mode**: ✅ Enable for development/testing

   **Stripe Account Details:**
   - **Publishable Key**: Your Stripe publishable key (`pk_test_...` for test mode)
   - **Secret Key**: Your Stripe secret key (`sk_test_...` for test mode)
     - ⚠️ **Never share or commit secret keys to version control**
   - **Webhook Secret**: (Optional) For real-time payment status updates
     - Set up webhook endpoint in Stripe Dashboard: `https://your-wordpress-site.com/wc-api/stripe`

   **Statement Descriptor:**
   - Customize how charges appear on customer statements
   - Example: "YOUR STORE NAME"

   **Payment Request Buttons:**
   - Apple Pay, Google Pay, etc. (optional)
   - Configure if you want to enable these payment methods

5. Click **"Save changes"**

**Testing:**
- Use Stripe test cards: `4242 4242 4242 4242` (any future expiry, any CVC)
- Test successful and failed payment scenarios

#### 7. WPGraphQL Content Blocks Configuration (Optional)

**No Configuration Required:**
- Once installed and activated, the plugin automatically works
- No settings page or configuration needed
- Provides `editorBlocks` field in GraphQL queries

**Verification:**
- Test with a GraphQL query:
  ```graphql
  {
    posts(first: 1) {
      nodes {
        title
        editorBlocks(flat: false) {
          __typename
          name
          renderedHtml
        }
      }
    }
  }
  ```

#### 8. Advanced Custom Fields (ACF) Configuration (Optional)

**If using ACF for custom product fields:**

1. **Install ACF Plugin**
   - Go to **Plugins** → **Add New** → Search "Advanced Custom Fields"
   - Install and activate

2. **Install WPGraphQL ACF Plugin**
   - Go to **Plugins** → **Add New** → Search "WPGraphQL ACF"
   - Install and activate

3. **Create Custom Fields**
   - Go to **Custom Fields** → **Add New**
   - Create field groups for products
   - See [WORDPRESS_CUSTOM_FIELDS_SETUP.md](./WORDPRESS_CUSTOM_FIELDS_SETUP.md) for detailed setup

4. **Expose to GraphQL**
   - In ACF field group settings, enable "Show in GraphQL"
   - Set GraphQL field name
   - Fields will automatically appear in GraphQL queries

### Testing Your Configuration

**1. Test GraphQL Endpoint:**
- Visit `http://your-wordpress-site.com/graphql`
- You should see a GraphQL interface or endpoint
- Test a simple query:
  ```graphql
  {
    products(first: 5) {
      nodes {
        id
        name
        price
        stockStatus
      }
    }
  }
  ```

**2. Test CORS Configuration:**
- Open browser DevTools → Network tab
- Make a request from your Next.js app
- Check that CORS headers are present in the response
- Verify no CORS errors in console

**3. Test Faust.js Authentication:**
- Try logging in from your Next.js app
- Check that authentication tokens are being set
- Verify user data loads correctly after login

**4. Test WooCommerce Integration:**
- Add products to cart in Next.js
- Verify cart data syncs with WooCommerce
- Test checkout flow (if working)

## 📦 Dependencies

### Core Dependencies

- **Next.js** `16.0.7` - React framework for production
- **React** `19.2.1` - UI library
- **TypeScript** `5.9.3` - Type safety
- **Apollo Client** `^3.14.0` - GraphQL client
- **Faust.js** `^3.3.4` - WordPress integration framework
  - `@faustwp/core` - Core Faust.js functionality
  - `@faustwp/blocks` - WordPress block rendering
  - `@faustwp/cli` - CLI tools

### E-commerce Dependencies

- **Stripe** - Payment processing
  - `@stripe/stripe-js` `^4.0.0` - Stripe.js SDK
  - `@stripe/react-stripe-js` `^2.9.0` - React components for Stripe

### UI & Styling

- **Tailwind CSS** `^3.4.18` - Utility-first CSS framework
- **Lucide React** `^0.555.0` - Icon library
- **Motion** `^12.23.25` - Animation library

### Form Management

- **React Hook Form** `^7.68.0` - Form state management and validation

### State Management

- **Zustand** `^5.0.9` - Lightweight state management (for cart)

### Search (Optional)

- **Algolia Search** - If using Algolia search
  - `algoliasearch` `^4.25.3`
  - `react-instantsearch-dom` `^6.40.4`

### Development Dependencies

- **ESLint** - Code linting
- **Prettier** `^3.7.4` - Code formatting
- **TypeScript** - Type checking
- **Playwright** `^1.57.0` - E2E testing
- **Lighthouse CI** `^0.15.1` - Performance monitoring

## 🚀 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format

# Run Playwright tests
npm run playwright

# Run Playwright UI
npm run playwright:ui

# Run Lighthouse CI
npm run lhci
```

### Project Structure

```
nw-nextjs-faust-woocommerce/
├── src/
│   ├── components/          # React components
│   │   ├── Checkout/       # Checkout flow components
│   │   ├── Cart/           # Shopping cart components
│   │   ├── Product/        # Product display components
│   │   └── User/           # User account components
│   ├── pages/              # Next.js pages
│   │   ├── checkout.tsx    # Checkout page
│   │   ├── cart.tsx        # Cart page
│   │   ├── account.tsx     # Account page
│   │   └── [...slug].tsx   # Dynamic WordPress pages
│   ├── utils/              # Utility functions
│   │   ├── apollo/         # Apollo Client configuration
│   │   ├── gql/            # GraphQL queries and mutations
│   │   └── auth.ts         # Authentication utilities
│   ├── stores/             # State management (Zustand)
│   └── faust.config.js     # Faust.js configuration
├── public/                 # Static assets
├── .env.local             # Environment variables (not in git)
└── package.json          # Dependencies and scripts
```

## 🔐 Authentication

This project uses **Faust.js** for WordPress authentication. The authentication flow:

1. User logs in via `useLogin()` hook from `@faustwp/core`
2. Faust.js handles the authorization code flow
3. Access tokens are stored securely
4. Authenticated requests use `getApolloAuthClient()` which automatically includes auth headers

### Key Authentication Components

- **CheckoutLogin**: Login component for checkout page
- **Account Page**: Full account management with authentication
- **useAuth Hook**: Checks authentication status throughout the app

## 💳 Payment Processing

Stripe integration is configured for secure payment processing:

1. **Frontend**: Uses Stripe Elements for card input
2. **Backend**: WooCommerce Stripe plugin processes payments
3. **Configuration**: 
   - Publishable key in `.env.local` (frontend)
   - Secret key in WordPress WooCommerce settings (backend)

See [STRIPE_ENV_VARIABLES_EXPLAINED.md](./STRIPE_ENV_VARIABLES_EXPLAINED.md) for detailed Stripe setup.

## ⚠️ Known Issues

### Checkout Functionality

**Status**: Under Review

The checkout flow is currently being reviewed and may have issues with:
- User authentication during checkout
- Order assignment to logged-in users
- Billing and shipping data population

**Workaround**: If you encounter issues:
1. Ensure you're logged in before adding items to cart
2. Visit the account page first to establish authentication session
3. Then proceed to checkout

**Note**: The checkout components have been refactored to use Faust.js authentication, but additional testing and fixes may be required.

## 🐛 Troubleshooting

### Common Issues

#### "Sorry, no session found" Error

- **Cause**: Authentication session not initialized
- **Solution**: Ensure `useAuth()` is called in components that need authentication
- **Fix**: The checkout page now initializes auth automatically

#### GraphQL Connection Errors

- **Check**: `NEXT_PUBLIC_GRAPHQL_URL` is correct in `.env.local`
- **Verify**: WordPress GraphQL endpoint is accessible
- **Test**: Visit `http://your-wordpress-site.com/graphql` in browser

#### CORS Errors

- **Check**: WP GraphQL CORS plugin is installed and configured
- **Verify**: Your Next.js URL is added to allowed origins
- **Test**: Check browser console for specific CORS error messages

#### Orders Assigned to Guest

- **Cause**: Checkout mutation not using authenticated client
- **Solution**: Ensure `getApolloAuthClient()` is used for checkout mutations
- **Status**: ✅ Fixed in latest version

#### User Data Not Loading After Login

- **Cause**: Apollo cache not refreshing after authentication
- **Solution**: Faust.js handles this automatically, but ensure `useAuth()` is called
- **Fix**: Components now use authenticated Apollo client

### Debug Mode

Enable debug logging by checking browser console. The app includes extensive logging for:
- Authentication flow
- GraphQL queries and mutations
- Cart operations
- Checkout process

## 📚 Additional Documentation

- [WordPress Blocks Setup](./WORDPRESS_BLOCKS_SETUP.md) - Setting up WordPress blocks
- [WordPress Custom Fields Setup](./WORDPRESS_CUSTOM_FIELDS_SETUP.md) - ACF configuration
- [WPGraphQL Content Blocks Install](./WPGraphQL_CONTENT_BLOCKS_INSTALL.md) - Block plugin setup
- [Stripe Environment Variables](./STRIPE_ENV_VARIABLES_EXPLAINED.md) - Stripe configuration guide

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Faust.js](https://faustjs.org/) - WordPress headless framework
- [WooCommerce](https://woocommerce.com/) - E-commerce platform
- [WPGraphQL](https://www.wpgraphql.com/) - GraphQL API for WordPress
- [Next.js](https://nextjs.org/) - React framework
