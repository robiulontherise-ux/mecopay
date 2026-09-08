const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace(
  /"\\(নো-কোড ওয়েবসাইট ও কাস্টম ডোমেইন ইউজারদের জন্য\\)"/, 
  '"(আমাদের প্ল্যাটফর্ম থেকে নো-কোড ওয়েবসাইট আর কাস্টম ডোমেইন অ্যাডকারীদের জন্য)"'
);

fs.writeFileSync('src/components/Login.tsx', code);
