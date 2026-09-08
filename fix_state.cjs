const fs = require('fs');
let file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

const strToReplace = `  const [newDeviceInput, setNewDeviceInput] = useState<string>('');`;

const strNew = `  const [newDeviceInput, setNewDeviceInput] = useState<string>('');
  
  // Custom Modal States
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateInput, setRegenerateInput] = useState('');
  
  const [showDeleteDeviceModal, setShowDeleteDeviceModal] = useState(false);
  const [deleteDeviceInput, setDeleteDeviceInput] = useState('');
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);`;

content = content.replace(strToReplace, strNew);
fs.writeFileSync(file, content);
