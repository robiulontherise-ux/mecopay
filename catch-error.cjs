const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
const errorBoundary = `
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color: 'red', padding: '20px'}}><h1 className="text-2xl font-bold">Something went wrong.</h1><pre className="mt-4">{this.state.error.toString()}</pre><pre>{this.state.error.stack}</pre></div>;
    }
    return this.props.children;
  }
}
`;
app = app.replace("function App() {", errorBoundary + "\nfunction App() {");
app = app.replace("return (", "return (\n    <ErrorBoundary>");
app = app.replace("</BrowserRouter>\n  );", "</BrowserRouter>\n    </ErrorBoundary>\n  );");
fs.writeFileSync('src/App.tsx', app);
