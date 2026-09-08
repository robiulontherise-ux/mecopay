const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const newDeviceCheck = `      // Check device online status strictly from the table (Cron Job handles the logic)
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

lines.splice(235, 11, newDeviceCheck);
fs.writeFileSync(file, lines.join('\n'));
console.log("Replaced device check");
