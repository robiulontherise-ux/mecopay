const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf8');
content = content.replace(
  'product_image: imageUrl,', 
  "product_image: imageUrl || 'https://i.postimg.cc/qqKpCcqV/BCO-3cfd8d70-7be6-4f9d-bcbe-c113f06c17da.png',"
);
fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', content);
