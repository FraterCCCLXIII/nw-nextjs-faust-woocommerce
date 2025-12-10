import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const wordpressUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '') || 'http://moleculestore.local';

  console.log('[Logout API] Environment check:', {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    extractedWordPressUrl: wordpressUrl,
  });

  try {
    console.log('[Logout API] Attempting logout...');
    console.log('[Logout API] WordPress URL:', wordpressUrl);
    
    // Forward cookies from client to WordPress logout request
    const cookieHeader = req.headers.cookie || '';
    console.log('[Logout API] Forwarding client cookies to WordPress:', cookieHeader.substring(0, 200) + '...');

    // Step 1: Get logout nonce from WordPress admin area
    // We'll try to get it from wp-admin, or use a direct logout URL
    console.log('[Logout API] Step 1: Attempting WordPress logout...');
    
    // WordPress logout URL - WordPress will handle the nonce check
    // If cookies are valid, WordPress will log out and redirect
    const logoutUrl = `${wordpressUrl}/wp-login.php?action=logout`;
    console.log('[Logout API] Logout endpoint:', logoutUrl);

    const response = await fetch(logoutUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (compatible; Next.js Logout)',
      },
      redirect: 'manual',
    });

    console.log('[Logout API] WordPress logout response status:', response.status);
    console.log('[Logout API] WordPress logout response headers:', {
      location: response.headers.get('location'),
      'set-cookie': response.headers.get('set-cookie') ? 'present' : 'missing',
    });

    // Step 2: Clear cookies by setting them to expire
    // WordPress sets cookies with various paths and domains, so we need to clear them all
    console.log('[Logout API] Step 2: Clearing cookies...');
    
    const cookiesToClear = [
      'wordpress_logged_in_',
      'wordpress_',
      'wp_',
      'wp-settings-',
      'wp-settings-time-',
      'woocommerce_',
      'woocommerce_cart_',
      'woocommerce_items_in_cart',
      'woocommerce_cart_hash',
      'woocommerce_session_',
    ];

    // Extract cookie names from the request
    const cookieNames = new Set<string>();
    if (cookieHeader) {
      cookieHeader.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        if (name) {
          cookieNames.add(name);
        }
      });
    }

    console.log('[Logout API] Found cookies to clear:', Array.from(cookieNames));

    // Clear all cookies by setting them to expire with various path/domain combinations
    // Note: We can only clear cookies for the current domain (localhost:3000)
    // Cookies set for moleculestore.local will be cleared by WordPress when we call the logout endpoint
    const paths = ['/', '/wp-admin/', '/wp-content/', '/wp-includes/'];
    const domains = ['localhost', '.localhost'];

    let clearedCount = 0;
    cookieNames.forEach((cookieName) => {
      // Check if it's a WordPress/WooCommerce cookie
      const shouldClear = cookiesToClear.some((prefix) => cookieName.startsWith(prefix)) || 
                         cookieName.includes('wordpress') || 
                         cookieName.includes('woocommerce') ||
                         cookieName.includes('wp_');

      if (shouldClear) {
        console.log('[Logout API] Clearing cookie:', cookieName);
        paths.forEach((path) => {
          domains.forEach((domain) => {
            // Clear with domain
            res.appendHeader('Set-Cookie', `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`);
            // Clear without domain
            res.appendHeader('Set-Cookie', `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`);
          });
        });
        clearedCount++;
      }
    });

    // Also forward any Set-Cookie headers from WordPress response (WordPress may set expired cookies)
    const setCookieHeaders = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : (response.headers.get('set-cookie')?.split(/,(?=[^;]*=)/).map((s: string) => s.trim()) || []);

    if (setCookieHeaders.length > 0) {
      console.log('[Logout API] Forwarding', setCookieHeaders.length, 'Set-Cookie headers from WordPress');
      setCookieHeaders.forEach((cookie: string) => {
        res.appendHeader('Set-Cookie', cookie);
      });
    }

    console.log('[Logout API] Cleared', clearedCount, 'cookie(s)');

    console.log('[Logout API] ✅ Logout successful, cookies cleared');
    return res.status(200).json({
      success: true,
      status: 'SUCCESS',
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('[Logout API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Logout failed. Please try again.',
      details: error.message,
    });
  }
}

