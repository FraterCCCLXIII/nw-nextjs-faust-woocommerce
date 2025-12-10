import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const wordpressUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '') || 'http://moleculestore.local';

  console.log('[Login API] Environment check:', {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    extractedWordPressUrl: wordpressUrl,
  });

  try {
    console.log('[Login API] Attempting login for user:', username);
    console.log('[Login API] WordPress URL:', wordpressUrl);
    console.log('[Login API] Login endpoint:', `${wordpressUrl}/wp-login.php`);

    // Step 1: Get test cookie from the login page
    console.log('[Login API] Step 1: Getting test cookie from login page...');
    const loginPageResponse = await fetch(`${wordpressUrl}/wp-login.php`, {
      method: 'GET',
      redirect: 'manual', // Do not follow redirects
    });

      const testCookies: string[] = [];
      if (typeof loginPageResponse.headers.getSetCookie === 'function') {
        testCookies.push(...loginPageResponse.headers.getSetCookie());
      } else {
        const setCookieHeader = loginPageResponse.headers.get('set-cookie');
        if (setCookieHeader) {
          testCookies.push(...setCookieHeader.split(/,(?=[^;]*=)/).map((s: string) => s.trim()));
        }
      }
    console.log('[Login API] Got', testCookies.length, 'test cookie(s)');

    // Use WordPress wp-login.php for cookie-based authentication
    const formData = new URLSearchParams();
    formData.append('log', username);
    formData.append('pwd', password);
    formData.append('wp-submit', 'Log In');
    formData.append('redirect_to', `${wordpressUrl}/wp-admin/`);
    formData.append('testcookie', '1');

    console.log('[Login API] Step 2: Sending login request...');

    // Build cookie header from test cookies
    const cookieHeader = testCookies.map(cookie => {
      // Extract just the cookie name=value part (before semicolon)
      return cookie.split(';')[0];
    }).join('; ');

    const response = await fetch(`${wordpressUrl}/wp-login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {}), // Include test cookies
      },
      body: formData.toString(),
      redirect: 'manual',
    });

    console.log('[Login API] WordPress response status:', response.status);
    console.log('[Login API] WordPress response headers:', {
      location: response.headers.get('location'),
      'set-cookie': response.headers.get('set-cookie') ? 'present' : 'missing',
      'content-type': response.headers.get('content-type'),
    });

    // Forward cookies from WordPress to client
    // IMPORTANT: We need to preserve the original domain so cookies work with GraphQL requests to moleculestore.local
    // Node.js fetch API: try getSetCookie() first (Node.js 18+), then fallback
    let cookiesForwarded = 0;
    try {
      const setCookieHeaders = typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : (response.headers.get('set-cookie')?.split(/,(?=[^;]*=)/).map((s: string) => s.trim()) || []);

      console.log('[Login API] Found', setCookieHeaders.length, 'cookies to forward');

      setCookieHeaders.forEach((cookie: string) => {
        // Parse the cookie to extract name=value and attributes
        const parts = cookie.split(';').map(s => s.trim());
        const nameValue = parts.shift(); // e.g., "wordpress_logged_in_..."
        const [name, value] = nameValue?.split('=') || ['', ''];

        let newCookie = `${name}=${value}`;
        let hasPathAttribute = false;

        // IMPORTANT: Don't set Domain attribute - this allows cookies to work with the proxy
        // The proxy will forward these cookies to WordPress, and WordPress will recognize them
        // Setting Domain=moleculestore.local would prevent the browser from sending them to localhost:3000
        parts.forEach(attr => {
          const lowerAttr = attr.toLowerCase();
          if (lowerAttr.startsWith('domain=')) {
            // Skip domain attribute - don't include it
            // This allows cookies to be sent to localhost:3000, then forwarded by proxy
            hasPathAttribute = true; // Just to track that we processed attributes
          } else if (lowerAttr.startsWith('path=')) {
            hasPathAttribute = true;
            newCookie += `; ${attr}`;
          } else if (!lowerAttr.startsWith('domain=')) {
            // Include all other attributes (HttpOnly, Secure, SameSite, etc.) except Domain
            newCookie += `; ${attr}`;
          }
        });

        // If no path was explicitly set, add a default path
        if (!hasPathAttribute) {
          newCookie += `; Path=/`;
        }

        console.log('[Login API] Forwarding cookie (without Domain):', newCookie.substring(0, 100) + '...');
        res.appendHeader('Set-Cookie', newCookie);
        cookiesForwarded++;
      });
      console.log('[Login API] Forwarded', cookiesForwarded, 'cookie(s) to client');
    } catch (cookieError) {
      console.warn('[Login API] Could not forward cookies:', cookieError);
      // Continue anyway - cookies might still be set by WordPress
    }

    // Check if login was successful
    // WordPress returns 302 redirect on success, or 200 with error message on failure
    const location = response.headers.get('location');
    const isSuccess = response.status === 302 &&
                      location &&
                      !location.includes('wp-login.php') &&
                      !location.includes('action=lostpassword') &&
                      !location.includes('loggedout=true');

    console.log('[Login API] Login success check:', {
      status: response.status,
      location: location,
      isSuccess: isSuccess,
    });

    if (isSuccess) {
      console.log('[Login API] ✅ Login successful, redirecting to:', location);
      return res.status(200).json({
        success: true,
        status: 'SUCCESS'
      });
    } else {
      // Try to read the response body for more specific error messages
      let errorMessage = 'Login failed. Please check your username and password.';
      let errorDetails = {};
      try {
        const responseText = await response.text();
        console.log('[Login API] WordPress response body length:', responseText.length);
        console.log('[Login API] WordPress response body snippet (chars 0-1000):', responseText.substring(0, 1000));

        // Parse error messages using simple string matching
        if (responseText.includes('incorrect username or password') || responseText.includes('ERROR: The password you entered')) {
          errorMessage = 'Incorrect username or password.';
          console.log('[Login API] Detected: Incorrect username or password');
        } else if (responseText.includes('The password you entered for the username')) {
          errorMessage = 'The password you entered is incorrect.';
          console.log('[Login API] Detected: Incorrect password');
        } else if (responseText.includes('lostpassword') || responseText.includes('Lost your password')) {
          errorMessage = 'Password reset link detected. Please check your username and password.';
          console.log('[Login API] Detected: Password reset link');
        } else if (responseText.includes('Cookies are blocked or not supported')) {
          errorMessage = 'Cookies are blocked or not supported by your browser. Please enable cookies.';
          console.log('[Login API] Detected: Cookies blocked message');
        } else if (responseText.includes('login_error')) {
          // Try to extract error message from login_error div using regex
          const errorMatch = responseText.match(/<div[^>]*id=["']login_error["'][^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/i);
          if (errorMatch && errorMatch[1]) {
            errorMessage = errorMatch[1].trim();
            console.log('[Login API] Found error message in HTML:', errorMessage);
          } else {
            errorMessage = 'Login failed. Please check your credentials.';
            console.log('[Login API] Detected: login_error div but could not extract message');
          }
        } else {
          errorMessage = 'Login failed. Please check your username and password.';
          console.log('[Login API] No specific error pattern detected');
        }
      } catch (readError) {
        console.warn('[Login API] Could not read response body:', readError);
        errorMessage = 'Login failed. Could not read WordPress response.';
      }

      console.log('[Login API] ❌ Login failed:', errorMessage);
      console.log('[Login API] Response details:', {
        status: response.status,
        location: location,
        hasCookies: cookiesForwarded > 0,
        ...errorDetails,
      });

      return res.status(401).json({
        success: false,
        status: 'FAILED',
        error: errorMessage,
        details: errorDetails,
      });
    }
  } catch (error: any) {
    console.error('[Login API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
      details: error.message,
    });
  }
}

