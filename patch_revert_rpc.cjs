const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `      // Check device online status strictly from the table (Cron Job handles the logic)
      let online = false;
      const { data: devStatus } = await supabase
        .from('device_status')
        .select('connected')
        .eq('user_id', link.user_id)
        .maybeSingle();

      if (devStatus && devStatus.connected === true) {
        online = true;
      }
      setIsDeviceOnline(online);`;

const newStr = `      // Check device online status using backend RPC (Heartbeat check)
      let online = false;
      const { data: onlineStatus, error: rpcError } = await supabase
        .rpc('check_device_online', { p_user_id: link.user_id });

      if (rpcError) {
        console.error('Failed to check device status via RPC:', rpcError);
      } else if (onlineStatus === true) {
        online = true;
      }
      setIsDeviceOnline(online);`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(file, content);
  console.log("Successfully reverted to RPC heartbeat check");
} else {
  console.log("Could not find the target string to replace.");
}
