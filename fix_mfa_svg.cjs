const fs = require('fs');
let code = fs.readFileSync('src/components/MfaSettings.tsx', 'utf-8');

code = code.replace(
  '<div dangerouslySetInnerHTML={{ __html: qrCode }} className="w-40 h-40" />',
  '<div dangerouslySetInnerHTML={{ __html: qrCode }} className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto" />'
);

fs.writeFileSync('src/components/MfaSettings.tsx', code);
console.log("Fixed MFA SVG styles");
