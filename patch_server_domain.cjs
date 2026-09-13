const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const middleware = `  // Custom Domain & Subdomain Routing Middleware
  app.use((req, res, next) => {
    const host = req.hostname || '';
    // Define the main platform domains that should serve the Dashboard
    const isPlatformDomain = host.includes('run.app') || host === 'mecopay.space' || host === 'www.mecopay.space' || host === 'localhost' || host === '127.0.0.1';
    
    // If it's a custom domain/subdomain, and not an API request, rewrite the URL internally to use the mysite app
    if (!isPlatformDomain && !req.path.startsWith('/api') && !req.path.startsWith('/mysite')) {
      req.url = '/mysite' + req.url;
    }
    next();
  });

  // Vite middleware for development`;

code = code.replace("  // Vite middleware for development", middleware);
fs.writeFileSync(file, code);
console.log("Patched server.ts");
