const fs = require('fs');
const file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const hookLogic = `
  useEffect(() => {
    let timer: any;
    if (step === 4 && verifyMethod === 'live' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && verifyMethod === 'live') {
      alert("Session expired. Please try again or use TrxID verification.");
      setStep(3); // or go back to start
    }
    return () => clearInterval(timer);
  }, [step, verifyMethod, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };
`;

content = content.replace(
  "useEffect(() => {\n    fetchData();",
  hookLogic + "\n  useEffect(() => {\n    fetchData();"
);

fs.writeFileSync(file, content);
