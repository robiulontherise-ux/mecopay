import JSZip from 'jszip';

export const WORDPRESS_PLUGIN_PHP_CODE = `<?php
/**
 * Plugin Name: MecoPay Smart Dual-Gateway for WooCommerce
 * Plugin URI: https://mecopay.space
 * Description: Secure MecoPay gateway with automatic WooCommerce product-type detection, advance/COD support, and signed webhook synchronization.
 * Version: 3.0.0
 * Author: MecoPay
 * Author URI: https://mecopay.space
 * Text Domain: mecopay-gateway
 * Domain Path: /languages
 * Requires at least: 5.4
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 * License: GPL-2.0+
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('plugins_loaded', 'mecopay_init_gateway', 0);

function mecopay_init_gateway() {
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    class WC_Gateway_MecoPay extends WC_Payment_Gateway {
        const API_URL = 'https://api.mecopay.space/v1/create-checkout';

        public function __construct() {
            $this->id                 = 'mecopay';
            $this->icon               = '';
            $this->has_fields         = false;
            $this->method_title       = __('MecoPay Dual-Gateway', 'mecopay-gateway');
            $this->method_description = __('Secure MecoPay payments for digital, physical advance, and full COD WooCommerce orders.', 'mecopay-gateway');
            $this->supports           = array('products');

            $this->init_form_fields();
            $this->init_settings();

            $this->title          = $this->get_option('title', 'bKash / Nagad / Rocket / Cards (MecoPay)');
            $this->description    = $this->get_option('description', 'Pay securely via MecoPay.');
            $this->enabled        = $this->get_option('enabled', 'yes');
            $this->api_key        = trim((string) $this->get_option('api_key', ''));
            $this->webhook_secret = trim((string) $this->get_option('webhook_secret', ''));
            $this->advance_amount = max(0, (float) $this->get_option('advance_amount', 150));

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
            add_action('woocommerce_api_mecopay_webhook', array($this, 'handle_webhook'));
            add_action('woocommerce_check_cart_items', array($this, 'validate_cart_integrity'));
        }

        public function init_form_fields() {
            $webhook_url = add_query_arg('wc-api', 'mecopay_webhook', home_url('/'));
            $this->form_fields = array(
                'enabled' => array(
                    'title' => __('Enable/Disable', 'mecopay-gateway'), 'type' => 'checkbox',
                    'label' => __('Enable MecoPay Gateway', 'mecopay-gateway'), 'default' => 'yes'
                ),
                'title' => array(
                    'title' => __('Method Title', 'mecopay-gateway'), 'type' => 'text',
                    'description' => __('Title shown to customers at checkout.', 'mecopay-gateway'),
                    'default' => __('bKash / Nagad / Rocket / Cards (MecoPay)', 'mecopay-gateway')
                ),
                'description' => array(
                    'title' => __('Description', 'mecopay-gateway'), 'type' => 'textarea',
                    'description' => __('Payment instructions shown to customers.', 'mecopay-gateway'),
                    'default' => __('Pay securely via MecoPay.', 'mecopay-gateway')
                ),
                'api_key' => array(
                    'title' => __('MecoPay Live API Key', 'mecopay-gateway'), 'type' => 'password',
                    'description' => __('Use the Brand API Key from MecoPay Dashboard.', 'mecopay-gateway'),
                    'default' => '', 'placeholder' => 'mp_live_...'
                ),
                'webhook_secret' => array(
                    'title' => __('Webhook Secret', 'mecopay-gateway'), 'type' => 'password',
                    'description' => __('Must match the webhook secret configured in MecoPay Dashboard. Required for signed payment confirmation.', 'mecopay-gateway'),
                    'default' => '', 'placeholder' => 'Shared webhook secret'
                ),
                'advance_amount' => array(
                    'title' => __('Physical Advance Amount', 'mecopay-gateway'), 'type' => 'number',
                    'description' => __('Advance amount for physical products. Set 0 for full COD.', 'mecopay-gateway'),
                    'default' => '150', 'custom_attributes' => array('min' => '0', 'step' => '0.01')
                ),
                'webhook_url_display' => array(
                    'title' => __('Webhook URL', 'mecopay-gateway'), 'type' => 'title',
                    'description' => '<code>' . esc_url($webhook_url) . '</code><br><small>' . esc_html__('Add this URL in MecoPay Dashboard > Webhook Settings.', 'mecopay-gateway') . '</small>'
                )
            );
        }

        public function validate_cart_integrity() {
            if (is_admin() || !WC()->cart) return;
            $digital_count = 0;
            $physical_count = 0;
            foreach (WC()->cart->get_cart() as $item) {
                $product = isset($item['data']) ? $item['data'] : null;
                if (!$product) continue;
                $quantity = max(1, (int) ($item['quantity'] ?? 1));
                if ($this->is_digital_product($product)) $digital_count += $quantity;
                else $physical_count += $quantity;
            }
            if ($digital_count > 1) {
                wc_add_notice(__('Only one digital product may be purchased per order.', 'mecopay-gateway'), 'error');
            }
            if ($digital_count > 0 && $physical_count > 0) {
                wc_add_notice(__('Digital and physical products cannot be mixed in one order.', 'mecopay-gateway'), 'error');
            }
        }

        private function is_digital_product($product) {
            return $product && ($product->is_virtual() || $product->is_downloadable()) && !$product->needs_shipping();
        }

        private function normalize_amount($value) {
            return max(0, (float) $value);
        }

        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            if (!$order) {
                wc_add_notice(__('Order not found.', 'mecopay-gateway'), 'error');
                return array('result' => 'failure');
            }
            if ($this->api_key === '') {
                wc_add_notice(__('MecoPay API Key is not configured.', 'mecopay-gateway'), 'error');
                return array('result' => 'failure');
            }

            $digital_count = 0;
            $physical_count = 0;
            $items = array();
            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                if (!$product) continue;
                $quantity = max(1, (int) $item->get_quantity());
                $is_digital = $this->is_digital_product($product);
                if ($is_digital) $digital_count += $quantity;
                else $physical_count += $quantity;
                $items[] = array(
                    'name' => $item->get_name(),
                    'quantity' => $quantity,
                    'type' => $is_digital ? 'digital' : 'physical',
                    'line_total' => (float) $item->get_total()
                );
            }
            if (($digital_count > 0 && $physical_count > 0) || $digital_count > 1) {
                wc_add_notice(__('This order violates the MecoPay cart rules.', 'mecopay-gateway'), 'error');
                return array('result' => 'failure');
            }

            $shipping_fee = $this->normalize_amount($order->get_shipping_total() + $order->get_shipping_tax());
            $total_amount = $this->normalize_amount($order->get_total());
            $merchandise_total = max(0, $total_amount - $shipping_fee);
            $payload = array(
                'order_id' => (string) $order_id,
                'product_name' => !empty($items[0]['name']) ? $items[0]['name'] : ('Order #' . $order_id),
                'product_type' => 'digital',
                'currency' => (string) $order->get_currency(),
                'customer_name' => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
                'customer_phone' => (string) $order->get_billing_phone(),
                'customer_email' => (string) $order->get_billing_email(),
                'customer_address' => trim($order->get_billing_address_1() . ', ' . $order->get_billing_city()),
                'callback_url' => $this->get_return_url($order),
                'cancel_url' => wc_get_checkout_url(),
                'metadata' => array('woocommerce_order_id' => (string) $order_id, 'items' => $items)
            );

            if ($digital_count > 0) {
                $payload['product_type'] = 'digital';
                $payload['amount'] = $total_amount;
            } else {
                $payload['total_amount'] = $merchandise_total;
                $payload['courier_charge'] = $shipping_fee;
                if ($this->advance_amount > 0 && $merchandise_total > 0) {
                    $advance = min($this->advance_amount, $merchandise_total);
                    $payload['product_type'] = 'physical_advance';
                    $payload['amount'] = $advance;
                    $payload['cod_due'] = max(0, $merchandise_total + $shipping_fee - $advance);
                } else {
                    $payload['product_type'] = 'physical_cod';
                    $payload['amount'] = 0;
                    $payload['cod_due'] = $merchandise_total + $shipping_fee;
                }
            }

            $response = wp_remote_post(self::API_URL, array(
                'timeout' => 45,
                'redirection' => 3,
                'headers' => array('Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . $this->api_key),
                'body' => wp_json_encode($payload),
                'data_format' => 'body'
            ));
            if (is_wp_error($response)) {
                wc_add_notice(__('Could not connect to MecoPay: ', 'mecopay-gateway') . $response->get_error_message(), 'error');
                return array('result' => 'failure');
            }
            $status = (int) wp_remote_retrieve_response_code($response);
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if ($status < 200 || $status >= 300 || !is_array($body) || empty($body['success'])) {
                wc_add_notice(is_array($body) && !empty($body['error']) ? sanitize_text_field($body['error']) : __('MecoPay could not create the checkout session.', 'mecopay-gateway'), 'error');
                return array('result' => 'failure');
            }
            if (!empty($body['invoice_id'])) $order->update_meta_data('_mecopay_invoice_id', sanitize_text_field($body['invoice_id']));
            if (!empty($body['invoice_number'])) $order->update_meta_data('_mecopay_invoice_number', sanitize_text_field($body['invoice_number']));
            $order->update_meta_data('_mecopay_product_type', sanitize_text_field($payload['product_type']));
            $order->save();

            if (isset($body['requires_payment']) && $body['requires_payment'] === false) {
                $order->update_status('processing', __('MecoPay full COD order confirmed.', 'mecopay-gateway'));
                WC()->cart->empty_cart();
                return array('result' => 'success', 'redirect' => $this->get_return_url($order));
            }
            if (!empty($body['checkout_url'])) {
                $order->update_status('pending', __('Awaiting MecoPay payment.', 'mecopay-gateway'));
                return array('result' => 'success', 'redirect' => esc_url_raw($body['checkout_url']));
            }
            wc_add_notice(__('MecoPay returned an invalid checkout response.', 'mecopay-gateway'), 'error');
            return array('result' => 'failure');
        }

        private function get_webhook_data($decoded) {
            if (!is_array($decoded)) return array();
            $data = isset($decoded['data']) && is_array($decoded['data']) ? $decoded['data'] : array();
            return array_merge($decoded, $data);
        }

        public function handle_webhook() {
            $raw = file_get_contents('php://input');
            $signature = isset($_SERVER['HTTP_X_MECOPAY_SIGNATURE']) ? trim((string) $_SERVER['HTTP_X_MECOPAY_SIGNATURE']) : '';
            if ($this->webhook_secret === '' || $signature === '') {
                status_header(401); wp_send_json(array('success' => false, 'error' => 'Webhook signature is required.'), 401);
            }
            $expected = hash_hmac('sha256', $raw, $this->webhook_secret);
            if (!hash_equals($expected, $signature)) {
                status_header(401); wp_send_json(array('success' => false, 'error' => 'Invalid webhook signature.'), 401);
            }
            $decoded = json_decode($raw, true);
            $data = $this->get_webhook_data($decoded);
            $event = isset($decoded['event']) ? sanitize_key($decoded['event']) : '';
            if ($event === 'brand.settings_updated') {
                set_transient('mecopay_gateways_active', !empty($data['payment_gateways_active']) || !empty($data['personal_api_active']) || !empty($data['merchant_api_active']), DAY_IN_SECONDS);
                wp_send_json(array('success' => true, 'status' => 'settings_synced'), 200);
            }
            if ($event !== 'payment.completed' && $event !== 'order.courier_booked') {
                wp_send_json(array('success' => true, 'status' => 'ignored'), 200);
            }

            $order_id = isset($data['order_id']) ? absint($data['order_id']) : 0;
            $invoice_number = isset($data['invoice_number']) ? sanitize_text_field($data['invoice_number']) : '';
            $order = $order_id ? wc_get_order($order_id) : false;
            if (!$order && $invoice_number) {
                $orders = wc_get_orders(array('limit' => 1, 'meta_key' => '_mecopay_invoice_number', 'meta_value' => $invoice_number));
                $order = !empty($orders) ? $orders[0] : false;
            }
            if (!$order) wp_send_json(array('success' => false, 'error' => 'Order not found.'), 404);

            $event_id = sanitize_text_field((string) ($data['transaction_id'] ?? $data['trx_id'] ?? $data['invoice_id'] ?? $invoice_number));
            if ($event_id !== '' && $order->get_meta('_mecopay_last_webhook_event') === $event_id) {
                wp_send_json(array('success' => true, 'status' => 'already_processed'), 200);
            }
            if ($event === 'payment.completed') {
                $status = strtolower((string) ($data['status'] ?? ''));
                if (!in_array($status, array('paid', 'completed', 'success', 'succeeded'), true)) {
                    wp_send_json(array('success' => false, 'error' => 'Payment is not successful.'), 422);
                }
                $expected_amount = (float) $order->get_total();
                $received_amount = isset($data['amount']) ? (float) $data['amount'] : 0;
                $product_type = (string) $order->get_meta('_mecopay_product_type');
                $valid_amount = $product_type === 'physical_advance' ? ($received_amount > 0 && $received_amount <= $expected_amount) : ($received_amount > 0 && abs($received_amount - $expected_amount) < 0.01);
                if (!$valid_amount && $product_type !== 'physical_cod') {
                    wp_send_json(array('success' => false, 'error' => 'Payment amount does not match the order.'), 422);
                }
                $order->payment_complete($event_id);
                $order->add_order_note(sprintf(__('MecoPay payment confirmed. Gateway: %s', 'mecopay-gateway'), sanitize_text_field((string) ($data['gateway_used'] ?? 'MecoPay'))));
            } else {
                $courier = isset($data['courier']) && is_array($data['courier']) ? $data['courier'] : array();
                $order->update_status('processing', __('MecoPay courier booking confirmed.', 'mecopay-gateway'));
                if (!empty($courier['tracking_code'])) $order->update_meta_data('_mecopay_tracking_code', sanitize_text_field($courier['tracking_code']));
                if (!empty($courier['tracking_url'])) $order->update_meta_data('_mecopay_tracking_url', esc_url_raw($courier['tracking_url']));
            }
            if ($event_id !== '') $order->update_meta_data('_mecopay_last_webhook_event', $event_id);
            $order->save();
            wp_send_json(array('success' => true, 'status' => 'processed', 'order_id' => $order->get_id()), 200);
        }
    }

    add_filter('woocommerce_payment_gateways', function ($methods) {
        $methods[] = 'WC_Gateway_MecoPay';
        return $methods;
    });
}
`;

export const WORDPRESS_PLUGIN_README = `=== MecoPay Smart Dual-Gateway for WooCommerce ===
Contributors: mecopay
Tags: mecopay, bkash, nagad, rocket, payment gateway, woocommerce, cod
Requires at least: 5.4
Tested up to: 6.7
Requires PHP: 7.4
Requires Plugins: woocommerce
Stable tag: 3.0.0
License: GPLv2 or later

Secure MecoPay WooCommerce gateway with automatic digital/physical product detection, physical advance/COD support, and HMAC-signed webhook synchronization.

== Installation ==
1. Upload the ZIP through WordPress Admin > Plugins > Add New > Upload Plugin.
2. Activate the plugin.
3. Go to WooCommerce > Settings > Payments > MecoPay.
4. Enter the Brand API Key from MecoPay Dashboard.
5. Enter the same Webhook Secret configured in MecoPay Dashboard.
6. Copy the displayed Webhook URL into MecoPay Dashboard > Webhook Settings.
7. Choose the physical advance amount; set it to 0 for full COD.

== Product type detection ==
- Virtual/downloadable products that do not need shipping are sent as digital.
- Shippable products use the configured advance amount for physical_advance, or physical_cod when it is 0.
- Digital and physical products cannot be mixed in one order.

== Security ==
Payment webhooks are accepted only with a valid X-MecoPay-Signature HMAC-SHA256 header. The plugin validates event status, order identity, amount, and duplicate delivery before updating an order.
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
