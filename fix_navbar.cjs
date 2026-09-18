const fs = require('fs');
let content = fs.readFileSync('src/mysite/components/Navbar.tsx', 'utf-8');
const lines = content.split('\n');

const cleanLines = [
  '  categories,',
  '  siteSettings,',
  '  activeCategory,',
  '  searchQuery,',
  '  setSearchQuery,',
  '  onSelectCategory,',
  '  user,',
  '  isAdmin,',
  '  onOpenAuthModal,',
  '  currentView,',
  '  onNavigateHome,',
  '  onNavigateAdmin,',
  '  onBackToHub,'
];

lines.splice(37, 13, ...cleanLines);
fs.writeFileSync('src/mysite/components/Navbar.tsx', lines.join('\n'));
