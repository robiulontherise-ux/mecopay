const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');

// Replace 'Landing Page Builder' with 'Website Builder'
code = code.replace(/'Landing Page Builder'/g, "'Website Builder'");
code = code.replace(/Landing Page Builder/g, "Website Builder");

// Add import
if (!code.includes('import MySiteApp')) {
  code = code.replace(/import React, \{ useState, useEffect, useRef \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';\nimport MySiteApp from '../mysite/App';");
}

// Replace the placeholder for Website Builder with <MySiteApp />
const placeholderStart = code.indexOf("if (activeSubMenu === 'Website Builder') {");
if (placeholderStart !== -1) {
    const returnStart = code.indexOf("return (", placeholderStart);
    // find the matching closing tag for return ( ... );
    // a simple regex might be easier
}
