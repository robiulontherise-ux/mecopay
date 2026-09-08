const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Cut Invoice button text and color
const cutInvoiceOld = /<button[\s\S]*?Cancel & Cut Invoice[\s\S]*?<\/button>/;

const cutInvoiceNew = `<button 
                  onClick={async () => {
                     if (invoiceId) {
                       await supabase.from('invoices').update({ status: 'Cut Invoice' }).eq('id', invoiceId);
                     }
                     setStep(1);
                     window.location.reload();
                  }}
                  className="w-fit px-6 py-2.5 rounded-full flex justify-center items-center bg-sky-300 hover:bg-sky-400 border border-sky-400 transition-all shadow-md group"
                >
                  <div className="text-sm font-bold text-red-700 flex items-center gap-2 group-hover:scale-105 transition-transform">
                    <AlertTriangle className="w-4 h-4 text-red-700" /> 
                    Cut Invoice
                  </div>
                </button>`;

if (content.match(cutInvoiceOld)) {
  content = content.replace(cutInvoiceOld, cutInvoiceNew);
  console.log("Patched Cut Invoice");
} else {
  console.log("Could not find Cut Invoice");
}

// 2. Fix Frontend to ONLY read connected from table (NO RPC, NO logic)
const deviceCheckOldStr = `      // Check device online status using backend RPC to avoid any frontend timezone/Date parsing issues
      let online = false;
      const { data: onlineStatus, error: rpcError } = await supabase
        .rpc('check_device_online', { p_user_id: link.user_id });

      if (rpcError) {
        console.error('Failed to check device status via RPC:', rpcError);
      } else if (onlineStatus === true) {
        online = true;
      }
      setIsDeviceOnline(online);`;

const deviceCheckNewStr = `      // Check device online status strictly from the table (Cron Job handles the logic)
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

if (content.includes(deviceCheckOldStr)) {
  content = content.replace(deviceCheckOldStr, deviceCheckNewStr);
  console.log("Patched Device Check");
} else {
  console.log("Could not find Device Check");
}

fs.writeFileSync(file, content);
