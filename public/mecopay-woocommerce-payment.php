<?php
/**
 * Plugin Name: MecoPay Payment Gateway for WooCommerce
 * Plugin URI: https://mecopay.space
 * Description: Official MecoPay Payment Gateway for WooCommerce. Supports Instant Digital Delivery, Advance Delivery Charge for COD, Full 100% COD Auto-Sync, and Automated Webhook Order Confirmation.
 * Version: 2.0.0
 * Author: MecoPay Team
 * Author URI: https://mecopay.space
 * Text Domain: mecopay-woocommerce
 * Domain Path: /languages
 * License: GPL-2.0+
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Make sure WooCommerce is active
add_action('plugins_loaded', 'init_mecopay_woocommerce_gateway', 0);

/**
 * 1. WooCommerce Cart Validation Guard
 * Checks cart items and restricts:
 * - Mixed Cart: Physical + Digital items together are strictly forbidden.
 * - Multiple Digital Items: Customer cannot order more than 1 digital item/course at once.
 */
add_action('woocommerce_check_cart_items', 'mecopay_validate_woocommerce_cart');
function mecopay_validate_woocommerce_cart() {
    if (!WC()->cart) return;

    $has_physical = false;
    $has_digital  = false;
    $digital_count = 0;

    foreach (WC()->cart->get_cart() as $cart_item) {
        $product = $cart_item['data'];
        $qty = isset($cart_item['quantity']) ? intval($cart_item['quantity']) : 1;
        
        if ($product && ($product->is_virtual() || $product->is_downloadable())) {
            $has_digital = true;
            $digital_count += $qty;
        } else {
            $has_physical = true;
        }
    }

    // Rule 1: Mixed Cart Prevention (ফিজিক্যাল ও ডিজিটাল পণ্য একসাথে অর্ডার নিষিদ্ধ)
    if ($has_physical && $has_digital) {
        wc_add_notice(
            __('দুঃখিত! ফিজিক্যাল এবং ডিজিটাল পণ্য একসাথে অর্ডার করা সম্ভব নয়। অনুগ্রহ করে যেকোনো একটি ক্যাটাগরির পণ্য সিলেক্ট করে আলাদা আলাদা অর্ডার সম্পন্ন করুন।', 'mecopay-woocommerce'),
            'error'
        );
    }

    // Rule 2: Single Digital Course/Product Only (ডিজিটাল কোর্স বা পণ্য একবারে সর্বোচ্চ ১টি)
    if ($digital_count > 1) {
        wc_add_notice(
            __('ডিজিটাল কোর্স ও পাসকোড সুরক্ষার স্বার্থে একবারে ১টির বেশি ডিজিটাল প্রোডাক্ট অর্ডার করা সম্ভব নয়। অনুগ্রহ করে কার্ট থেকে অতিরিক্ত ডিজিটাল পণ্য রিমুভ করে সর্বোচ্চ ১টি রেখে অর্ডার করুন।', 'mecopay-woocommerce'),
            'error'
        );
    }
}

function init_mecopay_woocommerce_gateway() {
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    class WC_Gateway_MecoPay extends WC_Payment_Gateway {

        public function __construct() {
            $this->id                 = 'mecopay';
            $this->icon               = apply_filters('woocommerce_mecopay_icon', '');
            $this->has_fields         = false;
            $this->method_title       = __('MecoPay (bKash, Nagad, Rocket, Cards)', 'mecopay-woocommerce');
            $this->method_description = __('Automated payment gateway supporting Digital Products (100% full pay), Physical Products (Advance Delivery Charge + COD), and 100% COD Auto-Sync.', 'mecopay-woocommerce');

            // Load settings
            $this->init_form_fields();
            $this->init_settings();

            // Define user configurable variables
            $this->title          = $this->get_option('title', 'Pay via MecoPay (bKash / Nagad / Rocket)');
            $this->description    = $this->get_option('description', 'Pay securely using bKash, Nagad, Rocket, or Mobile Banking.');
            $this->api_key        = $this->get_option('api_key');
            $this->webhook_secret = $this->get_option('webhook_secret');
            $this->advance_charge = floatval($this->get_option('advance_charge', 100));
            $this->enable_advance = $this->get_option('enable_advance', 'yes') === 'yes';
            $this->api_endpoint   = $this->get_option('api_endpoint', 'https://fwonuakvherzofqximno.supabase.co/functions/v1/check-out');

            // Actions
            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
            
            // Webhook handler hook
            add_action('woocommerce_api_mecopay_webhook', array($this, 'check_mecopay_webhook'));
        }

        /**
         * Initialize Gateway Settings Form Fields
         */
        public function init_form_fields() {
            $webhook_url = add_query_arg('wc-api', 'mecopay_webhook', home_url('/'));

            $this->form_fields = array(
                'enabled' => array(
                    'title'   => __('Enable/Disable', 'mecopay-woocommerce'),
                    'type'    => 'checkbox',
                    'label'   => __('Enable MecoPay Gateway', 'mecopay-woocommerce'),
                    'default' => 'yes'
                ),
                'title' => array(
                    'title'       => __('Title', 'mecopay-woocommerce'),
                    'type'        => 'text',
                    'description' => __('Payment method title that the customer sees during checkout.', 'mecopay-woocommerce'),
                    'default'     => __('bKash, Nagad, Rocket (MecoPay)', 'mecopay-woocommerce'),
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => __('Description', 'mecopay-woocommerce'),
                    'type'        => 'textarea',
                    'description' => __('Payment method description that the customer sees during checkout.', 'mecopay-woocommerce'),
                    'default'     => __('Pay instantly with bKash, Nagad, Rocket or Card.', 'mecopay-woocommerce'),
                ),
                'api_key' => array(
                    'title'       => __('Brand API Key', 'mecopay-woocommerce'),
                    'type'        => 'password',
                    'description' => __('Paste your Brand API Key generated from MecoPay Dashboard > API Keys.', 'mecopay-woocommerce'),
                    'default'     => '',
                ),
                'webhook_secret' => array(
                    'title'       => __('Webhook Secret Key', 'mecopay-woocommerce'),
                    'type'        => 'password',
                    'description' => __('Paste your Webhook Secret from MecoPay Dashboard > Webhook Settings.', 'mecopay-woocommerce'),
                    'default'     => '',
                ),
                'enable_advance' => array(
                    'title'       => __('Advance Delivery Charge for Physical Items', 'mecopay-woocommerce'),
                    'type'        => 'checkbox',
                    'label'       => __('Collect Advance Delivery Charge for physical products and keep rest as COD.', 'mecopay-woocommerce'),
                    'default'     => 'yes',
                ),
                'advance_charge' => array(
                    'title'       => __('Advance Charge Amount (BDT)', 'mecopay-woocommerce'),
                    'type'        => 'number',
                    'description' => __('Amount in BDT to charge in advance (e.g. 100 or 150 BDT delivery fee).', 'mecopay-woocommerce'),
                    'default'     => '100',
                ),
                'webhook_url_display' => array(
                    'title'       => __('Your Webhook Payload URL', 'mecopay-woocommerce'),
                    'type'        => 'title',
                    'description' => '<code>' . esc_url($webhook_url) . '</code><br/><small style="color: #64748b;">Copy this URL and paste it into MecoPay Dashboard > Webhook Settings for your Brand.</small>',
                ),
                'api_endpoint' => array(
                    'title'       => __('MecoPay Check-out API Endpoint', 'mecopay-woocommerce'),
                    'type'        => 'text',
                    'description' => __('Supabase Edge Function URL for check-out.', 'mecopay-woocommerce'),
                    'default'     => 'https://fwonuakvherzofqximno.supabase.co/functions/v1/check-out',
                )
            );
        }

        /**
         * Process Order Payment
         */
        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            if (!$order) {
                wc_add_notice(__('Order not found.', 'mecopay-woocommerce'), 'error');
                return;
            }

            // 1. Scan Cart / Order Items to detect product type
            $has_physical = false;
            $has_digital  = false;
            $digital_item_count = 0;

            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                $qty = $item->get_quantity();
                if ($product && ($product->is_virtual() || $product->is_downloadable())) {
                    $has_digital = true;
                    $digital_item_count += $qty;
                } else {
                    $has_physical = true;
                }
            }

            // Strict Validation 1: Mixed Physical & Digital Cart Block
            if ($has_physical && $has_digital) {
                wc_add_notice(__('দুঃখিত! ফিজিক্যাল এবং ডিজিটাল পণ্য একসাথে অর্ডার করা সম্ভব নয়। অনুগ্রহ করে যেকোনো একটি ক্যাটাগরির পণ্য সিলেক্ট করে আলাদা আলাদা অর্ডার করুন।', 'mecopay-woocommerce'), 'error');
                return array(
                    'result'   => 'failure',
                    'redirect' => wc_get_checkout_url()
                );
            }

            // Strict Validation 2: Multiple Digital Courses / Products Block
            if ($digital_item_count > 1) {
                wc_add_notice(__('ডিজিটাল কোর্স ও পাসকোড সুরক্ষার স্বার্থে একবারে ১টির বেশি ডিজিটাল প্রোডাক্ট অর্ডার করা সম্ভব নয়। অনুগ্রহ করে ১টি রেখে বাকিগুলো রিমুভ করে অর্ডার করুন।', 'mecopay-woocommerce'), 'error');
                return array(
                    'result'   => 'failure',
                    'redirect' => wc_get_checkout_url()
                );
            }

            $total_amount = floatval($order->get_total());
            $order_type   = 'digital';
            $payable_amount = $total_amount;

            if ($has_physical) {
                if ($this->enable_advance && $this->advance_charge > 0 && $total_amount > $this->advance_charge) {
                    $order_type     = 'physical_advance';
                    $payable_amount = $this->advance_charge;
                } else {
                    $order_type     = 'physical_cod';
                    $payable_amount = 0;
                }
            }

            // 2. Prepare Payload for MecoPay check-out Edge Function
            $customer_name  = trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name());
            $customer_phone = $order->get_billing_phone();
            $customer_email = $order->get_billing_email();
            $customer_addr  = trim($order->get_billing_address_1() . ', ' . $order->get_billing_city());

            $payload = array(
                'order_id'         => (string) $order_id,
                'order_type'       => $order_type,
                'amount'           => $payable_amount,
                'total_amount'     => $total_amount,
                'advance_amount'   => ($order_type === 'physical_advance') ? $this->advance_charge : 0,
                'customer_name'    => !empty($customer_name) ? $customer_name : 'Valued Customer',
                'customer_phone'   => $customer_phone,
                'customer_email'   => $customer_email,
                'customer_address' => $customer_addr,
                'redirect_url'     => $this->get_return_url($order),
                'cancel_url'       => wc_get_checkout_url(),
                'metadata'         => array(
                    'wc_order_id'  => $order_id,
                    'currency'     => get_woocommerce_currency(),
                    'platform'     => 'WooCommerce',
                    'version'      => '2.0.0'
                )
            );

            // 3. Call MecoPay Edge Function
            $response = wp_remote_post($this->api_endpoint, array(
                'method'      => 'POST',
                'timeout'     => 30,
                'redirection' => 5,
                'httpversion' => '1.1',
                'blocking'    => true,
                'headers'     => array(
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . trim($this->api_key),
                ),
                'body'        => json_encode($payload),
            ));

            if (is_wp_error($response)) {
                wc_add_notice(__('Connection error to MecoPay server: ', 'mecopay-woocommerce') . $response->get_error_message(), 'error');
                return;
            }

            $status_code = wp_remote_retrieve_response_code($response);
            $body        = json_decode(wp_remote_retrieve_body($response), true);

            if ($status_code !== 200 || empty($body['success'])) {
                $err_msg = !empty($body['error']) ? $body['error'] : __('Unable to initiate payment with MecoPay.', 'mecopay-woocommerce');
                wc_add_notice($err_msg, 'error');
                return;
            }

            // Save Invoice ID in Order Meta
            if (!empty($body['invoice_id'])) {
                $order->update_meta_data('_mecopay_invoice_id', $body['invoice_id']);
                $order->update_meta_data('_mecopay_order_type', $order_type);
                $order->save();
            }

            // 4. Handle Case: 100% Cash on Delivery
            if ($order_type === 'physical_cod' || empty($body['checkout_url'])) {
                $order->update_status('processing', __('Order confirmed via 100% Cash on Delivery (MecoPay auto-synced).', 'mecopay-woocommerce'));
                WC()->cart->empty_cart();
                return array(
                    'result'   => 'success',
                    'redirect' => $this->get_return_url($order),
                );
            }

            // 5. Handle Case: Payment Required (Digital or Advance)
            $order->update_status('pending', sprintf(
                __('Awaiting MecoPay payment (Amount: %s BDT). Invoice: %s', 'mecopay-woocommerce'),
                $payable_amount,
                !empty($body['invoice_number']) ? $body['invoice_number'] : $body['invoice_id']
            ));

            return array(
                'result'   => 'success',
                'redirect' => $body['checkout_url'],
            );
        }

        /**
         * Webhook Listener for MecoPay Payment Notifications
         */
        public function check_mecopay_webhook() {
            @ob_clean();
            header('HTTP/1.1 200 OK');
            header('Content-Type: application/json');

            $raw_input = file_get_contents('php://input');
            if (empty($raw_input)) {
                echo json_encode(array('error' => 'No payload received'));
                exit;
            }

            // 1. Verify HMAC Signature
            $received_signature = isset($_SERVER['HTTP_X_MECOPAY_SIGNATURE']) ? sanitize_text_field($_SERVER['HTTP_X_MECOPAY_SIGNATURE']) : '';
            
            if (!empty($this->webhook_secret) && !empty($received_signature)) {
                $expected_signature = hash_hmac('sha256', $raw_input, trim($this->webhook_secret));
                if (!hash_equals($expected_signature, $received_signature)) {
                    header('HTTP/1.1 401 Unauthorized');
                    echo json_encode(array('error' => 'Invalid HMAC Signature'));
                    exit;
                }
            }

            $data = json_decode($raw_input, true);
            if (empty($data) || empty($data['data'])) {
                echo json_encode(array('error' => 'Malformed payload'));
                exit;
            }

            $event_data = $data['data'];
            $order_id   = !empty($event_data['order_id']) ? intval($event_data['order_id']) : 0;

            if (!$order_id) {
                // Try searching by invoice_id
                $invoice_id = !empty($event_data['invoice_id']) ? sanitize_text_field($event_data['invoice_id']) : '';
                if (!empty($invoice_id)) {
                    $orders = wc_get_orders(array(
                        'meta_key'   => '_mecopay_invoice_id',
                        'meta_value' => $invoice_id,
                        'limit'      => 1
                    ));
                    if (!empty($orders)) {
                        $order_id = $orders[0]->get_id();
                    }
                }
            }

            if (!$order_id) {
                echo json_encode(array('error' => 'Order not found'));
                exit;
            }

            $order = wc_get_order($order_id);
            if (!$order) {
                echo json_encode(array('error' => 'Order instance could not be loaded'));
                exit;
            }

            $trx_id       = !empty($event_data['trx_id']) ? sanitize_text_field($event_data['trx_id']) : 'N/A';
            $gateway_used = !empty($event_data['gateway_used']) ? sanitize_text_field($event_data['gateway_used']) : 'MecoPay';
            $paid_amount  = !empty($event_data['amount']) ? floatval($event_data['amount']) : 0;

            // Mark Order as Paid / Processing
            $order->payment_complete($trx_id);
            $order->add_order_note(sprintf(
                __('MecoPay Payment Confirmed via Webhook! Gateway: %s | TrxID: %s | Paid Amount: %s BDT', 'mecopay-woocommerce'),
                $gateway_used,
                $trx_id,
                $paid_amount
            ));

            echo json_encode(array('success' => true, 'order_id' => $order_id, 'status' => 'confirmed'));
            exit;
        }
    }

    /**
     * Add MecoPay to WooCommerce Gateways
     */
    function add_mecopay_gateway_class($methods) {
        $methods[] = 'WC_Gateway_MecoPay';
        return $methods;
    }
    add_filter('woocommerce_payment_gateways', 'add_mecopay_gateway_class');
}
