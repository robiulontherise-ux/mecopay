import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

# Replace the Plugins & Apps section with a simplified version without the download logic
old_plugins_start = "if (activeSubMenu === 'Plugins & Apps') {"
old_plugins_end = "if (['Merchant API', 'Official Merchant API', 'Personal API'].includes(activeSubMenu)) {"

if old_plugins_start in content and old_plugins_end in content:
    old_plugins_block = content[content.find(old_plugins_start) : content.find(old_plugins_end)]
    
    new_plugins_block = """if (activeSubMenu === 'Plugins & Apps') {
      const apkDownloadUrl = "https://github.com/robiulontherise-ux/mecopay.apk/raw/refs/heads/main/app-release.apk";

      return (
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-7 h-7 text-emerald-400" />
                Plugins & Mobile Sync App
              </h2>
              <p className="text-sm text-slate-400">Download the Android SMS Listener app and get your credentials.</p>
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

            {/* Card 2: App Credentials */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    App Credentials
                  </span>
                  <span className="text-xs text-slate-500">Security Keys</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-400" /> Your Integration Keys
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  অ্যাডমিন থেকে পাওয়া কনফিগারেশন ফাইলটি অ্যাপে ইমপোর্ট করুন, অথবা নিচের Credentials ব্যবহার করুন।
                </p>

                <div className="space-y-3 mt-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">User ID (Webhook URL এ যুক্ত হবে)</label>
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                      <code className="text-xs text-emerald-400">{user?.id || 'Demo-User-ID-123'}</code>
                      <button onClick={() => {navigator.clipboard.writeText(user?.id || 'Demo-User-ID-123'); alert('Copied!');}} className="text-slate-500 hover:text-white transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">HMAC Secret Key (Security)</label>
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                      <code className="text-xs text-purple-400">{'mecopay_hmac_secret_' + (user?.id?.substring(0, 8) || 'demo')}</code>
                      <button onClick={() => {navigator.clipboard.writeText('mecopay_hmac_secret_' + (user?.id?.substring(0, 8) || 'demo')); alert('Copied!');}} className="text-slate-500 hover:text-white transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Instructions & Analysis */}
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
                  উপরের বাটন থেকে অ্যান্ড্রয়েড অ্যাপটি ডাউনলোড করে আপনার মোবাইলে ইন্সটল করুন।
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">2</div>
                <h4 className="font-bold text-white text-sm">Get Config File</h4>
                <p className="text-slate-400 leading-relaxed">
                  অ্যাডমিন (MecoPay Authority) এর কাছ থেকে আপনার অ্যাকাউন্টের জন্য নির্দিষ্ট JSON কনফিগারেশন ফাইলটি সংগ্রহ করুন।
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">3</div>
                <h4 className="font-bold text-white text-sm">Import & Start</h4>
                <p className="text-slate-400 leading-relaxed">
                  অ্যাপের Settings থেকে Backup & Restore এ গিয়ে ফাইলটি Import করুন। এরপর অ্যাপটি চালু করে দিন।
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    """
    content = content.replace(old_plugins_block, new_plugins_block)

    with open('src/components/DashboardShell.tsx', 'w') as f:
        f.write(content)
    print("Plugins UI updated to remove JSON download.")
else:
    print("Failed to find Plugins & Apps block")
