import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

func_to_insert = """
  const handleDownloadJsonConfig = () => {
    // This is the placeholder for the JSON file you will provide.
    // It automatically injects the user_id and HMAC key.
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

target = "if (activeSubMenu === 'Plugins & Apps') {\n"
if target in content:
    content = content.replace(target, target + func_to_insert)

with open('src/components/DashboardShell.tsx', 'w') as f:
    f.write(content)
print("Function inserted.")
