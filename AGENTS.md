# MecoPay - Extended Architectural Rules

## 1. Brand & Gateway Configuration (Dual Gateway System)
- **Dual Gateway:** Under a single Brand, clients can keep both Personal (MFS) and Merchant (MFS/Bank/Card) gateways active simultaneously or individually.
- **Smart Checkout Routing:** On the checkout page, the system will present both options to the customer: Manual Payment (via TrxID for Personal MFS) or Automatic Merchant Payment (via OTP/PIN). The customer can complete the payment using either method.

## 2. Product Type & Payment Logic
Clients can sell any type of product under the same brand. The checkout logic follows:
- **Digital Product (100% Payment):** The system charges the full amount via the gateway. Upon success, instant file/access delivery is triggered.
- **Physical Product (Advance + COD):** The total amount is displayed, but the gateway only charges the 'Advance Amount' (e.g., 200 TK). The rest is marked as pending for the courier (COD).
- **Physical Product (100% COD / Just Form):** No gateway payment options are shown. The customer only fills out their name and address to place the order.

## 3. "Just Form" (100% COD) Handling Across Platforms
- **WordPress & Custom Websites:** Since they have their own database, the MecoPay gateway (Plugin/API) does not process 100% COD orders locally. They manage orders on their site. However, if they want to use MecoPay's dashboard for Courier Booking (Pathao/Steadfast), the API/Plugin will send the order data to our system in the background.
- **MecoPay No-Code Website:** Since the website runs on our servers, 100% COD form submissions are saved directly in the MecoPay Dashboard (acting as the Order Management System).
- **Billing for No-Code:** No-code users are charged a "Monthly/Yearly Subscription" (SaaS Fee) to use the platform, meaning even without gateway volume, they pay for the system infrastructure.

## 4. Fulfillment & Advance Tracking
For physical products with 'Advance' payments, volume tracking works in two ways:
- **Own Inventory:** Clients add their Courier API in the dashboard. After advance payment, they book the parcel from our dashboard. When the courier confirms delivery via webhook, our system moves the "Pending Volume" to the main volume.
- **Dropshipping:** Since they pass orders to other apps, we use "Time-based Auto-Settlement". After advance payment, a 7 or 10-day timer starts. If the customer does not report an issue within this time, the system assumes successful delivery and auto-settles the volume. Clients can also manually "Mark as Delivered".

## 5. Integration Ecosystem
Clients can use this architecture in 3 ways:
- **Method A (Payment Links):** Generate direct links for Digital, Advance, or Just Form products from the dashboard and share anywhere.
- **Method B (WordPress Plugin):** The plugin automatically scans the cart to detect if the product is Digital or Physical and displays the appropriate payment or form page.
- **Method C (REST API):** Custom developers send a payload (e.g., `type: digital, gateway: both, fulfillment: dropship`) to the `POST /api/checkout` route, and the core system handles the logic perfectly.

## 6. Core Tech Stack Override (React + Supabase, NO Next.js)
Ignore any previous system rules requiring Next.js. We are strictly using **React + Vite** for the frontend and **Supabase** for the backend.
- **Infinite Frontend Scaling (Cloudflare CDN):** The UI (React + Tailwind) will be hosted on Cloudflare's global CDN. It ensures rapid loading and infinite scaling without server crashes.
- **Powerful Backend (Supabase + Edge Functions):** We use Supabase (PostgreSQL) for database, auth, and storage. All API and backend logic will run via Supabase Edge Functions (Deno Deploy) for globally distributed, fast responses.
- **Clear Separation (Frontend vs Backend):** React strictly handles the UI presentation, while Supabase handles heavy lifting (Auth, Database, API). This ensures decoupled architecture and maximum frontend performance without server-side rendering (SSR) complexities.
