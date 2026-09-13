import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();


async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add headers to allow iframe embedding anywhere
  app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Security-Policy', "frame-ancestors *;");
    next();
  });

  app.use(express.json());

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fwonuakvherzofqximno.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgzMDkwMSwiZXhwIjoyMTAwNDA2OTAxfQ.BHVW2K2Hds315t2UC66Z-Z2pSi5FNT3Cs4IK8kakiKY';

  const supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;

  const isAdmin = (req, res, next) => {
    next();
  };

  // API Routes
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      if (!supabaseAdmin) {
        // Return mock data if key is missing so user can see UI
        return res.json({ 
          warning: "SUPABASE_SERVICE_ROLE_KEY is missing. Showing mock data.",
          users: [
            {
              id: 'USR-2024-X8F9A2B',
              name: 'Robiul Islam',
              email: 'robiulontherise@gmail.com',
              provider: 'Google Auth',
              verification: 'Verified',
              joined: '2/15/2024',
              status: 'Active'
            },
            {
              id: 'USR-2024-T9G1C4D',
              name: 'Test User',
              email: 'test@example.com',
              provider: 'Google Auth',
              verification: 'Pending',
              joined: '2/16/2024',
              status: 'Blocked'
            }
          ]
        });
      }

      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      
      const formattedUsers = users.users.map(user => {
        const metadata = user.user_metadata || {};
        const isIdentityVerified = metadata.identity_number ? true : false;
        
        return {
          id: user.id,
          name: metadata.full_name || 'Unknown',
          email: user.email,
          phone: metadata.phone || user.phone || 'N/A',
          provider: user.app_metadata?.provider || 'Email',
          verification: isIdentityVerified ? 'Verified' : 'Pending',
          joined: new Date(user.created_at).toLocaleDateString(),
          status: user.banned_until ? 'Blocked' : 'Active'
        };
      });

      res.json({ users: formattedUsers });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/users/:id/block', isAdmin, async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.json({ success: true, message: 'Mock user blocked successfully (Service key missing)' });
      }

      const { id } = req.params;
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
        ban_duration: '876000h' // Ban for 100 years
      });
      if (error) throw error;
      res.json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
      console.error('Error blocking user:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/users/:id/unblock', isAdmin, async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.json({ success: true, message: 'Mock user unblocked successfully (Service key missing)' });
      }

      const { id } = req.params;
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
        ban_duration: 'none'
      });
      if (error) throw error;
      res.json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
      console.error('Error unblocking user:', error);
      res.status(500).json({ error: error.message });
    }
  });



  app.post('/api/user/add-device', async (req, res) => {
    try {
      if (!supabaseAdmin) return res.status(500).json({ error: "Missing admin key" });
      const { user_id, device_name, hmac_secret, settings } = req.body;
      
      if (!user_id || !device_name) return res.status(400).json({ error: "Missing required fields" });
      
      // Fetch global config dynamically so new devices always get the latest admin settings
      const { data: globalConfig, error: globalErr } = await supabaseAdmin
        .from('sms_forwarder_settings')
        .select('*')
        .eq('device_name', '__GLOBAL_CONFIG__')
        .single();
        
      if (globalErr || !globalConfig) {
         return res.status(500).json({ error: "Global configuration not found" });
      }

      const adminSettings = globalConfig;
      
      const genWebhookUrl = `${adminSettings.webhook_edge_url}?user_id=${user_id}`;
      const genWsUrl = `wss://${adminSettings.project_url}/realtime/v1/websocket?apikey=${adminSettings.anon_key}&vsn=1.0.0&channel=${adminSettings.ws_channel}&user_id=${user_id}&secret=${hmac_secret}&device_id=${encodeURIComponent(device_name)}&edge_url=${adminSettings.heartbeat_edge_url}`;
      
      // 1. Insert into sms_forwarder_settings
      const { error: sfErr } = await supabaseAdmin.from('sms_forwarder_settings').upsert({
        user_id,
        device_name,
        hmac_secret,
        sender_number: adminSettings.sender_number,
        text_filter: adminSettings.text_filter,
        webhook_edge_url: adminSettings.webhook_edge_url,
        headers: adminSettings.headers,
        json_payload_template: adminSettings.json_payload_template,
        project_url: adminSettings.project_url,
        anon_key: adminSettings.anon_key,
        ws_channel: adminSettings.ws_channel,
        heartbeat_edge_url: adminSettings.heartbeat_edge_url,
        dashboard_url: adminSettings.dashboard_url || 'https://mecopay.pages.dev/dashboard',
        webhook_url: genWebhookUrl,
        heartbeat_ws_url: genWsUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,device_name' });
      
      if (sfErr) throw sfErr;
      
      // 2. Insert into device_status
      const { error: dsErr } = await supabaseAdmin.from('device_status').upsert({
        user_id,
        device_id: device_name,
        connected: false
      }, { onConflict: 'user_id,device_id' });
      
      if (dsErr) throw dsErr;
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error in add-device:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/sync-devices', isAdmin, async (req, res) => {
    try {
      if (!supabaseAdmin) return res.status(500).json({ error: "Missing admin key" });
      const { settings } = req.body;
      
      const { data: devices, error: fetchErr } = await supabaseAdmin.from('sms_forwarder_settings').select('*');
      if (fetchErr) throw fetchErr;
      
      let updateCount = 0;
      for (const d of devices) {
        if (d.device_name === '__GLOBAL_CONFIG__') continue;
        
        const genWebhookUrl = `${settings.webhook_edge_url}?user_id=${d.user_id}`;
        const genWsUrl = `wss://${settings.project_url}/realtime/v1/websocket?apikey=${settings.anon_key}&vsn=1.0.0&channel=${settings.ws_channel}&user_id=${d.user_id}&secret=${d.hmac_secret || 'GLOBAL_SECRET'}&device_id=${encodeURIComponent(d.device_name)}&edge_url=${settings.heartbeat_edge_url}`;
        
        await supabaseAdmin.from('sms_forwarder_settings').update({
          sender_number: settings.sender_number,
          text_filter: settings.text_filter,
          webhook_edge_url: settings.webhook_edge_url,
          headers: settings.headers,
          json_payload_template: settings.json_payload_template,
          project_url: settings.project_url,
          anon_key: settings.anon_key,
          ws_channel: settings.ws_channel,
          heartbeat_edge_url: settings.heartbeat_edge_url,
          webhook_url: genWebhookUrl,
          heartbeat_ws_url: genWsUrl,
        dashboard_url: settings.dashboard_url || 'https://mecopay.pages.dev/dashboard',
          updated_at: new Date().toISOString()
        }).eq('id', d.id);
        
        updateCount++;
      }
      
      res.json({ success: true, count: updateCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/devices', isAdmin, async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.json({ devices: [] });
      }
      
      const { data, error } = await supabaseAdmin
        .from('sms_forwarder_settings')
        .select('*');
        
      if (error) throw error;
      
      const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      
      let allDevices = data.filter(d => d.device_name !== '__GLOBAL_CONFIG__');
      
      if (usersData && usersData.users) {
        allDevices = allDevices.map(d => {
          const user = usersData.users.find((u: any) => u.id === d.user_id);
          return {
            ...d,
            user_email: user?.email || 'Unknown User'
          };
        });
      }
      
      res.json({ devices: allDevices });
    } catch (error) {
      console.error('Error fetching admin devices:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const SETTINGS_FILE = path.join(process.cwd(), 'system-settings.json');

  const defaultForwarderSettings = {
    sender_number: '',
    text_filter: '',
    webhook_edge_url: '',
    headers: '',
    project_url: '',
    anon_key: '',
    ws_channel: '',
    heartbeat_edge_url: '',
    json_payload_template: ''
  };

  app.get('/api/system-settings', async (req, res) => {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return res.json(JSON.parse(raw));
      }
      res.json(defaultForwarderSettings);
    } catch (e: any) {
      res.json(defaultForwarderSettings);
    }
  });

  app.post('/api/system-settings', async (req, res) => {
    try {
      let current = { ...defaultForwarderSettings };
      if (fs.existsSync(SETTINGS_FILE)) {
        try {
          current = { ...current, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) };
        } catch (_) {}
      }
      const updated = {
        ...current,
        ...req.body,
        updated_at: new Date().toISOString()
      };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      
      // Also attempt updating Supabase if available
      if (supabaseAdmin) {
        try {
          if (updated.user_id) {
            await supabaseAdmin.from('sms_forwarder_settings').upsert({
              user_id: updated.user_id,
              device_name: '__GLOBAL_CONFIG__',
              ...updated
            }, { onConflict: 'user_id,device_name' });
          }

          // Also update all existing devices with new global settings
          const { data: allRows } = await supabaseAdmin.from('sms_forwarder_settings').select('*');
          if (allRows && allRows.length > 0) {
            for (const row of allRows) {
              if (row.device_name === '__GLOBAL_CONFIG__') continue;
              const updatedWebhook = `${updated.webhook_edge_url}?user_id=${row.user_id}`;
              const updatedWs = `wss://${updated.project_url}/realtime/v1/websocket?apikey=${updated.anon_key}&vsn=1.0.0&channel=${updated.ws_channel}&user_id=${row.user_id}&secret=${row.hmac_secret || ''}&device_id=${encodeURIComponent(row.device_name || 'default')}&edge_url=${updated.heartbeat_edge_url}`;
              
              await supabaseAdmin.from('sms_forwarder_settings').update({
                sender_number: updated.sender_number,
                text_filter: updated.text_filter,
                webhook_edge_url: updated.webhook_edge_url,
                headers: updated.headers,
                json_payload_template: updated.json_payload_template,
                project_url: updated.project_url,
                anon_key: updated.anon_key,
                ws_channel: updated.ws_channel,
                heartbeat_edge_url: updated.heartbeat_edge_url,
                dashboard_url: updated.dashboard_url || 'https://mecopay.pages.dev/dashboard',
                webhook_url: updatedWebhook,
                heartbeat_ws_url: updatedWs,
                updated_at: new Date().toISOString()
              }).match({ user_id: row.user_id, device_name: row.device_name });
            }
          }
        } catch (dbErr) {
          console.warn('Supabase forwarder settings sync skipped:', dbErr);
        }
      }

      res.json({ success: true, settings: updated });
    } catch (e: any) {
      console.error('Error saving system settings:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/verify-live', async (req, res) => {
    try {
      if (!supabaseAdmin) {
         return res.status(500).json({ error: "Service role key missing" });
      }
      
      const { invoiceId, senderNumber, provider, userId } = req.body;
      if (!invoiceId || !senderNumber || !userId) {
         return res.status(400).json({ error: "Missing required fields" });
      }

      // Clean the customer number
      const customerNum = (senderNumber || '').replace('+88', '');
      
      // 1. Fetch the invoice to get amount and time
      const { data: invoice, error: invError } = await supabaseAdmin
        .from('invoices')
        .select('amount, created_at, brand_id')
        .eq('id', invoiceId)
        .single();
        
      if (invError || !invoice) {
         return res.status(404).json({ error: "Invoice not found" });
      }

      // 2. We ONLY want SMS events that arrived AFTER the invoice was created (strictly during the 10-minute live session).
      const cutoffTime = invoice.created_at;

      // Look for pending SMS
      const { data: smsEvents, error: smsError } = await supabaseAdmin
        .from('sms_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .gte('created_at', cutoffTime);

      if (smsError) throw smsError;

      if (smsEvents && smsEvents.length > 0) {
          const expectedProvider = (provider || '').toLowerCase();
          for (const sms of smsEvents) {
              const smsSender = (sms.sender || '').toLowerCase();
              const msgText = (sms.message || '').toLowerCase();
              
              if (customerNum.length >= 10 && msgText.includes(customerNum)) {
                  let providerMatched = false;
                  if (smsSender.includes(expectedProvider)) {
                      providerMatched = true;
                  } else if (expectedProvider === 'rocket' && smsSender.includes('16216')) {
                      providerMatched = true;
                  } else if (msgText.includes(expectedProvider)) {
                      providerMatched = true;
                  }
                  
                  if (providerMatched) {
                      // Fetch Brand overpayment setting
                      let allowOverpayment = false;
                      if (invoice.brand_id) {
                         const { data: brand } = await supabaseAdmin.from('brands').select('payment_amount_type').eq('id', invoice.brand_id).maybeSingle();
                         if (brand && brand.payment_amount_type === 'allow_overpayment') {
                             allowOverpayment = true;
                         }
                      }

                      // AMOUNT CHECK
                      if (!sms.amount_extracted || sms.amount_extracted < invoice.amount) {
                          continue; // Underpayment
                      }
                      
                      if (!allowOverpayment && sms.amount_extracted > invoice.amount) {
                          continue; // Overpayment not allowed, must be exact
                      }
                      
                      // Match found!
                      await supabaseAdmin.from('invoices').update({ status: 'Completed' }).eq('id', invoiceId);
                      await supabaseAdmin.from('sms_events').update({ status: 'matched', invoice_id: invoiceId }).eq('id', sms.id);
                      
                      return res.json({ matched: true });
                  }
              }
          }
      }
      
      res.json({ matched: false });
    } catch (error) {
      console.error('Error verifying live payment:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Custom Domain & Subdomain Routing Middleware
  app.use((req, res, next) => {
    const host = req.headers['x-forwarded-host'] || req.hostname || '';
    // Define the main platform domains that should serve the Dashboard
    const isPlatformDomain = host.includes('run.app') || host === 'mecopay.space' || host === 'www.mecopay.space' || host === 'localhost' || host === '127.0.0.1';
    
    // If it's a custom domain/subdomain, and not an API request, rewrite the URL internally to use the mysite app
    if (!isPlatformDomain && !req.path.startsWith('/api') && !req.path.startsWith('/mysite')) {
      const isAsset = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(req.path);
      if (!isAsset) {
        req.url = '/mysite' + req.url;
      }
    }
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // Custom route for mysite to bypass SPA fallback in dev but keep Vite HMR
    app.get('/mysite*', async (req, res, next) => {
      try {
        if (req.url.match(/\.(js|css|tsx|ts|jsx)$/)) return next();
        const template = fs.readFileSync(path.resolve(process.cwd(), 'src/mysite/index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { setHeaders: (res, path) => { if (path.endsWith(".html")) { res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); } } }));
    app.get('/mysite*', (req, res) => {
      res.sendFile(path.join(distPath, 'src/mysite/index.html'));
    });
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
