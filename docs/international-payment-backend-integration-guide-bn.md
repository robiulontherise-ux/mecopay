# MecoPay International Payment Backend Integration Guide

এই guide-টি বর্তমান MecoPay-এর Express `server.ts` এবং Supabase structure ধরে লেখা। Frontend credential form একা payment process করবে না। Backend-এ provider API call, order mapping, webhook verification এবং idempotent fulfilment লাগবে।

## 1. এই release-এ কেবল চারটি gateway

International Gateway UI এবং backend rollout কেবল এই চার provider-এর জন্য রাখুন:

1. **Stripe** — সাধারণ international card/hosted Checkout
2. **PayPal** — Orders + buyer approval + capture
3. **OxaPay** — hosted crypto invoice
4. **Binance Pay** — Binance Pay crypto checkout

**Wise, Payoneer, Payeer এবং TapTap Send এই release থেকে বাদ।** এগুলোর adapter, frontend card এবং active gateway option রাখবেন না। পরে আলাদা product requirement ও provider approval থাকলে নতুন release-এ যোগ করা যাবে।

## 2. Client webhook কোথায় বসাবে

Client নিজের website-এর webhook URL MecoPay form-এ দেবে না। Payment provider-এর dashboard-এ MecoPay-এর generated endpoint বসাবে। International Gateway form-এ provider অনুযায়ী copy করার জন্য URL দেখানো হবে:

```text
Stripe:  https://api.mecopay.space/api/webhooks/stripe
PayPal:  https://api.mecopay.space/api/webhooks/paypal
OxaPay:  https://api.mecopay.space/api/webhooks/oxapay
Binance: https://api.mecopay.space/api/webhooks/binance
```

Provider dashboard setup:

- **Stripe:** Developers → Webhooks → Add endpoint → Stripe URL paste → `checkout.session.completed`, async success/failure এবং refund events select → signing secret নিয়ে MecoPay form-এ দিন।
- **PayPal:** Developer Dashboard → My Apps & Credentials → Webhooks → Add Webhook → PayPal URL paste → payment capture completed/denied এবং refund events select → Webhook ID MecoPay form-এ দিন।
- **OxaPay:** Merchant/API settings-এ callback URL হিসেবে OxaPay URL paste করুন। OxaPay API invoice create করার সময়ও একই MecoPay callback URL server-side পাঠানো হবে।
- **Binance Pay:** Binance Pay Merchant Admin-এর webhook/notification setting-এ Binance URL paste করুন এবং payment success/close events চালু করুন।

Flow হবে:

```text
Client provider dashboard-এ MecoPay URL বসায়
        ↓
Customer provider checkout page-এ payment করে
        ↓
Provider → MecoPay webhook পাঠায়
        ↓
MecoPay signature verify করে local order paid করে
        ↓
MecoPay → client website-এর configured merchant webhook পাঠায়
```

Client website-এর webhook হলো **দ্বিতীয় ধাপের merchant notification**; এটি Stripe/PayPal/OxaPay/Binance-এর provider webhook-এর বিকল্প নয়।

## 3. Suggested folder structure

বর্তমান root server-এর সঙ্গে provider code মিশিয়ে না রেখে আলাদা adapter রাখুন:

```text
server.ts
src/server/
  payments/
    types.ts
    order-service.ts
    provider-registry.ts
    status-machine.ts
    security.ts
    adapters/
      stripe.adapter.ts
      paypal.adapter.ts
      oxapay.adapter.ts
      binance-pay.adapter.ts
    webhooks/
      stripe.webhook.ts
      paypal.webhook.ts
      oxapay.webhook.ts
      binance.webhook.ts
    routes/
      payment.routes.ts
      webhook.routes.ts
supabase/migrations/
  20261015_international_payment_tables.sql
```

বর্তমান project-এ `server.ts`-এর route কমানো সম্ভব না হলে প্রথমে `server.ts` থেকে এই modules import করুন। পরে ধীরে ধীরে routes আলাদা করুন।

## 4. Database model

প্রথমে provider credential `payment_numbers`-এর মধ্যে plaintext হিসেবে রাখবেন না। আলাদা table বা encrypted secret store ব্যবহার করুন। Supabase service-role key কেবল server-side থাকবে।

```sql
create table if not exists payment_provider_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid,
  provider text not null,
  environment text not null default 'sandbox',
  credentials_encrypted jsonb not null,
  capability text not null default 'checkout',
  active boolean not null default false,
  onboarding_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, provider, environment)
);

create table if not exists payment_orders (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid,
  provider text not null,
  provider_account_id uuid references payment_provider_accounts(id),
  merchant_order_id text not null,
  provider_payment_id text,
  amount numeric(18,2) not null,
  currency text not null,
  status text not null default 'created',
  checkout_url text,
  raw_create_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, merchant_order_id)
);

create table if not exists payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text,
  payment_order_id uuid references payment_orders(id),
  signature_valid boolean not null default false,
  processed_at timestamptz,
  processing_error text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);
```

`credentials_encrypted`-এ production-এ plaintext রাখবেন না। Minimum হিসেবে KMS/Vault বা server-side encryption ব্যবহার করুন। Encryption key database-এর একই জায়গায় রাখবেন না।

## 4. Common adapter contract

সব provider-কে একই interface-এর মধ্যে আনুন, কিন্তু provider-specific signing/response adapter-এর ভিতরে রাখুন।

```ts
// src/server/payments/types.ts
export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'awaiting_customer'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'disputed';

export type CreatePaymentInput = {
  orderId: string;
  amount: number;
  currency: string;
  description?: string;
  customer?: { email?: string; name?: string };
  returnUrl: string;
  cancelUrl?: string;
};

export type CreatePaymentResult = {
  providerPaymentId: string;
  checkoutUrl?: string;
  status: PaymentStatus;
  raw: unknown;
};

export type VerifiedWebhook = {
  eventId: string;
  eventType: string;
  providerPaymentId?: string;
  merchantOrderId?: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  raw: unknown;
};

export interface PaymentAdapter {
  provider: string;
  createPayment(input: CreatePaymentInput, credentials: Record<string, string>): Promise<CreatePaymentResult>;
  getPayment?(providerPaymentId: string, credentials: Record<string, string>): Promise<unknown>;
  verifyWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>, credentials: Record<string, string>): Promise<VerifiedWebhook>;
}
```

## 5. Provider registry

```ts
// src/server/payments/provider-registry.ts
import { stripeAdapter } from './adapters/stripe.adapter';
import { paypalAdapter } from './adapters/paypal.adapter';
import { oxapayAdapter } from './adapters/oxapay.adapter';
import { binancePayAdapter } from './adapters/binance-pay.adapter';

export const adapters = {
  stripe: stripeAdapter,
  paypal: paypalAdapter,
  oxapay: oxapayAdapter,
  binance: binancePayAdapter,
};

export function getAdapter(provider: string) {
  const adapter = adapters[provider as keyof typeof adapters];
  if (!adapter) throw new Error(`Provider ${provider} is not enabled`);
  return adapter;
}
```

এই checkout registry-তে কেবল Stripe, PayPal, OxaPay এবং Binance রাখবেন।

## 6. Express raw-body webhook handling

Stripe, Binance এবং OxaPay raw request body দিয়ে signature verify করে। তাই webhook route-এ `express.json()` চলার আগে `express.raw()` ব্যবহার করতে হবে।

```ts
// server.ts — express.json() middleware-এর আগে
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhookHandler
);

app.post(
  '/api/webhooks/oxapay',
  express.raw({ type: 'application/json' }),
  oxapayWebhookHandler
);

app.post(
  '/api/webhooks/binance',
  express.raw({ type: 'application/json' }),
  binanceWebhookHandler
);


// এই routes register করার পরে সাধারণ JSON middleware
app.use(express.json({ limit: '1mb' }));
```

একই path-এ আগে `app.use(express.json())` থাকলে signature verification ব্যর্থ হতে পারে, কারণ raw body বদলে যাবে।

## 7. Generic order creation route

```ts
// src/server/payments/routes/payment.routes.ts
app.post('/api/payments/:provider/create', async (req, res) => {
  try {
    const provider = req.params.provider;
    const { brandId, orderId, amount, currency, items, customer } = req.body;

    if (!brandId || !orderId || !Number.isFinite(Number(amount)) || !currency) {
      return res.status(400).json({ error: 'brandId, orderId, amount and currency are required' });
    }

    // Never trust amount from the browser.
    const order = await orderService.getAndValidateOrder({
      brandId,
      orderId,
      expectedAmount: Number(amount),
      currency,
      items,
    });

    const account = await providerAccountService.getActiveAccount(brandId, provider);
    const adapter = getAdapter(provider);
    const result = await adapter.createPayment(
      {
        orderId: order.merchant_order_id,
        amount: order.amount,
        currency: order.currency,
        customer,
        returnUrl: `${APP_URL}/payment/result/${order.id}`,
        cancelUrl: `${APP_URL}/payment/cancel/${order.id}`,
      },
      account.credentials
    );

    await orderService.attachProviderPayment(order.id, {
      provider,
      providerPaymentId: result.providerPaymentId,
      checkoutUrl: result.checkoutUrl,
      status: result.status,
      raw: result.raw,
    });

    return res.json({
      success: true,
      orderId: order.id,
      providerPaymentId: result.providerPaymentId,
      checkoutUrl: result.checkoutUrl,
      status: result.status,
    });
  } catch (error) {
    console.error('payment create failed', error);
    return res.status(500).json({ error: 'Unable to create payment' });
  }
});
```

## 8. Stripe adapter skeleton

Stripe hosted Checkout-এর জন্য browser-এ Secret Key পাঠাবেন না।

```ts
// adapters/stripe.adapter.ts
import Stripe from 'stripe';

export const stripeAdapter: PaymentAdapter = {
  provider: 'stripe',

  async createPayment(input, credentials) {
    const stripe = new Stripe(credentials.serverApiKey, {
      apiVersion: '2025-03-31.basil',
    });

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: { name: input.description || `Order ${input.orderId}` },
              unit_amount: Math.round(input.amount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        metadata: { merchant_order_id: input.orderId },
        customer_email: input.customer?.email,
      },
      { idempotencyKey: `mecopay:${input.orderId}` }
    );

    return {
      providerPaymentId: session.id,
      checkoutUrl: session.url || undefined,
      status: 'awaiting_customer',
      raw: session,
    };
  },

  async verifyWebhook(rawBody, headers, credentials) {
    const stripe = new Stripe(credentials.serverApiKey);
    const signature = headers['stripe-signature'];
    if (typeof signature !== 'string') throw new Error('Missing Stripe-Signature');

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      credentials.webhookSecret
    );

    const object: any = event.data.object;
    const success = event.type === 'checkout.session.completed' && object.payment_status === 'paid';

    return {
      eventId: event.id,
      eventType: event.type,
      providerPaymentId: object.id,
      merchantOrderId: object.metadata?.merchant_order_id,
      status: success ? 'paid' : 'pending',
      amount: object.amount_total ? object.amount_total / 100 : undefined,
      currency: object.currency,
      raw: event,
    };
  },
};
```

Production-এ delayed payment-এর জন্য `checkout.session.async_payment_succeeded` এবং failure event-ও handle করুন।

## 9. PayPal adapter flow

PayPal-এর flow দুই ধাপে হয়: `create order` এবং buyer approval-এর পরে `capture`।

```ts
async function getPayPalAccessToken(clientId: string, clientSecret: string, baseUrl: string) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error(`PayPal token error ${response.status}`);
  return (await response.json()).access_token;
}

async function createPayPalOrder(input: CreatePaymentInput, credentials: Record<string, string>) {
  const baseUrl = credentials.environment === 'Live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  const token = await getPayPalAccessToken(
    credentials.clientId,
    credentials.clientSecret,
    baseUrl
  );

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `mecopay:${input.orderId}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: input.orderId,
        amount: { currency_code: input.currency, value: input.amount.toFixed(2) },
      }],
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });

  if (!response.ok) throw new Error(`PayPal create error ${response.status}`);
  const order = await response.json();
  const approve = order.links?.find((link: any) => link.rel === 'approve');

  return { providerPaymentId: order.id, checkoutUrl: approve?.href, raw: order };
}
```

Buyer approval-এর পরে backend-এ capture করুন:

```ts
async function capturePayPalOrder(providerOrderId: string, credentials: Record<string, string>) {
  const baseUrl = credentials.environment === 'Live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
  const token = await getPayPalAccessToken(credentials.clientId, credentials.clientSecret, baseUrl);

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${providerOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `mecopay:capture:${providerOrderId}`,
    },
    body: '{}',
  });

  const result = await response.json();
  if (!response.ok || result.status !== 'COMPLETED') {
    throw new Error('PayPal capture was not completed');
  }
  return result;
}
```

Capture response এবং webhook—দুটোকেই idempotentভাবে process করুন। `Webhook ID` একা webhook verification করে না; PayPal transmission signature বা verification API ব্যবহার করতে হবে।

## 10. OxaPay adapter flow

```ts
async function createOxaPayInvoice(input: CreatePaymentInput, credentials: Record<string, string>) {
  const response = await fetch('https://api.oxapay.com/v1/payment/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      merchant_api_key: credentials.merchantApiKey,
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      order_id: input.orderId,
      callback_url: credentials.callbackUrl,
      return_url: input.returnUrl,
      description: input.description || `Order ${input.orderId}`,
    }),
  });

  const result = await response.json();
  if (!response.ok || result.status !== 200 || !result.data?.track_id) {
    throw new Error(result.message || 'OxaPay invoice creation failed');
  }

  return {
    providerPaymentId: result.data.track_id,
    checkoutUrl: result.data.payment_url,
    status: 'awaiting_customer' as const,
    raw: result,
  };
}
```

OxaPay webhook raw body-এর HMAC-SHA512 `merchantApiKey` দিয়ে verify করতে হবে:

```ts
import crypto from 'node:crypto';

function verifyOxaPay(rawBody: Buffer, signature: string, merchantApiKey: string) {
  const expected = crypto
    .createHmac('sha512', merchantApiKey)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}
```

শুধু `paid` status, expected `track_id`/`order_id`, amount এবং currency মিললে fulfil করুন।

## 11. Generic webhook handler ও idempotency

```ts
async function processVerifiedWebhook(event: VerifiedWebhook) {
  // 1. Duplicate event প্রথমে আটকান
  const alreadyProcessed = await webhookEventService.exists(event.provider, event.eventId);
  if (alreadyProcessed) return { duplicate: true };

  await webhookEventService.insertReceived({
    provider: event.provider,
    eventId: event.eventId,
    eventType: event.eventType,
    signatureValid: true,
    raw: event.raw,
  });

  const order = await orderService.findByProviderPayment(
    event.provider,
    event.providerPaymentId,
    event.merchantOrderId
  );
  if (!order) throw new Error('Order not found for webhook');

  if (event.amount !== undefined && Number(event.amount) !== Number(order.amount)) {
    throw new Error('Webhook amount mismatch');
  }
  if (event.currency && event.currency.toUpperCase() !== order.currency.toUpperCase()) {
    throw new Error('Webhook currency mismatch');
  }

  if (event.status === 'paid') {
    await orderService.markPaidOnce(order.id, {
      provider: event.provider,
      providerPaymentId: event.providerPaymentId,
      paidAt: new Date().toISOString(),
    });
  } else {
    await orderService.updateStatus(order.id, event.status);
  }

  await webhookEventService.markProcessed(event.provider, event.eventId, order.id);
  return { processed: true };
}
```

`markPaidOnce` database transaction বা conditional update দিয়ে লিখুন:

```sql
update payment_orders
set status = 'paid', paid_at = coalesce(paid_at, now()), updated_at = now()
where id = $1
  and status not in ('paid', 'refunded');
```

তারপর fulfillment job-এ একই order ID-এর জন্য unique constraint রাখুন।

## 12. Webhook route example

```ts
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const account = await providerAccountService.getByWebhookRoute('stripe');
    const event = await stripeAdapter.verifyWebhook(
      req.body as Buffer,
      req.headers,
      account.credentials
    );
    await processVerifiedWebhook(event);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook failed', error);
    return res.status(400).json({ error: 'Invalid webhook' });
  }
});
```

Webhook handler-এ slow email/SMS/fulfillment সরাসরি করবেন না। প্রথমে event persist করুন, দ্রুত 2xx দিন, তারপর queue/worker দিয়ে notification ও fulfilment করুন।

## 13. Environment variables

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_URL=https://mecopay.space

# Do not put these in VITE_* variables.
STRIPE_SERVER_API_KEY=...
STRIPE_WEBHOOK_SECRET=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
OXAPAY_MERCHANT_API_KEY=...
BINANCE_PAY_CERTIFICATE_SN=...
BINANCE_PAY_SECRET=...
```

`VITE_*` variable browser bundle-এ চলে যেতে পারে। Secret কখনো `VITE_*` নামে রাখবেন না।

## 14. Test checklist

প্রতি provider-এর জন্য live enable করার আগে:

- Test/sandbox key দিয়ে create payment কাজ করে কি না
- Amount/currency mismatch reject হয় কি না
- Invalid signature reject হয় কি না
- Duplicate webhook দ্বিতীয়বার fulfil করে কি না
- Webhook retry safe কি না
- Customer redirect না করেও webhook এলে order paid হয় কি না
- Delayed payment `pending` থাকে কি না
- Refund/failed/expired state update হয় কি না
- Provider account/brand isolation ঠিক আছে কি না
- Secret logs বা frontend bundle-এ চলে গেছে কি না
- Provider ID ও local order ID mapping আছে কি না
- Reconciliation job missed webhook ধরতে পারে কি না

## 15. কী এখনই implement করবেন না

- Stripe publishable key দিয়ে server-side payment create করবেন না।
- PayPal Webhook ID-কে webhook secret হিসেবে ব্যবহার করবেন না।
- Browser success URL দেখে order paid করবেন না।
- Provider webhook signature verify না করে fulfil করবেন না।

বর্তমান MecoPay frontend configuration UI এই guide-এর field names-এর সঙ্গে align করা হয়েছে, কিন্তু backend adapter, database migration, webhook route এবং live provider credentials আলাদাভাবে deploy ও test করতে হবে।
