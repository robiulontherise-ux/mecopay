const fs = require('fs');
let file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  // Custom Modal States
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateInput, setRegenerateInput] = useState('');
  
  const [showDeleteDeviceModal, setShowDeleteDeviceModal] = useState(false);
  const [deleteDeviceInput, setDeleteDeviceInput] = useState('');
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);`;

// Replace the first occurrence only
content = content.replace(targetStr, '');

fs.writeFileSync(file, content);
