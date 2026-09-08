const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const filterOld = `
      const filteredUsers = mockAdminUsers.filter(u => 
        u.id.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(adminSearchQuery.toLowerCase())
      );
`;

const filterNew = `
      const filteredUsers = mockAdminUsers.filter(u => 
        (u.id || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        (u.name || '').toLowerCase().includes(adminSearchQuery.toLowerCase())
      );
`;

code = code.replace(filterOld.trim(), filterNew.trim());

const nameCharOld = `
                            {client.name.charAt(0)}
`;

const nameCharNew = `
                            {(client.name || 'U').charAt(0)}
`;

code = code.replace(nameCharOld.trim(), nameCharNew.trim());

fs.writeFileSync('src/components/DashboardShell.tsx', code);
