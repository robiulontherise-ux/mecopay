const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const presenceEffect = `
  // Device Presence Check (Realtime)
  const [onlineDevices, setOnlineDevices] = useState<any[]>([]);

  useEffect(() => {
    if (!linkData?.user_id) return;
    
    const channel = supabase.channel('all_devices');
    
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      let isOnline = false;
      const devices: any[] = [];
      
      for (const id in state) {
        for (const presence of state[id] as any[]) {
          if (presence.client_id === linkData.user_id || presence.user_id === linkData.user_id) {
            isOnline = true;
            devices.push(presence);
          }
        }
      }
      setIsDeviceOnline(isOnline);
      setOnlineDevices(devices);
    });
    
    channel.subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [linkData]);
`;

// Insert after the first useEffect (which handles toast)
// Wait, I will insert it before `const fetchData = async () => {`
const insertPoint = content.indexOf('  const fetchData = async () => {');
content = content.slice(0, insertPoint) + presenceEffect + '\n' + content.slice(insertPoint);

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
