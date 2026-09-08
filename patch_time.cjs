const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      // 2. We only want SMS events that arrived NO MORE than 15 minutes before the invoice was created.
      const invoiceTime = new Date(invoice.created_at).getTime();
      const cutoffTime = new Date(invoiceTime - 15 * 60 * 1000).toISOString();`;

const newCode = `      // 2. We ONLY want SMS events that arrived AFTER the invoice was created (strictly during the 10-minute live session).
      const cutoffTime = invoice.created_at;`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync('server.ts', content);
    console.log("server.ts time logic patched!");
} else {
    console.log("Could not find old code. Here is what is around cutoffTime:");
    console.log(content.substring(content.indexOf('cutoffTime') - 150, content.indexOf('cutoffTime') + 150));
}
