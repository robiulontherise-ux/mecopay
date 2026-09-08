import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

# Replace handleDownloadJsonConfig logic to focus strictly on Universal Master Config
old_func = """      const handleDownloadJsonConfig = (targetBrandId: string) => {
        const isMaster = targetBrandId === 'all' || !targetBrandId;
        const brand = brands.find(b => b.id === targetBrandId);
        const userId = user?.id || 'demo_user';
        const apiKey = `mecopay_live_${userId}_${Math.random().toString(36).substring(2, 8)}`;

        const configData = {
          version: 1,
          appName: "MecoPay Universal SMS Sync",
          mode: isMaster ? "Universal (All Brands)" : `Single Brand (${brand?.name || 'Brand'})`,
          userId: userId,
          brandId: isMaster ? "ALL_BRANDS" : brand?.id,
          generatedAt: new Date().toISOString(),
          routing_parameters: {
            sender: "*",
            sender_regex: false,
            text_filter: "(bKash|Nagad|Rocket|Upay|CellFin|16216|16167|16216|TrxID|TxnID|amount|Tk|Tk.)",
            webhook_url: `${window.location.origin}/api/v1/sms/webhook`,
            sim_slot: "any",
            json_payload_template: JSON.stringify({
              from: "%from%",
              text: "%text%",
              sentStamp: "%sentStamp%",
              receivedStamp: "%receivedStamp%",
              sim: "%sim%",
              user_id: userId,
              brand_id: isMaster ? "AUTO_MATCH" : brand?.id
            }, null, 2),
            headers: {
              "User-Agent": "MecoPay-SMS-Forwarder/1.0",
              "Content-Type": "application/json",
              "X-MecoPay-User-ID": userId,
              "X-MecoPay-Brand-ID": isMaster ? "ALL" : (brand?.id || "ALL"),
              "X-MecoPay-Api-Key": apiKey
            },
            retries: 10,
            ignore_ssl_errors: false,
            store_failed_messages: true,
            heartbeat: {
              enabled: true,
              interval_minutes: 5,
              heartbeat_url: `${window.location.origin}/api/v1/sms/ping?user_id=${userId}`
            }
          }
        };

        const jsonString = JSON.stringify(configData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = isMaster 
          ? `mecopay_master_config_all_brands.json` 
          : `mecopay_config_${(brand?.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };"""

new_func = """      const handleDownloadJsonConfig = () => {
        const userId = user?.id || 'demo_user';
        const apiKey = `mecopay_live_${userId.substring(0, 8)}_${Math.random().toString(36).substring(2, 8)}`;
        const hmacSecret = `mecopay_hmac_secret_${userId.substring(0, 10)}`;

        const configData = {
          version: 1,
          appName: "MecoPay Universal SMS Sync",
          type: "UNIVERSAL_MASTER_CONFIG",
          description: "Universal Config for all MFS Cash In/Out SMS matching via Supabase User ID",
          userId: userId,
          generatedAt: new Date().toISOString(),
          routing_parameters: {
            sender: "*",
            sender_regex: false,
            text_filter: "(?i)(bKash|Nagad|Rocket|Upay|CellFin|16216|16167|TrxID|TxnID|amount|Tk|Tk.)",
            webhook_url: `${window.location.origin}/api/v1/sms/webhook`,
            sim_slot: "any",
            json_payload_template: JSON.stringify({
              from: "%from%",
              text: "%text%",
              sentStamp: "%sentStamp%",
              receivedStamp: "%receivedStamp%",
              sim: "%sim%",
              user_id: userId
            }, null, 2),
            headers: {
              "User-Agent": "SMS Forwarder App",
              "Content-Type": "application/json",
              "X-MecoPay-User-ID": userId,
              "X-MecoPay-Api-Key": apiKey
            },
            retries: 10,
            ignore_ssl_errors: false,
            chunked_mode: false,
            store_failed_messages: true,
            local_network_mode: false,
            sign_with_hmac_sha256: true,
            hmac_secret: hmacSecret,
            heartbeat: {
              enabled: true,
              interval_minutes: 5,
              heartbeat_url: `${window.location.origin}/api/v1/sms/ping?user_id=${userId}`
            }
          }
        };

        const jsonString = JSON.stringify(configData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mecopay_universal_config.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };"""

content = content.replace(old_func, new_func)

# Replace Card 2 UI to show Universal Master Config clearly
old_card2 = """            {/* Card 2: Auto Config File (.json) Generator */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Auto-Config (.json)
                  </span>
                  <span className="text-xs text-slate-500">Instant Import</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Export Brand Config File
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Export pre-configured Webhook URLs and headers for your brand. Import this file in the Android App Settings to skip manual typing.
                </p>

                {/* Config Scope Selector */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold text-slate-300">Select Configuration Scope:</label>
                  <select 
                    value={selectedGatewayBrandId || 'all'}
                    onChange={(e) => setSelectedGatewayBrandId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="all">🌟 Universal Master Config (All Brands & Gateway - Recommended)</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>🏷️ Brand: {b.name} ({b.id})</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-emerald-400">
                    {(!selectedGatewayBrandId || selectedGatewayBrandId === 'all')
                      ? '✓ 1 Single Config File works for ALL your present and future Brands!'
                      : `Specific to ${brands.find(b => b.id === selectedGatewayBrandId)?.name || 'Brand'}`}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 font-mono overflow-x-auto space-y-1">
                  <div><span className="text-purple-400">Webhook:</span> {window.location.origin}/api/v1/sms/webhook</div>
                  <div><span className="text-purple-400">Brand ID:</span> {selectedBrandForConfig?.id || 'N/A'}</div>
                  <div><span className="text-purple-400">Retry Count:</span> 10 Retries (Auto Failover)</div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => handleDownloadJsonConfig(selectedGatewayBrandId || 'all')}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Export (.json)
                </button>
              </div>
            </div>"""

new_card2 = """            {/* Card 2: Universal Master Config File (.json) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Universal Master Config
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">1 File for All Brands</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Export Universal (.json) Config
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  একবার এই Universal JSON ফাইলটি এক্সপোর্ট করে আপনার ফোনে ইমপোর্ট করলেই হবে! সকল Brand এবং MFS (bKash, Nagad, Rocket, Upay, CellFin) এর SMS স্বয়ংক্রিয়ভাবে Supabase User ID দিয়ে ভেরিফাই হবে।
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 font-mono space-y-1.5 overflow-x-auto">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-purple-400 font-bold">User Scope:</span>
                    <span className="text-slate-200">{user?.id ? user.id.substring(0, 12) + '...' : 'Demo User'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-purple-400 font-bold">Webhook URL:</span>
                    <span className="text-emerald-400 truncate max-w-[170px]">{window.location.origin}/api/v1/sms/webhook</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-purple-400 font-bold">MFS Supported:</span>
                    <span className="text-slate-200">bKash, Nagad, Rocket, Upay, CellFin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400 font-bold">Security:</span>
                    <span className="text-emerald-400 font-bold">HMAC-SHA-256 Signed</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => handleDownloadJsonConfig()}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Export Universal Config (.json)
                </button>
              </div>
            </div>"""

content = content.replace(old_card2, new_card2)

# Clean up selectedBrandForConfig unused variable reference
content = re.sub(r'const selectedBrandForConfig = .*\n', '', content)

with open('src/components/DashboardShell.tsx', 'w') as f:
    f.write(content)
print("Updated Card 2 & Config logic successfully!")
