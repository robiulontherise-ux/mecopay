import JSZip from 'jszip';

export const WORDPRESS_PLUGIN_PHP_CODE = `<?php
/**
 * Plugin Name: MecoPay Smart Dual-Gateway for WooCommerce
 * Plugin URI: https://mecopay.space
 * Description: High-Performance bKash, Nagad, Rocket, Upay & Card payment gateway with Smart Catalog Auto-Detection & Zero-Waste COD courier automation.
 * Version: 2.6.5
 * Author: MecoPay Team
 * Author URI: https://mecopay.space
 * Text Domain: mecopay-gateway
 * Domain Path: /languages
 * Requires at least: 5.4
 * Requires PHP: 7.4
 *
 * ============================================================================
 * [ARCHITECTURAL AUTO-DETECTION GUIDE FOR WOOCOMMERCE & EXISTING CATALOGS]
 * 1. 500+ Existing Products Auto-Detection:
 *    - Store owners do NOT need to edit old products or set any custom 'type'.
 *    - The plugin automatically queries WooCommerce core product properties:
 *      * Virtual / Downloadable (is_virtual() || is_downloadable()) = Digital Product (100% Online Payment)
 *      * Requires Shipping (needs_shipping()) = Physical Product (Advance or 100% COD)
 * 2. Advance Charge vs 100% COD:
 *    - If 'advance_amount' > 0: charges advance delivery fee online, rest COD.
 *    - If 'advance_amount' == 0: 100% Cash On Delivery (Just Form, zero gateway fee).
 * 3. Free Delivery / 0 Courier Fee:
 *    - If shipping total is 0 (Free Shipping), courier_charge is sent as 0 without error.
 * 4. Multi-Currency Ready:
 *    - Dynamically reads WooCommerce active currency via $order->get_currency().
 * 5. Cart Integrity Guard:
 *    - Prevents mixing digital + physical products in the same cart.
 * ============================================================================
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

add_action('plugins_loaded', 'mecopay_init_smart_gateway_class', 0);

function mecopay_init_smart_gateway_class() {
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    class WC_Gateway_MecoPay extends WC_Payment_Gateway {

        public function __construct() {
            $this->id                 = 'mecopay';
            $this->icon               = 'https://raw.githubusercontent.com/mecopay/assets/main/logo.png';
            $this->has_fields         = false;
            $this->method_title       = 'MecoPay Dual-Gateway';
            $this->method_description = 'Accept Personal MFS (TrxID) & Merchant Gateways (OTP/PIN) with Smart 500+ Catalog Auto-Detection and Zero-Waste COD.';
            $this->supports = array(
                'products',
                'refunds'
            );

            // Load Admin Settings & Hooks
            $this->init_form_fields();
            $this->init_settings();

            $this->title          = $this->get_option('title', 'bKash / Nagad / Cards (MecoPay)');
            $this->description    = $this->get_option('description', 'Pay securely using bKash, Nagad, Rocket, Upay or Debit/Credit Cards.');
            $this->api_key        = trim($this->get_option('api_key'));
            $this->advance_amount = (float) $this->get_option('advance_amount', 150);

            // Listeners
            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
            add_action('woocommerce_api_mecopay_webhook', array($this, 'handle_webhook'));

            // Single Digital Course & Mixed Cart Protection Filters
            add_action('woocommerce_check_cart_items', array($this, 'validate_cart_integrity'));
        }

        /**
         * Gateway Admin Configuration Form Fields
         */
        public function init_form_fields() {
            $this->form_fields = array(
                'enabled' => array(
                    'title'   => __('Enable/Disable', 'mecopay-gateway'),
                    'type'    => 'checkbox',
                    'label'   => __('Enable MecoPay Gateway', 'mecopay-gateway'),
                    'default' => 'yes'
                ),
                'title' => array(
                    'title'       => __('Method Title', 'mecopay-gateway'),
                    'type'        => 'text',
                    'description' => __('Payment method title visible to customers on Checkout.', 'mecopay-gateway'),
                    'default'     => __('bKash / Nagad / Cards (MecoPay)', 'mecopay-gateway'),
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => __('Description', 'mecopay-gateway'),
                    'type'        => 'textarea',
                    'description' => __('Payment instructions visible to customers.', 'mecopay-gateway'),
                    'default'     => __('Pay instantly using Personal MFS (TrxID) or Automatic Merchant Gateway (OTP/PIN).', 'mecopay-gateway'),
                ),
                'api_key' => array(
                    'title'       => __('MecoPay Live API Key', 'mecopay-gateway'),
                    'type'        => 'password',
                    'description' => __('Find your unique API Key in MecoPay Dashboard > Brand Settings.', 'mecopay-gateway'),
                    'default'     => '',
                    'placeholder' => 'mp_live_...',
                    'desc_tip'    => true,
                ),
                'advance_amount' => array(
                    'title'       => __('Physical Advance Amount (TK)', 'mecopay-gateway'),
                    'type'        => 'number',
                    'description' => __('ফিজিক্যাল প্রোডাক্টের জন্য অগ্রিম কত টাকা চার্জ করবেন (যেমন: ১৫০ টাকা ডেলিভারি ফি)। ১০০% ক্যাশ অন ডেলিভারি (Just Form) করতে চাইলে এখানে ০ লিখুন।', 'mecopay-gateway'),
                    'default'     => '150',
                    'desc_tip'    => true,
                ),
                'catalog_detection_info' => array(
                    'title'       => __('Smart Catalog Auto-Detection', 'mecopay-gateway'),
                    'type'        => 'title',
                    'description' => __('প্লাগিনটি আপনার স্টোরের ৫০০+ পুরোনো পণ্যের ভার্চুয়াল/ডাউনলোডযোগ্য প্রোপার্টি স্বয়ংক্রিয়ভাবে স্ক্যান করে ডিজিটাল এবং ফিজিক্যাল পণ্য আলাদা করে। কোনো পণ্য ম্যানুয়ালি এডিট করার প্রয়োজন নেই।', 'mecopay-gateway'),
                )
            );
        }

        /**
         * Cart Validation Rules:
         * 1. Max 1 Digital Product per order.
         * 2. Prohibit Mixed Cart (Physical + Digital in same order).
         */
        public function validate_cart_integrity() {
            if (is_admin() || !WC()->cart) return;

            $digital_count = 0;
            $physical_count = 0;

            foreach (WC()->cart->get_cart() as $cart_item) {
                $product = $cart_item['data'];
                if ($product->is_virtual() || $product->is_downloadable()) {
                    $digital_count += $cart_item['quantity'];
                } else {
                    $physical_count += $cart_item['quantity'];
                }
            }

            if ($digital_count > 1) {
                wc_add_notice(__('ডিজিটাল ফাইল ও পাসকোড সুরক্ষার স্বার্থে একবারে ১টির বেশি ডিজিটাল প্রোডাক্ট অর্ডার করা যাবে না।', 'mecopay-gateway'), 'error');
            }

            if ($digital_count > 0 && $physical_count > 0) {
                wc_add_notice(__('মিক্সড কার্ট নিষিদ্ধ: ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট একসাথে অর্ডার করা যাবে না। অনুগ্রহ করে আলাদা অর্ডার সম্পন্ন করুন।', 'mecopay-gateway'), 'error');
            }
        }

        /**
         * Process Order Payment
         */
        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            if (!$order) {
                return array('result' => 'fail', 'redirect' => '');
            }

            if (empty($this->api_key)) {
                wc_add_notice(__('MecoPay API Key কনফিগার করা নেই। অনুগ্রহ করে অ্যাডমিন প্যানেল চেক করুন।', 'mecopay-gateway'), 'error');
                return array('result' => 'fail', 'redirect' => '');
            }

            $total_amount = (float) $order->get_total();

            // =================================================================
            // ১. স্মার্ট কার্ট স্ক্যান: ৫০০+ পুরোনো পণ্যের বুলেটপ্রুফ অটো-ডিটেকশন
            // =================================================================
            // WooCommerce নেটিভ মেথড (is_virtual, is_downloadable, needs_shipping)
            // দিয়ে অতীতের সব পণ্য স্বয়ংক্রিয়ভাবে সনাক্ত করা হয়:
            $is_digital = true;
            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                if ($product) {
                    // যদি পণ্যটির শিপিং প্রয়োজন হয় অথবা ভার্চুয়াল/ডাউনলোডযোগ্য না হয় = ফিজিক্যাল
                    if ($product->needs_shipping() || (!$product->is_virtual() && !$product->is_downloadable())) {
                        $is_digital = false;
                        break;
                    }
                }
            }

            // =================================================================
            // ২. পে-লোড প্রস্তুতি (মাল্টি-কারেন্সি, ফ্রি ডেলিভারি ও অ্যাডভান্স/সিওডি চেকার)
            // =================================================================
            $first_item = reset($order->get_items());
            $first_product_name = $first_item ? $first_item->get_name() : ('Order #' . $order_id);
            
            // শিপিং ফি (ফ্রি ডেলিভারি হলে ০ থাকবে, কোনো এরর হবে না)
            $shipping_fee = (float) $order->get_shipping_total();

            // WooCommerce স্টোর কারেন্সি ডাইনামিকালি নেওয়া (BDT, USD, EUR ইত্যাদি)
            $order_currency = $order->get_currency();
            $advance_config = (float) $this->get_option('advance_amount', 150);

            $payload = array(
                'order_id'         => (string) $order_id,
                'product_name'     => $first_product_name,
                'currency'         => $order_currency,
                'customer_name'    => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
                'customer_phone'   => $order->get_billing_phone(),
                'customer_address' => trim($order->get_billing_address_1() . ', ' . $order->get_billing_city()),
                'callback_url'     => $this->get_return_url($order),
                'cancel_url'       => wc_get_checkout_url(),
            );

            if ($is_digital) {
                // ডিজিটাল প্রোডাক্ট: ১০০% ফুল পেমেন্ট
                $payload['product_type'] = 'digital';
                $payload['amount']       = $total_amount;
            } else {
                // ফিজিক্যাল প্রোডাক্ট চেকার: ১০০% সিওডি নাকি অ্যাডভান্স
                $payload['total_amount']   = $total_amount;
                $payload['courier_charge'] = $shipping_fee;

                if ($advance_config <= 0) {
                    // ১০০% ক্যাশ অন ডেলিভারি (Just Form): গেটওয়ে চার্জ ০
                    $payload['product_type'] = 'physical_cod';
                    $payload['amount']       = 0;
                    $payload['cod_due']      = $total_amount;
                } else {
                    // অ্যাডভান্স ডেলিভারি ফি চার্জ + বাকি টাকা COD
                    $advance_charge = min($advance_config, $total_amount);
                    $payload['product_type'] = 'physical_advance';
                    $payload['amount']       = $advance_charge;
                    $payload['cod_due']      = max(0, $total_amount - $advance_charge);
                }
            }

            // =================================================================
            // ৩. MecoPay Cloudflare Worker API-তে রিকোয়েস্ট পাঠানো
            // =================================================================
            $api_url = 'https://api.mecopay.space/v1/create-checkout';
            
            $response = wp_remote_post($api_url, array(
                'headers'     => array(
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $this->api_key,
                ),
                'body'        => wp_json_encode($payload),
                'timeout'     => 45,
                'data_format' => 'body'
            ));

            if (is_wp_error($response)) {
                wc_add_notice(__('MecoPay কানেকশন ত্রুটি: ', 'mecopay-gateway') . $response->get_error_message(), 'error');
                return array('result' => 'fail', 'redirect' => '');
            }

            $body = json_decode(wp_remote_retrieve_body($response), true);

            // সফল হলে কাস্টমারকে MecoPay স্মার্ট চেকআউট পেজে রিডাইরেক্ট করা
            if (!empty($body['checkout_url'])) {
                return array(
                    'result'   => 'success',
                    'redirect' => $body['checkout_url']
                );
            }

            // সরাসরি পেমেন্ট ছাড়া সম্পন্ন হলে (যেমন নো-পেমেন্ট বা ফুল সিঙ্ক)
            if (isset($body['requires_payment']) && $body['requires_payment'] === false) {
                $order->payment_complete();
                WC()->cart->empty_cart();
                return array(
                    'result'   => 'success',
                    'redirect' => $this->get_return_url($order)
                );
            }

            $error_message = $body['error'] ?? __('চেকআউট সেশন তৈরি করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।', 'mecopay-gateway');
            wc_add_notice($error_message, 'error');
            return array('result' => 'fail', 'redirect' => '');
        }

        /**
         * Webhook Handler: Real-time sync with MecoPay Dashboard
         * Listens to: https://your-site.com/?wc-api=mecopay_webhook
         */
        public function handle_webhook() {
            $input = file_get_contents('php://input');
            $event_data = json_decode($input, true);

            if (empty($event_data) || empty($event_data['event'])) {
                wp_send_json(array('status' => 'ignored', 'message' => 'No event specified'), 400);
                exit;
            }

            $event = $event_data['event'];

            // =================================================================
            // ইভেন্ট ১: ব্র্যান্ড সেটিংস ও গেটওয়ে স্ট্যাটাস রিয়েল-টাইম সিঙ্ক
            // =================================================================
            if ($event === 'brand.settings_updated') {
                $auto_courier = !empty($event_data['auto_courier_on_full_cod']);
                $personal_on  = isset($event_data['personal_api_active']) ? (bool)$event_data['personal_api_active'] : true;
                $merchant_on  = isset($event_data['merchant_api_active']) ? (bool)$event_data['merchant_api_active'] : false;

                set_transient('mecopay_auto_courier_status', $auto_courier, 0);
                set_transient('mecopay_gateways_active', ($personal_on || $merchant_on), 0);

                wp_send_json(array('status' => 'success', 'message' => 'Settings synced locally'), 200);
                exit;
            }

            // =================================================================
            // ইভেন্ট ২: পেমেন্ট সফল সম্পন্ন
            // =================================================================
            if ($event === 'payment.completed') {
                $order_id = $event_data['order_id'] ?? null;
                $trx_id   = $event_data['transaction_id'] ?? 'N/A';
                $order    = wc_get_order($order_id);

                if ($order) {
                    $order->payment_complete($trx_id);
                    $order->add_order_note(sprintf(__('MecoPay পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। TrxID: %s, চ্যানেল: %s', 'mecopay-gateway'), $trx_id, $event_data['payment_channel'] ?? 'MFS'));
                    
                    if (!empty($event_data['fb_passcode'])) {
                        $order->add_order_note('FB Passcode: ' . $event_data['fb_passcode']);
                    }
                }

                wp_send_json(array('status' => 'success'), 200);
                exit;
            }

            // =================================================================
            // ইভেন্ট ৩: কুরিয়ারে অটো পার্সেল বুকিং সম্পন্ন
            // =================================================================
            if ($event === 'order.courier_booked') {
                $order_id = $event_data['order_id'] ?? null;
                $courier  = $event_data['courier'] ?? array();
                $order    = wc_get_order($order_id);

                if ($order) {
                    $tracking_code = $courier['tracking_code'] ?? 'N/A';
                    $provider      = strtoupper($courier['provider'] ?? 'STEADFAST');
                    $order->add_order_note(sprintf(__('স্বয়ংক্রিয়ভাবে %s কুরিয়ারে পার্সেল বুক করা হয়েছে। ট্র্যাকিং কোড: %s', 'mecopay-gateway'), $provider, $tracking_code));
                }

                wp_send_json(array('status' => 'success'), 200);
                exit;
            }

            wp_send_json(array('status' => 'unhandled_event'), 200);
            exit;
        }
    }
}

// Register Gateway in WooCommerce
add_filter('woocommerce_payment_gateways', 'mecopay_add_smart_gateway_class');
function mecopay_add_smart_gateway_class($gateways) {
    $gateways[] = 'WC_Gateway_MecoPay';
    return $gateways;
}
`;

export const WORDPRESS_PLUGIN_README = `=== MecoPay Smart Dual-Gateway for WooCommerce ===
Contributors: mecopay
Tags: mecopay, bkash, nagad, rocket, upay, payment gateway, bangladesh, courier, steadfast, pathao
Requires at least: 5.4
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.6.5
License: GPLv2 or later

Accept Personal MFS (TrxID) & Merchant Gateways (OTP/PIN) with Smart 500+ Catalog Auto-Detection and Zero-Waste COD automation in Bangladesh.

== Description ==
MecoPay Smart Dual-Gateway allows WooCommerce stores in Bangladesh to accept payments seamlessly:
- Automatic 500+ Catalog Scanning: Detects virtual/downloadable digital products vs physical goods automatically.
- Free Shipping & Dynamic Multi-Currency (BDT, USD, EUR, GBP) supported out-of-the-box.
- Advance Delivery Charge or 100% COD Just-Form configuration.
- Single Digital Order Guard & Mixed-Cart Protection built-in.
- Real-time Webhook Synchronization for zero-waste worker invocations.

== Installation ==
1. Upload 'mecopay-woocommerce.zip' via WordPress Admin > Plugins > Add New > Upload Plugin.
2. Activate the plugin.
3. Go to WooCommerce > Settings > Payments > MecoPay Dual-Gateway.
4. Enter your MecoPay Live API Key from your MecoPay Dashboard.
5. Save changes.
`;

/**
 * Generates and downloads a clean mecopay-woocommerce.zip file directly in the browser
 */
export async function downloadWordPressPluginZip(): Promise<void> {
  const zip = new JSZip();
  
  // Create folder inside zip
  const folder = zip.folder('mecopay-woocommerce');
  if (folder) {
    folder.file('mecopay-gateway.php', WORDPRESS_PLUGIN_PHP_CODE);
    folder.file('readme.txt', WORDPRESS_PLUGIN_README);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'mecopay-woocommerce.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
