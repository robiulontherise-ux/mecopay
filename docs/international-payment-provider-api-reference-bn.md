# MecoPay International Payment Provider API Reference

## সরাসরি সিদ্ধান্ত

বর্তমান UI-তে credential field থাকলেই কোনো provider API call করে payment response পাওয়া যাবে না। প্রতিটি provider-এর জন্য আলাদা backend adapter, encrypted server-side secret storage, order mapping, idempotency, public HTTPS webhook এবং provider-specific signature verification লাগবে। Browser redirect বা success page payment-এর প্রমাণ নয়।

| Provider | বর্তমান field-এর অবস্থা | বাস্তব verdict |
|---|---|---|
| Stripe | Publishable/Secret Key আংশিক সঠিক; webhook signing secret নেই | সাধারণ hosted checkout-এর জন্য উপযুক্ত, পরিবর্তন দরকার |
| Binance Pay | API Key/Secret শুধু Binance Pay Merchant credential হলে সঠিক; Merchant ID auth নয় | Crypto checkout হিসেবে শর্তসাপেক্ষ |
| OxaPay | Merchant API Key সঠিক একক credential | Hosted crypto invoice হিসেবে শর্তসাপেক্ষ |
| Wise | API Token payout-এর জন্য; Profile ID credential নয় | Generic checkout-এর জন্য নয় |
| Payoneer Checkout | বর্তমান Client ID/Secret/Program ID ভুল product-এর field | Approved Checkout merchant হলে নতুন field দরকার |
| Payeer | Merchant ID + merchant secret hosted flow-তে ব্যবহারযোগ্য; REST-এর field অসম্পূর্ণ | Redirect checkout হিসেবে শর্তসাপেক্ষ |
| PayPal | Client ID/Secret/Webhook ID আসল, কিন্তু environment ও listener setup নেই | Single-merchant checkout-এর জন্য উপযুক্ত, পরিবর্তন দরকার |
| TapTap Send | Public API Key/API Secret model official docs-এ নেই | Automated generic checkout হিসেবে ব্যবহার করা যাবে না |

## সব provider-এর জন্য বাধ্যতামূলক flow

1. Frontend শুধু cart/order request পাঠাবে। Amount, currency, inventory ও order server-side যাচাই হবে।
2. Backend provider API-তে payment/session/invoice তৈরি করবে এবং local order-এর সঙ্গে provider ID সংরক্ষণ করবে।
3. Provider-এর returned checkout URL বা approved SDK দিয়ে buyer approval হবে।
4. Public HTTPS webhook-এ raw body রেখে provider-specific signature/certificate যাচাই হবে।
5. Expected order ID, amount, currency এবং final provider status মিললে একবারই order `paid` হবে। Duplicate webhook, retry, delayed payment, refund ও failed payment handle করতে হবে।

## Provider-by-provider assessment

### 1. Stripe

**বর্তমান field:** Publishable Key এবং Secret Key।

Publishable Key (`pk_`) browser SDK-এর জন্য public identifier। এটি server-side Checkout Session বা PaymentIntent তৈরি করতে পারে না এবং hosted Checkout redirect-এর জন্য ঐচ্ছিক। Secret Key (`sk_`) বা Restricted Key (`rk_`) server-side API call-এর জন্য ব্যবহারযোগ্য। কিন্তু payment completion securely verify করতে প্রতিটি webhook endpoint-এর আলাদা `whsec_` signing secret দরকার। [1] [2] [3]

**বাস্তব flow:** Backend `POST /v1/checkout/sessions` করে, returned `url`-এ buyer redirect হয়। Local order-এর সঙ্গে Session ID সংরক্ষণ করতে হবে। `checkout.session.completed` এবং delayed payment-এর success/failure events webhook-এ verify করে fulfil করতে হবে। Redirect success-কে payment proof ধরা যাবে না।

**UI পরিবর্তন:**

- `Publishable Key` রাখা যায়, তবে hosted Checkout হলে optional করতে হবে।
- `Secret Key` নাম বদলে `Server API Key (Restricted rk_ recommended; Secret sk_ supported)` করা উচিত।
- `Webhook Signing Secret (whsec_)` যোগ করতে হবে।

### 2. Binance Pay

**বর্তমান field:** API Key, Secret Key, Merchant ID।

API Key তখনই সঠিক যখন এটি Binance Pay Merchant Admin-এর `BinancePay-Certificate-SN`/identity key। সাধারণ Binance Exchange বা trading API key এখানে কাজ করবে না। Secret Key paired Merchant API secret হতে হবে। Merchant ID সাধারণ Merchant Acquiring REST order create/authentication-এর credential নয়। [4] [5] [6]

**বাস্তব flow:** Backend exact JSON body দিয়ে HMAC-SHA512 signature তৈরি করে `POST /binancepay/openapi/v3/order` করে। Returned `prepayId`, `checkoutUrl`, QR বা universal URL সংরক্ষণ করে buyer-কে checkout-এ পাঠাতে হয়। Webhook signature Binance certificate দিয়ে RSA/SHA256 verify করতে হবে। `PAY_SUCCESS` এবং amount/currency/order match হওয়ার পর fulfil করতে হবে।

**সীমা:** এটি Binance user/crypto payment option; universal card gateway নয়।

### 3. OxaPay

**বর্তমান field:** Merchant API Key।

এই field সঠিক। OxaPay Merchant Invoice pay-in flow-তে একই Merchant API Key API header এবং webhook HMAC-SHA512 shared secret হিসেবে ব্যবহৃত হয়। আলাদা client key বা webhook secret বানানোর প্রয়োজন নেই। তবে public HTTPS `callback_url` এবং সাধারণত `return_url` দরকার। [7] [8] [9]

**বাস্তব flow:** Backend `POST https://api.oxapay.com/v1/payment/invoice` করে amount, currency, unique `order_id`, callback ও return URL পাঠাবে। Response-এর `track_id` এবং `payment_url` সংরক্ষণ করে buyer redirect হবে। Callback-এর raw body-এর HMAC যাচাই করে কেবল `paid` status-এ fulfil করতে হবে। `paying`, `underpaid`, `expired`, `refunding` বা `refunded` paid নয়। প্রয়োজনে `GET /payment/{track_id}` দিয়ে reconcile করতে হবে।

**সীমা:** OxaPay crypto invoice/payment URL; সাধারণ card acquirer নয়।

### 4. Wise Business/Platform API

**বর্তমান field:** API Token, Profile ID।

API Token নিজের Wise Business account-এর payout workflow-এ ব্যবহারযোগ্য হতে পারে। Profile ID authentication secret নয়; এটি resource/profile identifier। Wise Platform partner integration হলে OAuth client credentials, redirect URL, scopes এবং mTLS-এর মতো onboarding দরকার। [10] [11] [12]

**বাস্তব flow:** Wise-এর documented flow হলো recipient → quote → transfer requirements → transfer → funding → transfer webhooks। এটি customer card checkout বা hosted merchant payment session নয়। `incoming_payment_waiting` মানে transfer funding অপেক্ষায় আছে; customer payment complete নয়।

**সিদ্ধান্ত:** Wise-কে Payment Gateway-এর বদলে আলাদা payout/receiving module হিসেবে রাখা উচিত।

### 5. Payoneer Checkout

**বর্তমান field:** Client ID, Client Secret, Program ID।

এই তিনটি Payoneer Checkout-এর সঠিক field নয়। Client ID/Secret PSD2/Open API product এবং Program ID Mass Payout product-এর সঙ্গে সম্পর্কিত। Payoneer Checkout-এর জন্য আলাদা Checkout API username, Payment API token, store code/`division`, sandbox/live environment এবং notification configuration দরকার। [13] [14] [15]

**বাস্তব flow:** Approved merchant backend Basic Auth দিয়ে LIST session তৈরি করবে। Response-এর `redirect.url`-এ full-page hosted checkout redirect হবে। `charged`/`debited` final success; `pending` অপেক্ষমাণ। Notification endpoint-এ event verification, deduplication এবং status processing দরকার।

**সিদ্ধান্ত:** Payoneer Checkout onboarding ও eligibility confirm না করে এই provider active করা উচিত নয়।

### 6. Payeer

**বর্তমান field:** Merchant ID, Secret Key, API ID, API Key।

Merchant ID ঠিক তখনই সঠিক যখন এটি `m_shop` store ID। Secret Key-টি Merchant Settings-এর signing/notification secret হতে হবে। API ID REST `apiId` হিসেবে ব্যবহারযোগ্য। API Key label অস্পষ্ট; REST-এর secret হলে নাম `API Pass` হওয়া উচিত। REST API-তে আলাদা Payeer account number (`account`) দরকার। [16] [17]

**সাধারণ hosted flow:** Backend unique order, amount, currency, Base64 description ও uppercase SHA-256 `m_sign` তৈরি করে `https://payeer.com/merchant/`-এ redirect করবে। Status URL callback-এ signature, store, order, amount, currency যাচাই করে কেবল `m_status=success`-এ fulfil করতে হবে। Browser success URL payment proof নয়।

**সীমা:** REST `invoiceCreate` ও advanced Merchant API সব account-এ automatically enabled নয়; approval লাগতে পারে।

### 7. PayPal

**বর্তমান field:** Client ID, Client Secret, Webhook ID।

Client ID ও Client Secret OAuth 2.0 app credential হিসেবে সঠিক। Webhook ID API secret নয়; এটি registered webhook listener শনাক্ত করে। আলাদা sandbox/live credential এবং environment selector দরকার। Webhook URL ও events আলাদাভাবে register করতে হবে। [18] [19] [20] [21]

**বাস্তব flow:** Backend Client ID/Secret দিয়ে OAuth token নেয়, trusted amount দিয়ে Orders v2 order create করে, buyer approval নেয় এবং server-side capture করে। Capture response-এ `COMPLETED`, expected amount/currency/payee এবং capture ID যাচাই করতে হবে। Webhook-এ `PAYMENT.CAPTURE.COMPLETED` verify করে idempotently fulfil করতে হবে।

**সীমা:** Ordinary merchant credentials দিয়ে marketplace, multi-seller বা payouts automatically চালু হয় না।

### 8. TapTap Send

**বর্তমান field:** API Key, API Secret।

Official public materials-এ TapTap Send-এর API endpoint, API key/secret authentication, checkout session, webhook, signature verification বা transaction query contract পাওয়া যায় না। তাই এই দুই field দিয়ে API call বানানো নিরাপদ নয়। [22] [23]

TapTap Send Business-এ approval-gated Payment Link থাকতে পারে, কিন্তু public docs-এ programmable create-link API বা verified webhook flow নেই। এটি dashboard/app-operated remittance বা limited Payment Link product হিসেবে বিবেচনা করতে হবে।

**সিদ্ধান্ত:** TapTap Send-কে `Manual / Provider approval required / No public API` হিসেবে mark বা disable করুন।

## MecoPay-এ কী পরিবর্তন করা উচিত

### UI field mapping

- **Stripe:** Restricted/Secret Server API Key, Publishable Key optional, Webhook Signing Secret, environment।
- **Binance Pay:** Merchant Certificate SN, Merchant API Secret, webhook/certificate configuration; Merchant ID display-only হলে আলাদা রাখুন।
- **OxaPay:** Merchant API Key, callback configuration; return URL server-side derive করা যায়।
- **Wise:** Payment Gateway tab থেকে সরিয়ে Payout/Receiving module-এ নিন।
- **Payoneer:** Checkout API Username, Payment API Token, Store Code/Division, environment, notification configuration।
- **Payeer:** Merchant Store ID, Merchant Signing Secret; REST চালু করলে Account Number, API ID, API Pass।
- **PayPal:** Sandbox/Live environment, Client ID, Client Secret, Webhook ID, listener/event registration status।
- **TapTap Send:** API Key/API Secret input সরিয়ে approval/manual status দেখান।

### Backend ছাড়া কাজ হবে না

প্রতি provider-এর জন্য আলাদা adapter দরকার:

```text
createPayment(order)
getOrReconcilePayment(providerPaymentId)
handleWebhook(rawRequest)
normalizeStatus(providerStatus)
```

প্রতি adapter-এ secret redaction, order/provider ID mapping, idempotency, raw-body signature verification, duplicate webhook protection, amount/currency validation এবং refund/failed state handling থাকতে হবে।

## Final recommendation

প্রথম implementation হিসেবে **Stripe এবং PayPal** নিন। এরপর **OxaPay** বা **Binance Pay** crypto option হিসেবে নিন। **Payeer** কেবল hosted redirect ও provider approval নিশ্চিত হলে নিন। **Payoneer** onboarding confirmation ছাড়া নয়। **Wise** payout module-এ রাখুন এবং **TapTap Send** public API না পাওয়া পর্যন্ত automated gateway হিসেবে ব্যবহার করবেন না।

এই report-এর research অনুযায়ী বর্তমান MecoPay UI-তে কোনো provider-এর API integration connected বা production-tested নয়। UI fields শুধু configuration form; API call, response verification ও order fulfilment backend-এ আলাদাভাবে implement করতে হবে।

## References

[1]: https://docs.stripe.com/keys "Stripe API keys"
[2]: https://docs.stripe.com/payments/checkout/how-checkout-works?payment-ui=stripe-hosted "Stripe hosted Checkout flow"
[3]: https://docs.stripe.com/webhooks "Stripe webhooks"
[4]: https://developers.binance.com/en/docs/products/binance-pay-merchant/authentication "Binance Pay authentication"
[5]: https://developers.binance.com/en/docs/products/binance-pay-merchant/api-order-create-v3 "Binance Pay create order"
[6]: https://developers.binance.com/en/docs/products/binance-pay-merchant/webhook-common "Binance Pay webhook rules"
[7]: https://docs.oxapay.com/api-reference/payment/generate-invoice "OxaPay generate invoice"
[8]: https://docs.oxapay.com/webhook "OxaPay webhook"
[9]: https://docs.oxapay.com/api-reference/payment/payment-status-table "OxaPay payment status table"
[10]: https://docs.wise.com/guides/developer/auth-and-security "Wise authentication and security"
[11]: https://docs.wise.com/guides/product/send-money "Wise send money API"
[12]: https://docs.wise.com/guides/developer/webhooks/event-handling "Wise webhook event handling"
[13]: https://checkoutdocs.payoneer.com/docs/generate-your-payment-token "Payoneer Checkout payment token"
[14]: https://checkoutdocs.payoneer.com/docs/create-a-list-request "Payoneer Checkout LIST request"
[15]: https://checkoutdocs.payoneer.com/docs/create-notification-endpoints "Payoneer Checkout notifications"
[16]: https://github.com/payeer/docs/blob/main/rest-api/en.md "Payeer REST API documentation"
[17]: https://github.com/payeer/Wordpress-6.4-WooCommerce-8.6/blob/main/payeer_en/wc-payeer.php "Payeer official WooCommerce module"
[18]: https://developer.paypal.com/api/rest/authentication "PayPal REST authentication"
[19]: https://developer.paypal.com/api/orders/v2/orders-create "PayPal Orders create"
[20]: https://developer.paypal.com/api/orders/v2/orders-capture "PayPal Orders capture"
[21]: https://developer.paypal.com/api/rest/webhooks/rest "PayPal webhooks"
[22]: https://business.taptapsend.com/legal "TapTap Send Business legal agreement"
[23]: https://business.taptapsend.com/faq "TapTap Send Business FAQ"
