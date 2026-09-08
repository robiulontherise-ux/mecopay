import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  'class ErrorBoundary extends React.Component<any, any> {',
  'interface EBProps { children?: React.ReactNode; }\ninterface EBState { hasError: boolean; error: any; }\nclass ErrorBoundary extends React.Component<EBProps, EBState> {\n  public state: EBState = { hasError: false, error: null };\n'
);
fs.writeFileSync('src/App.tsx', content);
