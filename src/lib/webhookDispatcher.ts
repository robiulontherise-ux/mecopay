import { supabase } from './supabase';

/**
 * Helper to dispatch real-time webhooks to merchant sites (Method 1)
 * 1. Invokes Supabase Edge Function 'dispatch-webhook' (Native Supabase architecture)
 * 2. Falls back to local dev proxy (/api/dispatch-webhook) if edge function is not deployed locally.
 */
export async function notifyMerchantWebhook(brandId: string, event: string, data: Record<string, any>) {
  if (!brandId) return null;

  // 1. Try Supabase Native Edge Function
  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('dispatch-webhook', {
      body: {
        brand_id: brandId,
        event,
        data
      }
    });

    if (!edgeError && edgeData) {
      return edgeData;
    }
  } catch (edgeErr) {
    // Edge function not deployed in local dev or network fallback
  }

  // 2. Dev fallback to local proxy
  try {
    const res = await fetch('/api/dispatch-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        brand_id: brandId,
        event,
        data
      })
    });
    return await res.json();
  } catch (err) {
    console.warn('Webhook dispatch skipped or failed (non-blocking):', err);
    return null;
  }
}
