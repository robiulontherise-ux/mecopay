// Centralized Payment Logos for Local MFS & International Gateways
// All stored permanently in /assets/mfs/ and /assets/international/ with zero external network dependencies.

export const PAYMENT_LOGOS: Record<string, string> = {
  // Local MFS & Local Merchant Gateways
  bkash: '/assets/mfs/bkash.png',
  nagad: '/assets/mfs/nagad.png',
  rocket: '/assets/mfs/rocket.png',
  upay: '/assets/mfs/upay.png',
  tap: '/assets/mfs/tap.png',
  mcash: '/assets/mfs/mcash.png',
  cellfin: '/assets/mfs/cellfin.png',
  pathao_pay: '/assets/mfs/pathao-pay.png',
  ok_wallet: '/assets/mfs/ok-wallet.png',
  islamic_wallet: '/assets/mfs/islamic-wallet.webp',

  // International Gateways
  stripe: '/assets/international/stripe.png',
  paypal: '/assets/international/paypal.png',
  payoneer: '/assets/international/payoneer.png',
  cryptomus: '/assets/international/cryptomus.png',
  payeer: '/assets/international/payeer.png',
  wise: '/assets/international/wise.png',
  taptap_send: '/assets/international/taptap-send.png',
};

export function getPaymentLogo(provider: string | undefined | null): string {
  if (!provider) return '';
  const key = String(provider).toLowerCase().trim().replace(/[-\s]/g, '_');
  return PAYMENT_LOGOS[key] || `/assets/mfs/${key}.png`;
}
