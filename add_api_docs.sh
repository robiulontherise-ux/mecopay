sed -i '/<\/div>\n         <\/div>\n       )/i \
          <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">\
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Book className="w-5 h-5 text-blue-400" /> Developer Documentation</h3>\
            <div className="space-y-6">\
              <div>\
                <h4 className="text-md font-semibold text-slate-200 mb-2">1. WordPress Plugin Integration</h4>\
                <p className="text-sm text-slate-400">If you are using WordPress/WooCommerce, simply download our official MecoPay Plugin from the <strong>Apps / Plugin</strong> section. Install it on your site and paste your API Key in the plugin settings. You do not need to configure any Webhooks or Edge Functions manually.</p>\
              </div>\
              <div className="border-t border-slate-800 pt-6">\
                <h4 className="text-md font-semibold text-slate-200 mb-2">2. Custom Website Integration (REST API)</h4>\
                <p className="text-sm text-slate-400 mb-4">For custom-coded websites (PHP, Node.js, Python, React, etc.), your developer needs to call our Checkout Edge Function to initiate a payment.</p>\
                \
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-4">\
                  <p className="text-xs font-mono text-blue-400 mb-2">POST https://fwonuakvherzofqximno.supabase.co/functions/v1/check-out</p>\
                  <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">\
{`// Example Node.js Request\nconst response = await fetch("https://fwonuakvherzofqximno.supabase.co/functions/v1/check-out", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer YOUR_API_KEY" // Pass your brand API Key here\n  },\n  body: JSON.stringify({\n    amount: 1500,\n    customer_name: "John Doe",\n    customer_phone: "017XXXXXXXX",\n    redirect_url: "https://yourwebsite.com/success"\n  })\n});\n\nconst data = await response.json();\n// Redirect the user to data.checkout_url`}\
                  </div>\
                </div>\
                \
                <p className="text-sm text-slate-400">Our system will handle the UI, routing, and payment verification. Once the payment is successful, the user will be redirected back to your provided <code>redirect_url</code>.</p>\
              </div>\
              <div className="border-t border-slate-800 pt-6">\
                <h4 className="text-md font-semibold text-slate-200 mb-2">3. Verifying Payments via API (Optional)</h4>\
                <p className="text-sm text-slate-400 mb-4">If you need to verify a payment status server-side, you can call the verify-payment Edge Function with the Transaction ID (TrxID) or Invoice ID.</p>\
                \
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">\
                  <p className="text-xs font-mono text-emerald-400 mb-2">POST https://fwonuakvherzofqximno.supabase.co/functions/v1/verify-payment</p>\
                  <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">\
{`// Example Request\nconst response = await fetch("https://fwonuakvherzofqximno.supabase.co/functions/v1/verify-payment", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer YOUR_API_KEY"\n  },\n  body: JSON.stringify({\n    invoice_id: "INV-XXXXXXX", // or trx_id: "9J2K1L9M"\n  })\n});`}\
                  </div>\
                </div>\
              </div>\
            </div>\
          </div>' src/components/DashboardShell.tsx
