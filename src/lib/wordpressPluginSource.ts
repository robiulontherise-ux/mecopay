import JSZip from 'jszip';

export const WORDPRESS_PLUGIN_PHP_CODE = `<?php
/**
 * Plugin Name: MecoPay Smart Dual-Gateway for WooCommerce
 * Plugin URI: https://mecopay.space
 * Description: High-Performance bKash, Nagad, Rocket, Upay & Card payment gateway with Zero-Waste Full COD courier automation.
 * Version: 2.6.0
 * Author: MecoPay
 * Author URI: https://mecopay.space
 * Text Domain: mecopay-gateway
 * Domain Path: /languages
 * Requires at least: 5.4
 * Requires PHP: 7.4
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
            $this->method_description = 'Accept Personal MFS (TrxID) & Merchant Gateways (OTP/PIN) with Smart Cart Detection and Zero-Waste COD.';

            $this->supports = array(
                'products',
                'refunds'
            );

            $this->init_form_fields();
            $this->init_settings();

            $this->title       = $this->get_option('title', 'bKash / Nagad / Rocket / Cards (MecoPay)');
            $this->description = $this->get_option('description', 'Pay securely via bKash, Nagad, Rocket, Upay, or Cards.');
            $this->enabled     = $this->get_option('enabled', 'yes');
            $this->api_key     = trim($this->get_option('api_key', ''));

            // Actions & Webhooks
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
                    'default'     => __('Pay instantly using Personal MFS or Automatic Merchant Gateway.', 'mecopay-gateway'),
                ),
                'api_key' => array(
                    'title'       => __('MecoPay Live API Key', 'mecopay-gateway'),
                    'type'        => 'password',
                    'description' => __('Find your unique API Key in MecoPay Dashboard > Brand Settings.', 'mecopay-gateway'),
                    'default'     => '',
                    'placeholder' => 'mp_live_...',
                    'desc_tip'    => true,
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

            // ১. কার্ট স্ক্যান: ডিজিটাল নাকি ফিজিক্যাল প্রোডাক্ট
            $is_digital = true;
            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                if ($product && !$product->is_virtual() && !$product->is_downloadable()) {
                    $is_digital = false;
                    break;
                }
            }

            // ২. পে-লোড প্রস্তুতি
            $payload = array(
                'order_id'         => (string) $order_id,
                'customer_name'    => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
                'customer_phone'   => $order->get_billing_phone(),
                'customer_address' => trim($order->get_billing_address_1() . ', ' . $order->get_billing_city()),
                'callback_url'     => $this->get_return_url($order),
                'cancel_url'       => wc_get_checkout_url(),
            );

            if ($is_digital) {
                $payload['product_type'] = 'digital';
                $payload['product_name'] = 'Order #' . $order_id;
                $payload['amount']       = $total_amount;
            } else {
                // ফিজিক্যাল প্রোডাক্ট (অ্যাডভান্স ডেলিভারি চার্জ)
                $advance_charge = 150; // স্ট্যান্ডার্ড অ্যাডভান্স
                $payload['product_type'] = 'physical_advance';
                $payload['product_name'] = 'Physical Order #' . $order_id;
                $payload['total_amount'] = $total_amount;
                $payload['amount']       = min($advance_charge, $total_amount);
                $payload['cod_due']      = max(0, $total_amount - $payload['amount']);
            }

            // ৩. MecoPay Cloudflare Worker API-তে রিকোয়েস্ট পাঠানো
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
Stable tag: 2.6.0
License: GPLv2 or later

Accept Personal MFS (TrxID) & Merchant Gateways (OTP/PIN) with Smart Cart Detection and Zero-Waste COD automation in Bangladesh.

== Description ==
MecoPay Smart Dual-Gateway allows WooCommerce stores in Bangladesh to accept payments seamlessly:
- Automatic Cart Scanning: Identifies digital products and physical products.
- Single Digital Order Guard & Mixed-Cart Protection built-in.
- Advance Delivery Charge support for Physical Products.
- Real-time Webhook Synchronization for zero-waste worker invocations.

== Installation ==
1. Upload \`mecopay-woocommerce.zip\` via WordPress Admin > Plugins > Add New > Upload Plugin.
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
