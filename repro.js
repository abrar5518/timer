const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/magic-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '1 hour Webinar with 3 speakers' })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', data);
  } catch (err) {
    console.error('Fetch Failed:', err.message);
  }
}

test();
