const https = require('https');
function check(url) {
  https.get(url, { headers: { 'User-Agent': 'curl/7.68.0' } }, (res) => {
    console.log(url, res.statusCode);
  });
}
check('https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png');
check('https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png');
check('https://freelogopng.com/images/all_img/1656235252upay-logo-png.png');
check('https://freelogopng.com/images/all_img/1656234841dutch-bangla-rocket-logo-png.png');
