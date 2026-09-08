const fs = require('fs');
const https = require('https');

function downloadAndBase64(url, name) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const b64 = buffer.toString('base64');
        const mime = url.endsWith('.png') ? 'image/png' : 'image/svg+xml';
        console.log(`${name}: data:${mime};base64,${b64.substring(0, 50)}...`);
      });
    });
  });
}

downloadAndBase64('https://raw.githubusercontent.com/sh4hids/mfs-logos/main/bkash.png', 'bkash');
downloadAndBase64('https://raw.githubusercontent.com/sh4hids/mfs-logos/main/nagad.png', 'nagad');
downloadAndBase64('https://raw.githubusercontent.com/sh4hids/mfs-logos/main/upay.png', 'upay');
downloadAndBase64('https://raw.githubusercontent.com/sh4hids/mfs-logos/main/rocket.png', 'rocket');
