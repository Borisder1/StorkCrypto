// Cloudflare Pages Function: POST /api/payments/stars/create-link
// External Web scenario: generate one-time Telegram invoice link for browser users

import { onRequestPost as handleCreate, onRequestOptions as handleOptions } from './create';

interface Context {
  request: Request;
  env: Record<string, string>;
}

export async function onRequestOptions(context: Context): Promise<Response> {
  return handleOptions(context);
}

export async function onRequestPost(context: Context): Promise<Response> {
  return handleCreate(context);
}
