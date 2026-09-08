const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/user/add-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: '9d0acfb5-833b-4ba5-9d8f-3a3cf8919ce2',
        device_name: 'test-device-3',
        hmac_secret: 'secret',
        settings: {
          webhook_edge_url: 'http://example.com',
          project_url: 'proj',
          anon_key: 'anon',
          ws_channel: 'ch',
          heartbeat_edge_url: 'hb',
          sender_number: '123',
          text_filter: 'abc',
          headers: '{}'
        }
      })
    });
    const data = await res.json();
    console.log("Response:", data);
  } catch (e) {
    console.error(e);
  }
}
test();
