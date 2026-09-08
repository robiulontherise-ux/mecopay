import re

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

func_start = "const handleDownloadJsonConfig = () => {"
func_end = "URL.revokeObjectURL(url);\n      };"

if func_start in content and func_end in content:
    block = content[content.find(func_start) : content.find(func_end) + len(func_end)]
    
    new_block = """const handleDownloadJsonConfig = () => {
        // Base config that gets dynamic user_id and HMAC injected
        const userId = user?.id || 'demo_user';
        const hmacSecret = `mecopay_hmac_secret_${userId.substring(0, 10)}`;
        const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://fwonuakvherzofqximno.supabase.co';
        
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
            webhook_url: `${supabaseUrl}/functions/v1/verify-sms?client_id=${userId}`,
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
              heartbeat_url: `${supabaseUrl}/functions/v1/heartbeat?client_id=${userId}`
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
      };"""
    
    content = content.replace(block, new_block)

    with open('src/components/DashboardShell.tsx', 'w') as f:
        f.write(content)
    print("URLs fixed.")
else:
    print("Could not find block.")
