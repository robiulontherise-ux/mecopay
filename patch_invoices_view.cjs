const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/Invoices.tsx', 'utf8');

const targetView = `  const handleViewInvoice = async (inv: any) => {
    setSelectedInvoice(inv);
    setSmsEventData(null);
    if (inv.trx_id) {
      setIsLoadingSms(true);
      try {
        const { data } = await supabase.from('sms_events').select('*').eq('trx_id', inv.trx_id).maybeSingle();
        if (data) {
          setSmsEventData(data);
        } else {
          setSmsEventData({ note: "No SMS event found for this transaction ID." });
        }
      } catch (e) {
        console.error("Could not fetch sms_events", e);
        setSmsEventData({ note: "Could not fetch SMS events. Check permissions or table existence." });
      } finally {
        setIsLoadingSms(false);
      }
    } else {
      setSmsEventData({ note: "No transaction ID provided for this invoice." });
    }
  };`;

const newView = `  const handleViewInvoice = async (inv: any) => {
    setSelectedInvoice(inv);
    setSmsEventData(null);
    
    // Default fallback note
    let metadataObj: any = { note: "No transaction ID provided for this invoice." };
    
    if (inv.trx_id) {
      setIsLoadingSms(true);
      try {
        // Find by extracted trx_id
        const { data } = await supabase.from('sms_events').select('*').ilike('trx_id_extracted', inv.trx_id).maybeSingle();
        
        if (data) {
          metadataObj = data;
        } else {
          metadataObj = { note: "No SMS event found for this transaction ID." };
        }
      } catch (e) {
        console.error("Could not fetch sms_events", e);
        metadataObj = { note: "Could not fetch SMS events. Check permissions or table existence." };
      } finally {
        setIsLoadingSms(false);
      }
    }
    
    // If we have custom metadata saved during manual verify failure, merge it or overwrite note
    if (inv.metadata) {
       metadataObj = { ...metadataObj, ...inv.metadata };
    }
    
    setSmsEventData(metadataObj);
  };`;

if (content.includes(targetView)) {
  content = content.replace(targetView, newView);
  console.log("Patched handleViewInvoice");
} else {
  console.log("Could not find handleViewInvoice");
}

fs.writeFileSync('src/components/payment-hub/Invoices.tsx', content);
