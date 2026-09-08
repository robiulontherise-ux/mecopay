const fs = require('fs');
const https = require('https');

const logos = {
  bkash: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/bkash.png',
  nagad: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/nagad.png',
  rocket: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/rocket.png',
  upay: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/upay.png',
};

async function downloadBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve(`data:image/png;base64,${buffer.toString('base64')}`);
      });
    }).on('error', reject);
  });
}

async function fix() {
  const bkashB64 = await downloadBase64(logos.bkash);
  const nagadB64 = await downloadBase64(logos.nagad);
  const rocketB64 = await downloadBase64(logos.rocket);
  const upayB64 = await downloadBase64(logos.upay);

  let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');
  content = content.replace(/'https:\/\/raw.githubusercontent.com\/helloanaroul\/bd-mfs-logos\/main\/logos\/png\/bkash.png'/g, `'${bkashB64}'`);
  content = content.replace(/'https:\/\/raw.githubusercontent.com\/helloanaroul\/bd-mfs-logos\/main\/logos\/png\/nagad.png'/g, `'${nagadB64}'`);
  content = content.replace(/'https:\/\/raw.githubusercontent.com\/helloanaroul\/bd-mfs-logos\/main\/logos\/png\/rocket.png'/g, `'${rocketB64}'`);
  content = content.replace(/'https:\/\/raw.githubusercontent.com\/helloanaroul\/bd-mfs-logos\/main\/logos\/png\/upay.png'/g, `'${upayB64}'`);

  fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
  console.log('Logos fixed to Base64!');
}

fix();
