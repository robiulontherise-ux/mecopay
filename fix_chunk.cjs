const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const oldChunk = `  [
    "নিজস্ব Custom Website বা",
    "আমাদের No-Code ওয়েবসাইটে",
    "API ও Payment Link ব্যবহার করে",
    "সোশ্যাল মিডিয়ায় পেমেন্ট নিন।"
  ],`;

const newChunk = `  [
    "নিজস্ব Custom Website বা",
    "আমাদের No-Code ওয়েবসাইটে",
    "API ও Link ব্যবহার করে পেমেন্ট নিন,",
    "এবং Payment Link সোশ্যাল মিডিয়ায় শেয়ার করেও পেমেন্ট নিন।"
  ],`;

code = code.replace(oldChunk, newChunk);
fs.writeFileSync('src/components/Login.tsx', code);
console.log('Chunk updated');
