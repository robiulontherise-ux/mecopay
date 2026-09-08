const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const regex = /const hasBasicInfo = !!\(user\.user_metadata\?\.full_name && user\.user_metadata\?\.phone\);\s*setIsIdentityLocked\(hasBasicInfo \|\| hasBirth \|\| hasNid \|\| !!user\.user_metadata\?\.identity_number\);/;

const replacement = `const hasBasicInfo = !!(user.user_metadata?.full_name && user.user_metadata?.phone);
      const isVerified = hasBasicInfo || hasBirth || hasNid || !!user.user_metadata?.identity_number;
      setIsIdentityLocked(isVerified);
      if (isVerified) {
        setActiveSubMenu('Dashboard');
      }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log("Patched successfully!");
} else {
  console.log("Regex didn't match.");
}
