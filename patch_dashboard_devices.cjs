const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const regexCustomDevices = /const \[customDevices, setCustomDevices\] = useState<string\[\]>\(\[\]\);/;
const replacementCustomDevices = `const [customDevices, setCustomDevices] = useState<string[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<any[]>([]);`;

if (regexCustomDevices.test(content)) {
  content = content.replace(regexCustomDevices, replacementCustomDevices);
}

const regexFetch = /supabase\.from\('device_status'\)\.select\('device_id'\)\.eq\('user_id', user\.id\)\.then\(\(\{ data \}\) => \{/;
const replacementFetch = `supabase.from('device_status').select('*').eq('user_id', user.id).then(({ data }) => {`;

if (regexFetch.test(content)) {
  content = content.replace(regexFetch, replacementFetch);
}

const regexSetFetch = /setCustomDevices\(devices\);/;
const replacementSetFetch = `setCustomDevices(devices);
          const activeStatuses = data.filter(d => d && d.device_id !== 'android-app-1' && d.device_id !== 'default-device');
          setDeviceStatuses(activeStatuses);`;

if (regexSetFetch.test(content)) {
  content = content.replace(regexSetFetch, replacementSetFetch);
}

fs.writeFileSync('src/components/DashboardShell.tsx', content);
console.log("Patched devices fetch");
