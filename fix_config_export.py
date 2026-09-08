import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

# Add handleDownloadJsonConfig function
func_to_insert = """  const handleDownloadJsonConfig = () => {
    // This is the placeholder for the JSON file you will provide.
    // It automatically injects the user_id and HMAC key.
    // You can set the project URL later where it says 'YOUR_PROJECT_URL_HERE'
    const configData = {
      app_name: "MecoPay SMS Sync",
      webhook_url: `https://YOUR_PROJECT_URL_HERE/api/v1/sms/webhook?user_id=${user?.id || 'demo'}`,
      hmac_secret: `mecopay_hmac_secret_${user?.id?.substring(0, 8) || 'demo'}`,
      user_id: user?.id || 'demo',
      status: "active"
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mecopay_config_${user?.id?.substring(0, 6) || 'demo'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
"""

# Find a good place to insert it, e.g., before return ( ... ) in Plugins & Apps
if "if (activeSubMenu === 'Apps') {" in content:
    target = "if (activeSubMenu === 'Apps') {\n"
    content = content.replace(target, target + func_to_insert)

# Add the button back in Card 2
old_card2 = """            {/* Card 2: App Credentials */}
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
            </div>"""

new_card2 = """            {/* Card 2: Universal Config */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    App Configuration
                  </span>
                  <span className="text-xs text-slate-500">Security Keys</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Export JSON Config
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  নিচের বাটন থেকে JSON কনফিগারেশন ফাইলটি ডাউনলোড করে অ্যাপে ইমপোর্ট করুন। এতে স্বয়ংক্রিয়ভাবে আপনার User ID এবং HMAC Secret Key যুক্ত হয়ে যাবে।
                </p>

                <div className="space-y-3 mt-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">User ID</label>
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                      <code className="text-xs text-emerald-400">{user?.id || 'Demo-User-ID-123'}</code>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleDownloadJsonConfig}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Download Config (.json)
                </button>
              </div>
            </div>"""

content = content.replace(old_card2, new_card2)

with open('src/components/DashboardShell.tsx', 'w') as f:
    f.write(content)
print("Updated card 2 successfully.")
