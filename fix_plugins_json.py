import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

# Let's replace the whole Plugins & Apps block again
start_sig = "if (activeSubMenu === 'Plugins & Apps') {"
end_sig = "if (['Merchant API', 'Official Merchant API', 'Personal API'].includes(activeSubMenu)) {"

if start_sig in content and end_sig in content:
    block = content[content.find(start_sig) : content.find(end_sig)]
    
    new_block = """if (activeSubMenu === 'Plugins & Apps') {
      const apkDownloadUrl = "https://github.com/robiulontherise-ux/mecopay.apk/raw/refs/heads/main/app-release.apk";

      const handleDownloadJsonConfig = () => {
        // Base config that gets dynamic user_id and HMAC injected
        const userId = user?.id || 'demo_user';
        const hmacSecret = `mecopay_hmac_secret_${userId.substring(0, 10)}`;
        
        const configData = {
          version: 1,
          appName: "MecoPay Universal SMS Sync",
          type: "UNIVERSAL_MASTER_CONFIG",
          userId: userId,
          generatedAt: new Date().toISOString(),
          routing_parameters: {
            sender: "*",
            sender_regex: false,
            text_filter: "(?i)(bKash|Nagad|Rocket|Upay|CellFin|16216|16167|TrxID|TxnID|amount|Tk|Tk.)",
            webhook_url: `${window.location.origin}/api/v1/sms/webhook?client_id=${userId}`,
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
              "User-Agent": "MecoPay SMS Forwarder",
              "Content-Type": "application/json"
            },
            retries: 10,
            ignore_ssl_errors: false,
            store_failed_messages: true,
            sign_with_hmac_sha256: true,
            hmac_secret: hmacSecret,
            heartbeat: {
              enabled: true,
              interval_minutes: 5,
              heartbeat_url: `${window.location.origin}/api/v1/sms/ping?client_id=${userId}`
            }
          }
        };

        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mecopay_config_${userId.substring(0, 6)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      return (
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-7 h-7 text-emerald-400" />
                Plugins & Mobile Sync App
              </h2>
              <p className="text-sm text-slate-400">অ্যান্ড্রয়েড অ্যাপ ডাউনলোড করুন এবং কনফিগারেশন ইমপোর্ট করুন।</p>
            </div>
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
                  আপনার bKash, Nagad, Rocket বা অন্যান্য MFS সিমে আসা SMS গুলো স্বয়ংক্রিয়ভাবে রিসিভ করার জন্য এই অ্যান্ড্রয়েড অ্যাপটি ডাউনলোড করে আপনার মোবাইলে ইন্সটল করুন।
                </p>
              </div>

              <div className="pt-2">
                <a 
                  href={apkDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Download App (APK)
                </a>
              </div>
            </div>

            {/* Card 2: Configuration Credentials */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    App Configuration
                  </span>
                  <span className="text-xs text-slate-500">Zero Setup</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Auto Config File (.json)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  নিচের বাটন থেকে কনফিগারেশন ফাইলটি ডাউনলোড করে অ্যাপে ইমপোর্ট করুন। আপনার User ID এবং HMAC Security Key অটোমেটিক ফাইলে যুক্ত হয়ে যাবে।
                </p>
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Your Client ID</label>
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                      <code className="text-xs text-emerald-400">{user?.id || 'Demo-User-ID'}</code>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={handleDownloadJsonConfig}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Export Config (.json)
                </button>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> 
              কীভাবে অ্যাপটি সেটআপ করবেন?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</div>
                <h4 className="font-bold text-white text-sm">Download APK</h4>
                <p className="text-slate-400 leading-relaxed">
                  অ্যান্ড্রয়েড অ্যাপটি ডাউনলোড করে ইন্সটল করুন।
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">2</div>
                <h4 className="font-bold text-white text-sm">Export Config File</h4>
                <p className="text-slate-400 leading-relaxed">
                  উপরের "Export Config" বাটনে ক্লিক করে JSON ফাইলটি মোবাইলে সেভ করুন।
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">3</div>
                <h4 className="font-bold text-white text-sm">Import & Start</h4>
                <p className="text-slate-400 leading-relaxed">
                  অ্যাপের Settings থেকে Backup & Restore এ গিয়ে ফাইলটি Import করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    """
    
    content = content.replace(block, new_block)

    with open('src/components/DashboardShell.tsx', 'w') as f:
        f.write(content)
    print("UI fixed successfully.")
