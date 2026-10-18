<?php
/**
 * Plugin Name: MecoPay Smart Dual-Gateway for WooCommerce
 * Plugin URI: https://mecopay.space
 * Description: High-Performance bKash, Nagad, Rocket, Upay & Card payment gateway with Zero-Waste Full COD courier automation and instant digital delivery portal. Fully synchronized with MecoPay API Worker & Edge Functions.
 * Version: 2.7.0
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
            $this->method_description = 'Accept Personal MFS (TrxID) & Merchant Gateways (OTP/PIN) with Smart Cart Detection, Instant Digital Delivery & Courier Tracking.';

            $this->supports = array(
                'products',
                'refunds'
            );

            $this->init_form_fields();
            $this->init_settings();

            $this->title          = $this->get_option('title', 'bKash / Nagad / Rocket / Cards (MecoPay)');
            $this->description    = $this->get_option('description', 'Pay securely via bKash, Nagad, Rocket, Upay, or Cards.');
            $this->enabled        = $this->get_option('enabled', 'yes');
            $this->api_key        = trim($this->get_option('api_key', ''));
            $this->api_endpoint   = trim($this->get_option('api_endpoint', 'https://api.mecopay.space/v1/create-checkout'));
            $this->webhook_secret = trim($this->get_option('webhook_secret', ''));

            // Actions & Webhooks
            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
            add_action('woocommerce_api_mecopay_webhook', array($this, 'handle_webhook'));
            add_action('woocommerce_thankyou_' . $this->id, array($this, 'thankyou_page'));
            add_action('woocommerce_order_details_after_order_table', array($this, 'display_order_details_access'), 20);

            // Single Digital Product & Mixed Cart Protection Filters
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
                ),
                'api_endpoint' => array(
                    'title'       => __('API Worker Endpoint', 'mecopay-gateway'),
                    'type'        => 'text',
                    'description' => __('MecoPay Cloudflare Worker Checkout URL.', 'mecopay-gateway'),
                    'default'     => 'https://api.mecopay.space/v1/create-checkout',
                    'placeholder' => 'https://api.mecopay.space/v1/create-checkout',
                    'desc_tip'    => true,
                ),
                'webhook_secret' => array(
                    'title'       => __('Webhook Signing Secret (Optional)', 'mecopay-gateway'),
                    'type'        => 'password',
                    'description' => __('Used to verify incoming HMAC SHA256 Webhooks from MecoPay Edge Functions.', 'mecopay-gateway'),
                    'default'     => '',
                    'desc_tip'    => true,
                ),
                'advance_amount' => array(
                    'title'       => __('Physical Advance Amount', 'mecopay-gateway'),
                    'type'        => 'number',
                    'description' => __('Enter advance fee to charge online for physical products (e.g. 150 TK delivery fee). Set 0 for 100% Cash On Delivery (Just Form).', 'mecopay-gateway'),
                    'default'     => '150',
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
         * Process Order Payment: Dispatches payload to MecoPay API Worker (/v1/create-checkout)
         */
        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            if (!$order) {
                return array('result' => 'fail', 'redirect' => '');
            }

            if (empty($this->api_key)) {
                wc_add_notice(__('MecoPay API Key কনফিগার করা নেই। অনুগ্রহ করে ওয়ার্ডপ্রেস অ্যাডমিন প্যানেল থেকে MecoPay সেটিংস চেক করুন।', 'mecopay-gateway'), 'error');
                return array('result' => 'fail', 'redirect' => '');
            }

            $total_amount = (float) $order->get_total();

            // ১. স্মার্ট কার্ট স্ক্যান: ডিজিটাল বনাম ফিজিক্যাল ডিটেকশন
            $is_digital = true;
            $items = $order->get_items();
            $cart_items_data = array();

            foreach ($items as $item) {
                $product = $item->get_product();
                $cart_items_data[] = array(
                    'product_id'   => $item->get_product_id(),
                    'product_name' => $item->get_name(),
                    'quantity'     => $item->get_quantity(),
                    'total'        => (float) $item->get_total(),
                );
                if ($product) {
                    if ($product->needs_shipping() || (!$product->is_virtual() && !$product->is_downloadable())) {
                        $is_digital = false;
                    }
                }
            }

            // ২. পে-লোড প্রস্তুতি (API Worker /v1/create-checkout এর সাথে শতভাগ ফিল্ড সামঞ্জস্যপূর্ণ)
            $first_item = reset($items);
            $first_product_name = $first_item ? $first_item->get_name() : ('Order #' . $order_id);
            $shipping_fee = (float) $order->get_shipping_total();
            $order_currency = $order->get_currency();
            $advance_config = (float) $this->get_option('advance_amount', 150);

            // API Worker expects success_url, order_id, customer info
            $return_url = $this->get_return_url($order);

            $payload = array(
                'order_id'         => (string) $order_id,
                'product_name'     => $first_product_name,
                'currency'         => $order_currency,
                'customer_name'    => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
                'customer_phone'   => $order->get_billing_phone(),
                'customer_email'   => $order->get_billing_email(),
                'customer_address' => trim($order->get_billing_address_1() . ' ' . $order->get_billing_address_2() . ', ' . $order->get_billing_city()),
                'success_url'     => $return_url,
                'cancel_url'       => wc_get_checkout_url(),
                'cart_items'       => $cart_items_data,
                'metadata'         => array(
                    'store_platform' => 'woocommerce',
                    'order_id'       => (string) $order_id,
                    'customer_id'    => $order->get_customer_id()
                )
            );

            if ($is_digital) {
                // ডিজিটাল প্রোডাক্ট: ১০০% ফুল পেমেন্ট
                $payload['product_type'] = 'digital';
                $payload['product_price'] = $total_amount;
            } else {
                // ফিজিক্যাল প্রোডাক্ট চেকার: ১০০% সিওডি নাকি অ্যাডভান্স
                $payload['product_price'] = $total_amount;
                $payload['courier_charge'] = $shipping_fee;

                if ($advance_config <= 0) {
                    // ১০০% ক্যাশ অন ডেলিভারি (Just Form): গেটওয়ে চার্জ ০
                    $payload['product_type'] = 'physical_cod';
                    $payload['product_price'] = $total_amount;
                    $payload['advance_amount'] = 0;
                } elseif ($advance_config >= ($total_amount + $shipping_fee)) {
                    // ফিজিক্যাল ফুল পেমেন্ট: পণ্য + কুরিয়ার চার্জ সম্পূর্ণ অনলাইনে
                    $payload['product_type'] = 'physical_full_payment';
                    $payload['product_price'] = $total_amount;
                } else {
                    // ফিজিক্যাল অ্যাডভান্স: আংশিক পেমেন্ট, বাকি টাকা COD
                    $advance_charge = $advance_config;
                    $payload['product_type'] = 'physical_advance';
                    $payload['product_price'] = $total_amount;
                    $payload['advance_amount'] = $advance_charge;
                }
            }

            // ৩. MecoPay API Worker-এ কল পাঠানো
            $api_url = !empty($this->api_endpoint) ? $this->api_endpoint : 'https://api.mecopay.space/v1/create-checkout';

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

            $status_code = wp_remote_retrieve_response_code($response);
            $body = json_decode(wp_remote_retrieve_body($response), true);

            // ইনভয়েস নম্বর বা সেশন ট্র্যাকিং লোকাল মেটাডাটাতে সংরক্ষণ
            if (!empty($body['invoice_number'])) {
                $order->update_meta_data('_mecopay_invoice_number', sanitize_text_field($body['invoice_number']));
                $order->save();
            }

            // রিডাইরেক্ট লিঙ্ক গ্রহণ (checkout_url অথবা payment_url)
            $checkout_url = !empty($body['checkout_url']) ? $body['checkout_url'] : (!empty($body['payment_url']) ? $body['payment_url'] : '');

            if (!empty($checkout_url)) {
                return array(
                    'result'   => 'success',
                    'redirect' => $checkout_url
                );
            }

            // সরাসরি পেমেন্ট ছাড়া সম্পন্ন হলে (যেমন নো-পেমেন্ট বা ফুল সিওডি ব্যাকগ্রাউন্ড বুকিং)
            if (isset($body['requires_payment']) && $body['requires_payment'] === false) {
                $order->payment_complete();
                WC()->cart->empty_cart();
                return array(
                    'result'   => 'success',
                    'redirect' => $this->get_return_url($order)
                );
            }

            $error_message = $body['error'] ?? __('চেকআউট সেশন তৈরি করা সম্ভব হয়নি (স্ট্যাটাস: ' . $status_code . ')। অনুগ্রহ করে পুনরায় চেষ্টা করুন।', 'mecopay-gateway');
            wc_add_notice($error_message, 'error');
            return array('result' => 'fail', 'redirect' => '');
        }

        /**
         * Webhook Handler: Real-time sync with MecoPay Edge Functions / Supabase
         * Listens to: https://your-site.com/?wc-api=mecopay_webhook
         */
        public function handle_webhook() {
            $input = file_get_contents('php://input');
            $event_data = json_decode($input, true);

            if (empty($event_data)) {
                wp_send_json(array('status' => 'ignored', 'message' => 'Empty payload'), 400);
                exit;
            }

            // ঐচ্ছিক HMAC সিগনেচার যাচাই (যদি Webhook Secret কনফিগার করা থাকে)
            if (!empty($this->webhook_secret)) {
                $signature = $_SERVER['HTTP_X_MECOPAY_SIGNATURE'] ?? $_SERVER['HTTP_X_SIGNATURE'] ?? '';
                if (!empty($signature)) {
                    $expected_signature = hash_hmac('sha256', $input, $this->webhook_secret);
                    if (!hash_equals($expected_signature, $signature)) {
                        wp_send_json(array('status' => 'error', 'message' => 'Invalid webhook signature'), 401);
                        exit;
                    }
                }
            }

            // ইভেন্ট নাম নির্ধারণ (সরাসরি 'event' বা 'data.event' বা 'type')
            $event = $event_data['event'] ?? ($event_data['type'] ?? '');
            $payload = !empty($event_data['data']) && is_array($event_data['data']) ? $event_data['data'] : $event_data;

            // -------------------------------------------------------------------------
            // ইভেন্ট ১: ব্র্যান্ড সেটিংস ও গেটওয়ে স্ট্যাটাস রিয়েল-টাইম সিঙ্ক
            // -------------------------------------------------------------------------
            if ($event === 'brand.settings_updated') {
                $auto_courier = !empty($payload['auto_courier_on_full_cod']);
                $personal_on  = isset($payload['personal_api_active']) ? (bool)$payload['personal_api_active'] : true;
                $merchant_on  = isset($payload['merchant_api_active']) ? (bool)$payload['merchant_api_active'] : false;

                set_transient('mecopay_auto_courier_status', $auto_courier, 0);
                set_transient('mecopay_gateways_active', ($personal_on || $merchant_on), 0);

                wp_send_json(array('status' => 'success', 'message' => 'Settings synced locally'), 200);
                exit;
            }

            // -------------------------------------------------------------------------
            // ইভেন্ট ২: পেমেন্ট সফল সম্পন্ন (payment.completed)
            // -------------------------------------------------------------------------
            if ($event === 'payment.completed') {
                // order_id গ্রহণ (payload এর রুট বা ডাটার ভেতর থেকে)
                $order_id = $payload['order_id'] ?? ($event_data['order_id'] ?? null);
                $trx_id   = $payload['trx_id'] ?? ($payload['transaction_id'] ?? 'N/A');
                $invoice  = $payload['invoice_number'] ?? ($payload['invoice_no'] ?? ($payload['invoice_id'] ?? ''));
                $channel  = $payload['gateway_used'] ?? ($payload['payment_channel'] ?? ($payload['gateway'] ?? 'MFS'));
                
                // ডিজিটাল এক্সেস ও সোশ্যাল লিংকস (FB Group / Google Drive / Telegram)
                $passcode = $payload['fb_passcode'] ?? ($payload['passcode'] ?? '');
                $fb_group = $payload['facebook_group_link'] ?? ($payload['fb_group'] ?? '');
                $drive_link = $payload['google_drive_link'] ?? ($payload['drive_link'] ?? '');
                $telegram_link = $payload['telegram_link'] ?? '';

                // ফিজিক্যাল অ্যাডভান্স ও কুরিয়ার ট্র্যাকিং
                $amount_paid = $payload['payable_amount'] ?? ($payload['amount_paid'] ?? ($payload['amount'] ?? 0));
                $cod_due = $payload['cod_due'] ?? null;
                $tracking_code = $payload['courier_tracking_code'] ?? ($payload['courier']['tracking_code'] ?? '');
                $tracking_url = $payload['tracking_url'] ?? ($payload['courier']['tracking_url'] ?? '');
                $courier_provider = $payload['courier']['provider'] ?? ($payload['courier_provider'] ?? '');

                $product_type = $payload['product_type'] ?? ($event_data['product_type'] ?? 'digital');
                $is_digital = ($product_type === 'digital');
                $order = $order_id ? wc_get_order($order_id) : null;

                if ($order) {
                    // অর্ডার স্ট্যাটাস পেইড মার্ক করা
                    $order->payment_complete($trx_id !== 'N/A' ? $trx_id : '');
                    
                    if (!empty($invoice)) {
                        $order->update_meta_data('_mecopay_invoice_number', sanitize_text_field($invoice));
                    }
                    if ($trx_id !== 'N/A') {
                        $order->update_meta_data('_mecopay_trx_id', sanitize_text_field($trx_id));
                    }
                    if (!empty($channel)) {
                        $order->update_meta_data('_mecopay_channel', sanitize_text_field($channel));
                    }
                    if ($is_digital && !empty($passcode)) {
                        $order->update_meta_data('_mecopay_passcode', sanitize_text_field($passcode));
                    }
                    if ($is_digital && !empty($fb_group)) {
                        $order->update_meta_data('_mecopay_fb_group', esc_url_raw($fb_group));
                    }
                    if ($is_digital && !empty($drive_link)) {
                        $order->update_meta_data('_mecopay_drive_link', esc_url_raw($drive_link));
                    }
                    if ($is_digital && !empty($telegram_link)) {
                        $order->update_meta_data('_mecopay_telegram_link', esc_url_raw($telegram_link));
                    }
                    if ($amount_paid > 0) {
                        $order->update_meta_data('_mecopay_advance_paid', sanitize_text_field($amount_paid));
                    }
                    if ($cod_due !== null) {
                        $order->update_meta_data('_mecopay_cod_due', sanitize_text_field($cod_due));
                    }
                    if (!empty($tracking_code)) {
                        $order->update_meta_data('_mecopay_courier_tracking', sanitize_text_field($tracking_code));
                    }
                    if (!empty($tracking_url)) {
                        $order->update_meta_data('_mecopay_courier_url', esc_url_raw($tracking_url));
                    }
                    if (!empty($courier_provider)) {
                        $order->update_meta_data('_mecopay_courier_provider', sanitize_text_field($courier_provider));
                    }

                    $order->save();

                    // সুস্পষ্ট অর্ডার নোট যুক্ত করা
                    $note = sprintf(
                        __('MecoPay পেমেন্ট সফলভাবে ভেরিফাইড হয়েছে। ইনভয়েস: %s, TrxID: %s, মেথড: %s', 'mecopay-gateway'),
                        !empty($invoice) ? $invoice : 'N/A',
                        $trx_id,
                        $channel
                    );
                    $order->add_order_note($note);

                    if (!empty($passcode)) {
                        $order->add_order_note(sprintf(__('ডিজিটাল এক্সেস পাসকোড: %s', 'mecopay-gateway'), $passcode));
                    }

                    wp_send_json(array_merge(
                        array(
                            'status' => 'success',
                            'message' => 'Payment processed successfully.',
                            'order_id' => $order_id,
                            'invoice_number' => $invoice,
                            'trx_id' => $trx_id,
                            'product_type' => $product_type,
                            'amount_paid' => $amount_paid,
                            'cod_due' => $cod_due,
                        ),
                        $is_digital
                            ? array(
                                'telegram_link' => $telegram_link,
                                'facebook_group_link' => $fb_group,
                                'google_drive_link' => $drive_link,
                                'passcode' => $passcode,
                                'digital_access' => array(
                                    'passcode' => $passcode,
                                    'telegram_link' => $telegram_link,
                                    'facebook_group_link' => $fb_group,
                                    'google_drive_link' => $drive_link,
                                ),
                            )
                            : array(
                                'tracking_code' => $tracking_code,
                                'tracking_url' => $tracking_url,
                                'courier_provider' => $courier_provider,
                                'courier' => array(
                                    'provider' => $courier_provider,
                                    'tracking_code' => $tracking_code,
                                    'tracking_url' => $tracking_url,
                                ),
                            )
                    ), 200);
                    exit;
                }

                wp_send_json(array('status' => 'error', 'message' => 'Order not found: ' . $order_id), 404);
                exit;
            }

            // -------------------------------------------------------------------------
            // ইভেন্ট ৩: কুরিয়ারে অটো পার্সেল বুকিং সম্পন্ন (order.courier_booked)
            // -------------------------------------------------------------------------
            if ($event === 'order.courier_booked') {
                $order_id = $payload['order_id'] ?? ($event_data['order_id'] ?? null);
                $courier  = $payload['courier'] ?? array();
                $order    = $order_id ? wc_get_order($order_id) : null;

                if ($order) {
                    $tracking_code = $courier['tracking_code'] ?? ($payload['courier_tracking_code'] ?? ($payload['tracking_code'] ?? 'N/A'));
                    $provider      = strtoupper($courier['provider'] ?? ($payload['courier_provider'] ?? ($payload['provider'] ?? 'STEADFAST')));
                    $tracking_url  = $courier['tracking_url'] ?? ($payload['tracking_url'] ?? '');
                    
                    $order->update_meta_data('_mecopay_courier_tracking', sanitize_text_field($tracking_code));
                    $order->update_meta_data('_mecopay_courier_provider', sanitize_text_field($provider));
                    if (!empty($tracking_url)) {
                        $order->update_meta_data('_mecopay_courier_url', esc_url_raw($tracking_url));
                    }
                    $order->save();

                    $order->add_order_note(sprintf(__('স্বয়ংক্রিয়ভাবে %s কুরিয়ারে পার্সেল বুক করা হয়েছে। ট্র্যাকিং কোড: %s', 'mecopay-gateway'), $provider, $tracking_code));

                    wp_send_json(array(
                        'status' => 'success',
                        'message' => 'Courier tracking updated successfully.',
                        'order_id' => $order_id,
                        'tracking_code' => $tracking_code,
                        'tracking_url' => $tracking_url,
                        'courier_provider' => $provider,
                        'courier' => array(
                            'provider' => $provider,
                            'tracking_code' => $tracking_code,
                            'tracking_url' => $tracking_url,
                        )
                    ), 200);
                    exit;
                }

                wp_send_json(array('status' => 'error', 'message' => 'Order not found: ' . $order_id), 404);
                exit;
            }

            wp_send_json(array('status' => 'unhandled_event', 'event' => $event), 200);
            exit;
        }

        /**
         * Customer Thank You Page Details (Payment Success Page)
         */
        public function thankyou_page($order_id) {
            $this->render_mecopay_success_card($order_id, 'thankyou');
        }

        /**
         * My Account > View Order Details (Customers can log in and see their orders & delivery)
         */
        public function display_order_details_access($order) {
            if (is_numeric($order)) {
                $order = wc_get_order($order);
            }
            if ($order) {
                $this->render_mecopay_success_card($order->get_id(), 'my_account');
            }
        }

        /**
         * Render High-Fidelity Success Card for Digital Delivery & Courier Tracking
         */
        private function render_mecopay_success_card($order_id, $context = 'thankyou') {
            $order = wc_get_order($order_id);
            if (!$order) return;

            $invoice       = $order->get_meta('_mecopay_invoice_number');
            $trx_id        = $order->get_meta('_mecopay_trx_id');
            $channel       = $order->get_meta('_mecopay_channel');
            $passcode      = $order->get_meta('_mecopay_passcode');
            $fb_group      = $order->get_meta('_mecopay_fb_group');
            $drive_link    = $order->get_meta('_mecopay_drive_link');
            $telegram_link = $order->get_meta('_mecopay_telegram_link');
            $tracking_code = $order->get_meta('_mecopay_courier_tracking');
            $provider      = $order->get_meta('_mecopay_courier_provider');
            $tracking_url  = $order->get_meta('_mecopay_courier_url');

            // কেবল MecoPay পেমেন্ট বা ট্র্যাকিং থাকলে কার্ড শো হবে
            if (empty($invoice) && empty($trx_id) && empty($tracking_code)) {
                return;
            }

            ?>
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1.5px solid #86efac; border-radius: 14px; padding: 22px; margin: 24px 0; box-shadow: 0 4px 16px rgba(22, 101, 52, 0.08); font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid #bbf7d0; padding-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: #22c55e; color: #fff; border-radius: 50%; font-size: 18px; font-weight: bold;">✓</span>
                        <div>
                            <h3 style="color: #14532d; margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -0.2px;">MecoPay পেমেন্ট ভেরিফাইড</h3>
                            <p style="color: #166534; margin: 2px 0 0 0; font-size: 13px;">আপনার অর্ডারটি সফলভাবে গৃহীত ও নিশ্চিত করা হয়েছে।</p>
                        </div>
                    </div>
                    <?php if (!empty($invoice)): ?>
                        <div style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 13px; padding: 4px 12px; border-radius: 20px; border: 1px solid #86efac;">
                            ইনভয়েস: <?php echo esc_html($invoice); ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- পেমেন্ট ইনফো গ্রিড -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px; font-size: 14px;">
                    <?php if (!empty($trx_id) && $trx_id !== 'N/A'): ?>
                        <div style="background: rgba(255,255,255,0.7); padding: 10px 14px; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <span style="color: #4b5563; font-size: 11px; text-transform: uppercase; font-weight: 700; display: block;">Transaction ID</span>
                            <strong style="color: #0f172a; font-family: monospace; font-size: 14px;"><?php echo esc_html($trx_id); ?></strong>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($channel)): ?>
                        <div style="background: rgba(255,255,255,0.7); padding: 10px 14px; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <span style="color: #4b5563; font-size: 11px; text-transform: uppercase; font-weight: 700; display: block;">Payment Gateway</span>
                            <strong style="color: #0f172a;"><?php echo esc_html($channel); ?></strong>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($tracking_code) && $tracking_code !== 'N/A'): ?>
                        <div style="background: rgba(255,255,255,0.7); padding: 10px 14px; border-radius: 8px; border: 1px solid #93c5fd;">
                            <span style="color: #1e40af; font-size: 11px; text-transform: uppercase; font-weight: 700; display: block;">Courier Delivery (<?php echo esc_html($provider ?: 'Steadfast'); ?>)</span>
                            <strong style="color: #1e3a8a; font-family: monospace; font-size: 14px;"><?php echo esc_html($tracking_code); ?></strong>
                            <?php if (!empty($tracking_url)): ?>
                                <a href="<?php echo esc_url($tracking_url); ?>" target="_blank" style="display: block; font-size: 12px; color: #2563eb; text-decoration: underline; margin-top: 2px;">পার্সেল ট্র্যাক করুন &rarr;</a>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- ডিজিটাল প্রোডাক্ট এক্সেস ও বাটন সেকশন -->
                <?php if (!empty($passcode) || !empty($fb_group) || !empty($drive_link) || !empty($telegram_link)): ?>
                    <div style="background: #ffffff; border: 1.5px dashed #10b981; border-radius: 10px; padding: 16px; margin-top: 14px;">
                        <h4 style="margin: 0 0 8px 0; color: #065f46; font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                            🎁 ডিজিটাল প্রোডাক্ট ডেলিভারি ও অ্যাক্সেস
                        </h4>
                        <p style="color: #374151; font-size: 13px; margin: 0 0 12px 0;">
                            আপনার কেনা ডিজিটাল কোর্সের পাসকোড ও এক্সেস লিংক নিচে দেওয়া হলো:
                        </p>

                        <?php if (!empty($passcode)): ?>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; background: #ecfdf5; padding: 10px 14px; border-radius: 8px;">
                                <span style="font-size: 13px; font-weight: 700; color: #047857;">ফেসবুক গ্রুপ পাসকোড:</span>
                                <code style="background: #059669; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 15px; font-weight: 900; letter-spacing: 1px; font-family: monospace;"><?php echo esc_html($passcode); ?></code>
                            </div>
                        <?php endif; ?>

                        <!-- অ্যাকশন বাটনসমূহ -->
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            <?php if (!empty($fb_group)): ?>
                                <a href="<?php echo esc_url($fb_group); ?>" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #1877f2; color: #ffffff; font-weight: 700; font-size: 13px; padding: 9px 18px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(24, 119, 242, 0.3);">
                                    📘 জয়েন ফেসবুক ভিআইপি গ্রুপ
                                </a>
                            <?php endif; ?>

                            <?php if (!empty($drive_link)): ?>
                                <a href="<?php echo esc_url($drive_link); ?>" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #0f9d58; color: #ffffff; font-weight: 700; font-size: 13px; padding: 9px 18px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(15, 157, 88, 0.3);">
                                    📁 গুগল ড্রাইভ ফাইল ডাউনলোড
                                </a>
                            <?php endif; ?>

                            <?php if (!empty($telegram_link)): ?>
                                <a href="<?php echo esc_url($telegram_link); ?>" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #229ed9; color: #ffffff; font-weight: 700; font-size: 13px; padding: 9px 18px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(34, 158, 217, 0.3);">
                                    ✈️ টেলিগ্রাম কমিউনিটি
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endif; ?>

            </div>
            <?php
        }
    }
}

// Register Gateway in WooCommerce
add_filter('woocommerce_payment_gateways', 'mecopay_add_smart_gateway_class');
function mecopay_add_smart_gateway_class($gateways) {
    $gateways[] = 'WC_Gateway_MecoPay';
    return $gateways;
}
