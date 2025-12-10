import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure it's a POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;

  if (!graphqlUrl) {
    console.error('[GraphQL Proxy] NEXT_PUBLIC_GRAPHQL_URL is not set.');
    return res.status(500).json({ error: 'GraphQL URL not configured.' });
  }

  try {
    // Forward headers, especially for authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Forward WooCommerce session header if present
    if (req.headers['woocommerce-session']) {
      headers['woocommerce-session'] = req.headers['woocommerce-session'] as string;
    }

    // Forward all cookies from the client to the WordPress GraphQL endpoint
    // This is critical: cookies set for moleculestore.local by the login API
    // need to be forwarded to WordPress GraphQL requests
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
      console.log('[GraphQL Proxy] Forwarding client cookies to WordPress:', req.headers.cookie.substring(0, 200) + '...');
    } else {
      console.log('[GraphQL Proxy] No cookies found in request');
    }

    console.log(`[GraphQL Proxy] Forwarding request to: ${graphqlUrl}`);

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(req.body),
    });

    console.log(`[GraphQL Proxy] Received response status: ${response.status}`);
    console.log(`[GraphQL Proxy] Response content-type: ${response.headers.get('content-type')}`);

    // Read response body once
    const responseText = await response.text();

    // Check if response is JSON by both content-type and content
    const contentType = response.headers.get('content-type') || '';
    const isJsonByHeader = contentType.includes('application/json');
    const trimmedText = responseText.trim();
    const isJsonByContent = trimmedText.startsWith('{') || trimmedText.startsWith('[');
    const isHtml = trimmedText.startsWith('<!DOCTYPE') || 
                   trimmedText.startsWith('<html') || 
                   trimmedText.startsWith('<?xml') ||
                   (trimmedText.includes('<html') && trimmedText.includes('</html>'));

    console.log('[GraphQL Proxy] Response analysis:', {
      isJsonByHeader,
      isJsonByContent,
      isHtml,
      contentType,
      contentPreview: responseText.substring(0, 100),
    });

    // If it's HTML or clearly not JSON, return error
    if (isHtml || (!isJsonByHeader && !isJsonByContent)) {
      // If HTML or not JSON, it's likely an error page
      console.error('[GraphQL Proxy] WordPress returned non-JSON response (HTML error page)');
      console.error('[GraphQL Proxy] Response preview (first 500 chars):', responseText.substring(0, 500));
      console.error('[GraphQL Proxy] GraphQL URL used:', graphqlUrl);
      console.error('[GraphQL Proxy] Request body:', JSON.stringify(req.body, null, 2));
      
      // Return a proper GraphQL error response
      return res.status(500).json({
        errors: [{
          message: 'GraphQL endpoint returned an error page. The WordPress GraphQL endpoint may not be accessible or configured correctly.',
          extensions: {
            code: 'GRAPHQL_PROXY_ERROR',
            httpStatus: response.status,
            contentType: contentType,
            responsePreview: responseText.substring(0, 200),
          }
        }]
      });
    }

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError: any) {
      console.error('[GraphQL Proxy] Failed to parse JSON response:', parseError);
      console.error('[GraphQL Proxy] Response text (first 500 chars):', responseText.substring(0, 500));
      
      return res.status(500).json({
        errors: [{
          message: 'Failed to parse GraphQL response as JSON.',
          extensions: {
            code: 'JSON_PARSE_ERROR',
            parseError: parseError.message,
            responsePreview: responseText.substring(0, 200),
          }
        }]
      });
    }

    // Forward only specific headers that are safe to forward
    // Don't forward content-encoding, transfer-encoding, or content-length
    // as Next.js will handle these automatically
    const headersToForward = ['content-type', 'set-cookie', 'woocommerce-session'];
    headersToForward.forEach((headerName) => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        res.setHeader(headerName, headerValue);
        if (headerName === 'woocommerce-session') {
          console.log('[GraphQL Proxy] Forwarding woocommerce-session header:', headerValue.substring(0, 50) + '...');
        }
      }
    });

    // Forward Set-Cookie headers individually (they can be multiple)
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    setCookieHeaders.forEach((cookie: string) => {
      res.appendHeader('Set-Cookie', cookie);
    });

    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[GraphQL Proxy] Error forwarding request:', error);
    res.status(500).json({
      error: 'Failed to connect to GraphQL backend via proxy.',
      details: error.message,
    });
  }
}

