const smsSender = "nagad";
const msgText = "money received.\namount: tk 10.00\nsender: 01973891388\nref: ok\ntxnid: 75w57exb\nbalance: tk 127.73\n28/08/2026 01:42";
const customerNum = "01973891388";
const expectedProvider = "nagad";

console.log("msgText.includes(customerNum):", msgText.includes(customerNum));
console.log("smsSender.includes(expectedProvider):", smsSender.includes(expectedProvider));
