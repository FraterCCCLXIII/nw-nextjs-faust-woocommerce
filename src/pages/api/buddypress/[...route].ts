/**
 * BuddyPress REST API Proxy
 * 
 * This API route proxies requests to the BuddyPress REST API on WordPress,
 * maintaining authentication through cookies and handling CORS.
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';
const BP_REST_API_BASE = '/wp-json/buddypress/v1';

interface BuddyPressError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET, POST, PUT, DELETE methods
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method || '')) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the route path (everything after /api/buddypress)
  const route = (req.query.route as string[]) || [];
  const endpoint = route.join('/');

  if (!endpoint) {
    return res.status(400).json({ message: 'Endpoint required' });
  }

  // Build the full BuddyPress REST API URL
  const bpUrl = `${WORDPRESS_URL}${BP_REST_API_BASE}/${endpoint}`;

  try {
    // Get cookies from the request to forward authentication
    const cookies = req.headers.cookie || '';
    
    // Get Authorization header from the request (if client sent it)
    const authHeader = req.headers.authorization || '';

    // Try to get access token from Faust using cookies
    // We'll make an internal request to the Faust token endpoint
    let accessToken: string | null = null;
    
    if (cookies && !authHeader) {
      try {
        // Get the protocol and host for internal API call
        const protocol = req.headers['x-forwarded-proto'] || (req.headers.host?.includes('localhost') ? 'http' : 'https');
        const host = req.headers.host || 'localhost:3000';
        const tokenUrl = `${protocol}://${host}/api/faust/token`;
        
        // Fetch token from Faust API endpoint using the cookies
        const tokenResponse = await fetch(tokenUrl, {
          method: 'GET',
          headers: {
            'Cookie': cookies,
          },
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          accessToken = tokenData.accessToken || null;
        }
      } catch (error) {
        // Silently fail - will rely on cookies only
        console.debug('Could not fetch access token:', error);
      }
    }

    // Build query string from query parameters
    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'route' && value) {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${bpUrl}?${queryString}` : bpUrl;

    // Prepare request options with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Forward cookies for cookie-based auth
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    // Add Authorization header if we have a token (BuddyPress REST API needs this)
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const requestOptions: RequestInit = {
      method: req.method,
      headers,
    };

    // Add body for POST/PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
      requestOptions.body = JSON.stringify(req.body);
    }

    // Make request to BuddyPress REST API
    const response = await fetch(fullUrl, requestOptions);

    // Get response data
    const data = await response.json().catch(() => ({}));

    // Forward the status code and data
    res.status(response.status).json(data);
  } catch (error) {
    console.error('BuddyPress API proxy error:', error);
    res.status(500).json({
      code: 'buddypress_proxy_error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

