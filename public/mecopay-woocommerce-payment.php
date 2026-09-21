<?php
/**
 * Plugin Name: MecoPay Gateway for WooCommerce
 * Plugin URI: https://mecopay.shop
 * Description: MecoPay-এর মাধ্যমে আপনার ওয়েবসাইটে বিকাশ, নগদ, রকেট এবং অন্যান্য পেমেন্ট গ্রহণ করার জন্য প্রফেশনাল পেমেন্ট গেটওয়ে।
 * Version: 1.0.0
 * Author: Robiul Hasan
 * Author URI: https://mecopay.shop
 * Text Domain: mecopay
 */

// ডাইরেক্ট অ্যাক্সেস বন্ধ করার জন্য
if (!defined('ABSPATH')) {
    exit;
}

// WooCommerce লোড হওয়ার পর আমাদের প্লাগইন চালু হবে
add_action('plugins_loaded', 'init_mecopay_gateway_class');

/**
 * ১. WooCommerce Cart Validation Guard
 * কার্ট আইটেম চেক করে গ্রাহককে রিয়েল-টাইমে আটকে দেবে:
 */
add_action('woocommerce_check_cart_items', 'mecopay_validate_woocommerce_cart');
function mecopay_validate_woocommerce_cart() {
    if (!WC()->cart) return;

     = false;
      = false;
     = 0;

    foreach (WC()->cart->get_cart() as ) {
         = ['data'];
         = isset(['quantity']) ? intval(['quantity']) : 1;
        
        if ( && (->is_virtual() || ->is_downloadable())) {
             = true;
             += ;
        } else {
             = true;
        }
    }

    // নিয়ম ১: মিক্সড কার্ট প্রতিরোধ (ফিজিক্যাল + ডিজিটাল একসাথে নিষিদ্ধ)
    if ( && ) {
        wc_add_notice(
            __('দুঃখিত! ফিজিক্যাল এবং ডিজিটাল পণ্য একসাথে অর্ডার করা সম্ভব নয়। অনুগ্রহ করে যেকোনো একটি ক্যাটাগরির পণ্য সিলেক্ট করে আলাদা আলাদা অর্ডার সম্পন্ন করুন।', 'mecopay'),
            'error'
        );
    }

    // নিয়ম ২: সিঙ্গেল ডিজিটাল কোর্স নিয়ম (একবারে সর্বোচ্চ ১টি)
    if ( > 1) {
        wc_add_notice(
            __('ডিজিটাল কোর্স ও পাসকোড সুরক্ষার স্বার্থে একবারে ১টির বেশি ডিজিটাল প্রোডাক্ট অর্ডার করা সম্ভব নয়। অনুগ্রহ করে কার্ট থেকে অতিরিক্ত ডিজিটাল পণ্য রিমুভ করে সর্বোচ্চ ১টি রেখে অর্ডার করুন।', 'mecopay'),
            'error'
        );
    }
}


function init_mecopay_gateway_class() {
    // যদি WooCommerce ইন্সটল করা না থাকে, তবে প্লাগইন কাজ করবে না
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    class WC_Gateway_MecoPay extends WC_Payment_Gateway {

        public function __construct() {
            $this->id                 = 'mecopay';
            $this->icon               = $this->get_option('icon_url', ''); // পেমেন্ট মেথডের লোগো
            $this->has_fields         = false;
            $this->method_title       = 'MecoPay';
            $this->method_description = 'MecoPay-এর মাধ্যমে স্বয়ংক্রিয়ভাবে পেমেন্ট গ্রহণ করুন।';

            // অ্যাডমিন সেটিংস লোড করা
            $this->init_form_fields();
            $this->init_settings();

            // ভেরিয়েবল সেট করা
            $this->title          = $this->get_option('title');
            $this->description    = $this->get_option('description');
            $this->api_key        = $this->get_option('api_key');
            $this->enabled        = $this->get_option('enabled');

            // অ্যাডমিন প্যানেলে সেটিংস সেভ করার জন্য
            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));

            // Webhook/Callback রিসিভ করার জন্য API তৈরি (যাতে পেমেন্ট ভেরিফাই করা যায়)
            add_action('woocommerce_api_mecopay_webhook', array($this, 'handle_webhook'));
        }

        /**
         * ১. অ্যাডমিন প্যানেলের সেটিংস ফিল্ডগুলো তৈরি করা
         */
        public function init_form_fields() {
            $webhook_url = home_url('/wc-api/mecopay_webhook/');
            
            $this->form_fields = array(
                'enabled' => array(
                    'title'   => __('Enable/Disable', 'mecopay'),
                    'type'    => 'checkbox',
                    'label'   => __('Enable MecoPay Gateway', 'mecopay'),
                    'default' => 'yes'
                ),
                'title' => array(
                    'title'       => __('Title', 'mecopay'),
                    'type'        => 'text',
                    'description' => __('চেকআউট পেজে কাস্টমার এই নামটি দেখতে পাবে।', 'mecopay'),
                    'default'     => __('Pay securely via MecoPay (bKash, Nagad)', 'mecopay'),
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => __('Description', 'mecopay'),
                    'type'        => 'textarea',
                    'description' => __('চেকআউট পেজে কাস্টমার এই ডেসক্রিপশন দেখতে পাবে।', 'mecopay'),
                    'default'     => __('বিকাশ, নগদ বা রকেটের মাধ্যমে নিরাপদে পেমেন্ট করুন।', 'mecopay'),
                ),
                'api_key' => array(
                    'title'       => __('MecoPay API Key', 'mecopay'),
                    'type'        => 'text',
                    'description' => __('আপনার MecoPay ড্যাশবোর্ড থেকে প্রাপ্ত API Key এখানে বসান।', 'mecopay'),
                    'default'     => '',
                ),
                'webhook_info' => array(
                    'title'       => __('Webhook URL (Important)', 'mecopay'),
                    'type'        => 'title',
                    'description' => 'আপনার MecoPay ড্যাশবোর্ডে <strong>Webhook/Callback URL</strong> হিসেবে নিচের লিংকটি কপি করে বসান:<br/><code style="background:#f1f1f1; padding:5px; border-radius:3px; display:inline-block; margin-top:5px; font-size:14px; color:#d63638;">' . $webhook_url . '</code>',
                )
            );
        }

        /**
         * ২. পেমেন্ট প্রসেসিং (কাস্টমার 'Place Order' বাটনে ক্লিক করলে যা ঘটবে)
         */
        public function process_payment($order_id) {
            $order = wc_get_order($order_id);

            // আপনার Supabase Edge Function URL (পেমেন্ট তৈরি করার জন্য)
            $checkout_url = 'https://fwonuakvherzofqximno.supabase.co/functions/v1/check-out'; 

            // ডাটা যা Edge Function-এ পাঠানো হবে
            $payload = array(
                'api_key'      => $this->api_key,
                'order_id'     => $order->get_id(),
                'amount'       => $order->get_total(),
                'currency'     => $order->get_currency(),
                'cus_name'     => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
                'cus_email'    => $order->get_billing_email(),
                'cus_phone'    => $order->get_billing_phone(),
                'success_url'  => $this->get_return_url($order),
                'cancel_url'   => wc_get_checkout_url(),
            );

            // API-তে POST রিকোয়েস্ট পাঠানো
            $response = wp_remote_post($checkout_url, array(
                'headers' => array(
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $this->api_key
                ),
                'body'    => json_encode($payload),
                'timeout' => 30
            ));

            if (is_wp_error($response)) {
                wc_add_notice('Connection error with MecoPay. Please try again.', 'error');
                return;
            }

            $body = json_decode(wp_remote_retrieve_body($response), true);

            // যদি API সফলভাবে পেমেন্ট লিংক (payment_url) রিটার্ন করে
            if (isset($body['payment_url'])) {
                // পেমেন্ট পেজে যাওয়ার আগে অর্ডার স্ট্যাটাস 'pending payment' করা
                $order->update_status('pending', __('Awaiting MecoPay payment.', 'mecopay'));
                
                return array(
                    'result'   => 'success',
                    'redirect' => $body['payment_url'] // কাস্টমারকে পেমেন্ট পেজে পাঠিয়ে দেবে
                );
            } else {
                $error_message = isset($body['error']) ? $body['error'] : 'Unable to generate payment link.';
                wc_add_notice('MecoPay Error: ' . $error_message, 'error');
                return array(
                    'result'   => 'failure',
                    'redirect' => wc_get_checkout_url()
                );
            }
        }

        /**
         * ৩. পেমেন্ট ভেরিফিকেশন (Webhook/Callback রিসিভার)
         */
        public function handle_webhook() {
            // GET বা POST যেভাবেই ডাটা আসুক না কেন, order_id এবং transaction_id রিসিভ করা
            $order_id       = isset($_REQUEST['order_id']) ? intval($_REQUEST['order_id']) : 0;
            $transaction_id = isset($_REQUEST['transaction_id']) ? sanitize_text_field($_REQUEST['transaction_id']) : '';

            if (!$order_id || !$transaction_id) {
                status_header(400);
                exit('Invalid request: Missing Order ID or Transaction ID.');
            }

            $order = wc_get_order($order_id);
            if (!$order) {
                status_header(404);
                exit('Order not found.');
            }

            // যদি অর্ডারটি আগে থেকেই কমপ্লিট বা প্রসেসিং-এ থাকে, তবে আবার ভেরিফাই করার দরকার নেই
            if ($order->get_status() === 'processing' || $order->get_status() === 'completed') {
                status_header(200);
                exit('Order already paid.');
            }

            // আপনার Supabase Edge Function URL (পেমেন্ট ভেরিফাই করার জন্য)
            $verify_url = 'https://fwonuakvherzofqximno.supabase.co/functions/v1/verify-payment';

            $verify_payload = array(
                'api_key'        => $this->api_key,
                'order_id'       => $order_id,
                'transaction_id' => $transaction_id
            );

            // পেমেন্টটি আসলেই সফল হয়েছে কিনা তা যাচাই করতে আপনার সার্ভারে রিকোয়েস্ট পাঠানো
            $response = wp_remote_post($verify_url, array(
                'headers' => array(
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $this->api_key
                ),
                'body'    => json_encode($verify_payload),
                'timeout' => 30
            ));

            if (is_wp_error($response)) {
                status_header(500);
                exit('Failed to connect to verification server.');
            }

            $body = json_decode(wp_remote_retrieve_body($response), true);

            // যদি আপনার ভেরিফাই ফাংশন 'success' বা 'PAID' স্ট্যাটাস রিটার্ন করে
            if (isset($body['status']) && ($body['status'] == 'success' || $body['status'] == 'paid')) {
                // পেমেন্ট সফল, অর্ডার আপডেট করা
                $order->payment_complete($transaction_id);
                $order->add_order_note(sprintf(__('Payment successfully verified via MecoPay. Transaction ID: %s', 'mecopay'), $transaction_id));
                $order->reduce_order_stock();
                
                status_header(200);
                exit('Payment verified successfully.');
            } else {
                // পেমেন্ট ফেইল বা ইনভ্যালিড
                $order->update_status('failed', sprintf(__('Payment verification failed for Transaction ID: %s', 'mecopay'), $transaction_id));
                status_header(400);
                exit('Payment verification failed.');
            }
        }
    }

    // WooCommerce-এর পেমেন্ট মেথড লিস্টে MecoPay-কে যুক্ত করা
    function add_mecopay_gateway($methods) {
        $methods[] = 'WC_Gateway_MecoPay';
        return $methods;
    }
    add_filter('woocommerce_payment_gateways', 'add_mecopay_gateway');
}