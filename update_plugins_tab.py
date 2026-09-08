import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

# Add Lucide icon imports
old_import = "import { LogOut, Upload, ShieldCheck, Key, Plug, CreditCard, LayoutTemplate, Settings, ChevronRight, Menu, X, ChevronDown, CheckCircle2, Zap, Rocket, Globe, Wallet, Crown, Plus, Video, MoreVertical, Copy, Edit, RefreshCw, Trash2, Image as ImageIcon, Save, Info } from 'lucide-react';"
new_import = "import { LogOut, Upload, ShieldCheck, Key, Plug, CreditCard, LayoutTemplate, Settings, ChevronRight, Menu, X, ChevronDown, CheckCircle2, Zap, Rocket, Globe, Wallet, Crown, Plus, Video, MoreVertical, Copy, Edit, RefreshCw, Trash2, Image as ImageIcon, Save, Info, Download, Smartphone, FileText, ExternalLink, ShieldAlert } from 'lucide-react';"

content = content.replace(old_import, new_import)

# Find Plugins & Apps block in renderContent
old_plugins_block = """        if (activeSubMenu === 'Plugins & Apps') {
      return (
        <div className="max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Plugins & Apps</h2>
              <p className="text-sm text-slate-400">Download the Android App and configuration files for your integration.</p>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Android App & Config</h3>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              Download the MecoPay Sync App and import your configuration file to connect your phone for Personal SMS verification.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                Download APK
              </button>
              <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2">
                Download Config (.json)
              </button>
            </div>
          </div>
        </div>
      );
    }"""

new_plugins_block = """        if (activeSubMenu === 'Plugins & Apps') {
      const selectedBrandForConfig = brands.find(b => b.id === (selectedGatewayBrandId || brands[0]?.id)) || brands[0];

      const handleDownloadJsonConfig = (brand: any) => {
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
      };

      const apkDownloadUrl = "https://github.com/robiulontherise-ux/mecopay.apk/raw/refs/heads/main/app-release.apk";

      return (
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-7 h-7 text-emerald-400" />
                Plugins & Mobile Sync App
              </h2>
              <p className="text-sm text-slate-400">Download the Android SMS Listener app and your automated Brand configuration file.</p>
            </div>
            <a 
              href={apkDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/30 flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" /> Download MecoPay APK
            </a>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Android App Download */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Android App v1.0.4
                  </span>
                  <span className="text-xs text-slate-500">Official Build</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" /> MecoPay Sync App (APK)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Install this APK on the Android phone containing your bKash/Nagad SIM cards. It listens for payment SMS and forwards them instantly to your MecoPay webhook.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">File:</span>
                    <span className="text-slate-200">app-release.apk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target:</span>
                    <span className="text-slate-200">Android 7.0+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source:</span>
                    <span className="text-emerald-400 truncate max-w-[180px]">GitHub Repository</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a 
                  href={apkDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Download app-release.apk
                </a>
              </div>
            </div>

            {/* Card 2: Auto Config File (.json) Generator */}
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

                {/* Brand Selector */}
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
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 font-mono overflow-x-auto space-y-1">
                  <div><span className="text-purple-400">Webhook:</span> {window.location.origin}/api/v1/sms/webhook</div>
                  <div><span className="text-purple-400">Brand ID:</span> {selectedBrandForConfig?.id || 'N/A'}</div>
                  <div><span className="text-purple-400">Retry Count:</span> 10 Retries (Auto Failover)</div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => handleDownloadJsonConfig(selectedBrandForConfig)}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Export (.json)
                </button>
              </div>
            </div>
          </div>

          {/* Setup Instructions & Analysis */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> 
              How to Setup Android SMS Sync (ধাপে ধাপে নির্দেশনা)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</div>
                <h4 className="font-bold text-white text-sm">Download & Install APK</h4>
                <p className="text-slate-400 leading-relaxed">
                  উপরের "Download MecoPay APK" লিংকে ক্লিক করে অ্যাপ ইন্সটল করুন।
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">2</div>
                <h4 className="font-bold text-white text-sm">Export Brand Config File</h4>
                <p className="text-slate-400 leading-relaxed">
                  আপনার Brand নির্বাচন করে "Export (.json)" বাটনে ক্লিক করে ফাইলটি ফোনে সেভ করুন।
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">3</div>
                <h4 className="font-bold text-white text-sm">Import in Mobile App</h4>
                <p className="text-slate-400 leading-relaxed">
                  অ্যান্ড্রয়েড অ্যাপটি খুলে <strong>Settings → Backup & Restore → Import</strong> এ গিয়ে ডাউনলোডকৃত JSON ফাইলটি সিলেক্ট করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }"""

content = content.replace(old_plugins_block, new_plugins_block)

with open('src/components/DashboardShell.tsx', 'w') as f:
    f.write(content)
print("Plugins tab updated successfully!")
