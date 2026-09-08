import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json().catch(() => ({}))
    const { action, invoice_id } = payload

    if (action === 'get_secure_delivery') {
      if (!invoice_id) {
        throw new Error('Invoice ID is required')
      }

      // ১. ইনভয়েস, ব্র্যান্ড এবং পেমেন্ট লিংক ডেটা ফেচ করা
      const { data: invoice, error: invErr } = await supabaseClient
        .from('invoices')
        .select(`
          id,
          status,
          is_accessed,
          customer_name,
          customer_phone,
          customer_email,
          invoice_number,
          brand_id,
          redirect_link,
          payment_link_id,
          brands (
            id,
            name,
            logo_url
          ),
          payment_links (
            id,
            product_name,
            redirect_link,
            brand_id
          )
        `)
        .eq('id', invoice_id)
        .single()

      if (invErr || !invoice) {
        throw new Error('Invoice not found')
      }

      if (invoice.status !== 'Completed') {
        throw new Error('Payment not completed or verified yet')
      }

      const brand = invoice.brands || { name: 'Verified Merchant', logo_url: null }
      const pLink = Array.isArray(invoice.payment_links) ? invoice.payment_links[0] : invoice.payment_links
      const rawTarget = invoice.redirect_link || pLink?.redirect_link || ''

      let cleanLink = rawTarget.trim()
      if (cleanLink && !cleanLink.startsWith('http')) {
        cleanLink = 'https://' + cleanLink
      }

      const isTelegram = cleanLink.includes('t.me/') || cleanLink.toLowerCase().includes('telegram')
      const isTally = cleanLink.includes('tally.so/')

      let deliveryPayload: Record<string, any> = {
        brand_name: brand.name || 'Verified Merchant',
        brand_logo: brand.logo_url || null,
        product_title: pLink?.product_name || 'Digital Access',
        invoice_number: invoice.invoice_number,
        customer_name: invoice.customer_name || 'Valued Customer'
      }

      // ========================================================
      // ১. TELEGRAM: Master Bot দিয়ে ১-টাইম ইনভাইট লিংক তৈরি
      // ========================================================
      if (isTelegram) {
        const BOT_TOKEN = Deno.env.get('TELEGRAM_MASTER_BOT_TOKEN')
        let dynamicLink = cleanLink

        if (BOT_TOKEN) {
          try {
            // টেলিগ্রাম লিঙ্ক থেকে চ্যানেল/গ্রুপ ইউজারনেম বের করা (যেমন t.me/my_channel -> @my_channel)
            let chatId = cleanLink.replace('https://t.me/', '').replace('http://t.me/', '').split('/')[0].split('?')[0]
            if (chatId && !chatId.startsWith('@') && !chatId.startsWith('-100') && !chatId.startsWith('+')) {
              chatId = '@' + chatId
            }

            // টেলিগ্রাম API কল: ১ জন মেম্বার জয়েন করলেই লিংক এক্সপায়ার হয়ে যাবে
            const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createChatInviteLink`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                name: `Inv-${invoice.invoice_number}`,
                member_limit: 1, // One-time use only
                expire_date: Math.floor(Date.now() / 1000) + 86400 // ২৪ ঘণ্টা ভ্যালিডিটি
              })
            })

            const tgData = await tgRes.json()
            if (tgData.ok && tgData.result?.invite_link) {
              dynamicLink = tgData.result.invite_link
            } else {
              console.warn('Telegram Bot fallback warning:', tgData.description)
            }
          } catch (botErr) {
            console.error('Telegram Bot call failed:', botErr)
          }
        }

        deliveryPayload.delivery_type = 'telegram'
        deliveryPayload.one_time_invite_link = dynamicLink
      }

      // ========================================================
      // ২. TALLY: Iframe এর জন্য মাস্কড URL তৈরি (প্রিফিল সহ)
      // ========================================================
      else if (isTally) {
        const separator = cleanLink.includes('?') ? '&' : '?'
        const maskedIframeUrl = `${cleanLink}${separator}name=${encodeURIComponent(invoice.customer_name || '')}&phone=${encodeURIComponent(invoice.customer_phone || '')}&invoice=${encodeURIComponent(invoice.invoice_number || '')}&transparentBackground=1`

        deliveryPayload.delivery_type = 'tally'
        deliveryPayload.iframe_url = maskedIframeUrl
      }

      // ========================================================
      // ৩. অন্যান্য বা ফলব্যাক
      // ========================================================
      else {
        deliveryPayload.delivery_type = 'general'
        deliveryPayload.iframe_url = cleanLink
      }

      return new Response(JSON.stringify({ success: true, delivery: deliveryPayload }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    throw new Error('Invalid action')
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
