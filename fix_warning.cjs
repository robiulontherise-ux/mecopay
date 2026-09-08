const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const oldWarning = "আপনার বয়স যদি ১৮ বছরের উপরে হয় (যা Birth Certificate-এ উল্লেখ থাকে), কিন্তু আপনি NID এড়ানোর জন্য তা উল্লেখ না করেন, তবে আমরা যাচাই করে দেখলে আপনার অ্যাকাউন্ট ভেরিফাই হবে না এবং আমরা তা বাতিল বা ব্লক করবো।";
const newWarning = "আপনার বয়স যদি ১৮ বছরের উপরে হয়, কিন্তু আপনি NID প্রদান এড়ানোর জন্য তা উল্লেখ না করেন, তবে আমরা যাচাই করে দেখলে আপনার অ্যাকাউন্ট ভেরিফাই হবে না এবং আমরা অ্যাকাউন্ট বাতিল বা ব্লক করবো।";

code = code.replace(oldWarning, newWarning);
fs.writeFileSync('src/components/DashboardShell.tsx', code);
console.log('Warning fixed');
