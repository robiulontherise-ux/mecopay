import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

old_func = """      const handleDownloadJsonConfig = (brand: any) => {
        if (!brand) {
          alert("Please create or select a brand first!");
          return;
        }
        const apiKey = `mecopay_live_${brand.id.replace(/[^a-zA-Z0-9]/g, '')}_${Math.random().toString(36).substring(2, 8)}`;
        const configData = {
          version: 1,
          appName: "MecoPay SMS Sync",
          brandName: brand.name,
          brandId: brand.id,
          generatedAt: new Date().toISOString(),
          routing_parameters: {
            sender: "*",
            sender_regex: false,
            text_filter: "(bKash|Nagad|Rocket|16216|16167|TrxID|TxnID|amount)",
            webhook_url: `${window.location.origin}/api/v1/sms/webhook`,
            sim_slot: "any",
            json_payload_template: JSON.stringify({
              from: "%from%",
              text: "%text%",
              sentStamp: "%sentStamp%",
              receivedStamp: "%receivedStamp%",
              sim: "%sim%",
              brand_id: brand.id
            }, null, 2),
            headers: {
              "User-Agent": "MecoPay-SMS-Forwarder/1.0",
              "Content-Type": "application/json",
              "X-MecoPay-Brand-ID": brand.id,
              "X-MecoPay-Api-Key": apiKey
            },
            retries: 10,
            ignore_ssl_errors: false,
            store_failed_messages: true,
            heartbeat: {
              enabled: true,
              interval_minutes: 5,
              heartbeat_url: `${window.location.origin}/api/v1/sms/ping?brand_id=${brand.id}`
            }
          }
        };

        const jsonString = JSON.stringify(configData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mecopay_config_${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };"""

new_func = """      const handleDownloadJsonConfig = (targetBrandId: string) => {
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

content = content.replace(old_func, new_func)

# Replace Brand Selector UI section to include Universal option
old_brand_selector = """                {/* Brand Selector */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold text-slate-300">Select Target Brand:</label>
                  <select 
                    value={selectedBrandForConfig?.id || ''}
                    onChange={(e) => setSelectedGatewayBrandId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.id})</option>
                    ))}
                  </select>
                </div>"""

new_brand_selector = """                {/* Config Scope Selector */}
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
                </div>"""

content = content.replace(old_brand_selector, new_brand_selector)

# Fix button onClick in Export (.json)
content = content.replace(
    "onClick={() => handleDownloadJsonConfig(selectedBrandForConfig)}",
    "onClick={() => handleDownloadJsonConfig(selectedGatewayBrandId || 'all')}"
)

with open('src/components/DashboardShell.tsx', 'w') as f:
    f.write(content)
print("Updated Universal Config successfully!")
