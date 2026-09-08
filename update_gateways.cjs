const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf-8');

// 1. Add min_amount and max_amount to update
content = content.replace(
  /number_2: secondaryAccountNumber \|\| null,\s*additional_numbers: additionalNumbers\s*\}/,
  `number_2: secondaryAccountNumber || null,
              additional_numbers: additionalNumbers,
              min_amount: Number(minAmount) || 1,
              max_amount: Number(maxAmount) || 100000 
            }`
);

// 2. Add min_amount and max_amount to insert
content = content.replace(
  /number_2: secondaryAccountNumber \|\| null,\s*additional_numbers: additionalNumbers,\s*type: 'personal',\s*monthly_volume: 0\s*\}/,
  `number_2: secondaryAccountNumber || null,
              additional_numbers: additionalNumbers,
              type: 'personal',
              monthly_volume: 0,
              min_amount: Number(minAmount) || 1,
              max_amount: Number(maxAmount) || 100000
            }`
);

// 3. Load min_amount and max_amount when editing
content = content.replace(
  /setSecondaryAccountNumber\(gw\.number_2 \|\| ''\);\s*setAdditionalNumbers\(gw\.additional_numbers \|\| \[\]\);\s*setIsCreating\(true\);/,
  `setSecondaryAccountNumber(gw.number_2 || '');
                              setAdditionalNumbers(gw.additional_numbers || []);
                              setMinAmount(gw.min_amount ? String(gw.min_amount) : '1');
                              setMaxAmount(gw.max_amount ? String(gw.max_amount) : '100000');
                              setIsCreating(true);`
);

fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', content);
console.log("Updated GatewaySettings.tsx");
