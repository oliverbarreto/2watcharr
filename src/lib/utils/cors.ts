import { NextRequest, NextResponse } from 'next/server';

/**
 * Common CORS allowlist
 */
const ALLOWLIST = new Set([
  'http://localhost:3000',
  'chrome-extension://cngjokpjmgicghgegnjdfmddghmhmfmd', // Placeholder or real ID if provided
  'moz-extension://cngjokpjmgicghgegnjdfmddghmhmfmd'    // Placeholder or real ID if provided
]);

/**
 * Returns CORS headers for a given origin if it's in the allowlist
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !ALLOWLIST.has(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Token, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handles CORS preflight (OPTIONS) requests
 */
export async function handleOptions(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);
  
  return new NextResponse(null, {
    status: 204,
    headers,
  });
}
