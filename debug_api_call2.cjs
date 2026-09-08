async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/verify-live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: '783b002a-5677-4961-b4f9-0d852f2d9681',
        senderNumber: '01973891388',
        provider: 'nagad',
        userId: '9d0acfb5-833b-4ba5-9d8f-3a3cf8919ce2'
      })
    });
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error(e);
  }
}
test();
