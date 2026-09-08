const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

// 1. Revert the span styling to be just text-white (plus font-black if highlight, or just text-white)
// Actually, earlier the text was just text-white. 
// But let's check what the old version looked like exactly.
