import { NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50; // 50 requests per minute
const MAX_LOGIN_ATTEMPTS = 10; // 10 login attempts per minute

function getClientIP(request) {
  // Get IP from various headers (for different deployment scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

function isRateLimited(clientIP, endpoint) {
  const now = Date.now();
  const key = `${clientIP}:${endpoint}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  const record = rateLimitStore.get(key);
  
  // Reset if window has passed
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return false;
  }
  
  // Check if limit exceeded
  const maxRequests = endpoint.includes('login') || endpoint.includes('auth') 
    ? MAX_LOGIN_ATTEMPTS 
    : MAX_REQUESTS_PER_WINDOW;
    
  if (record.count >= maxRequests) {
    return true;
  }
  
  record.count++;
  return false;
}

function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired records every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000);

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  const clientIP = getClientIP(request);
  
  // Check rate limit
  if (isRateLimited(clientIP, pathname)) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Too many requests', 
        message: 'Rate limit exceeded. Please try again later.' 
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }
  
  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', '10');
  response.headers.set('X-RateLimit-Remaining', '9'); // This would need to be calculated properly
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 