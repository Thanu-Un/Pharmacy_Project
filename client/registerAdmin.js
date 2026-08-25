const baseUrl = 'http://localhost:8080/api/auth';

async function setupUser() {
  try {
    const res = await fetch(baseUrl + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'demo', 
        password: 'password123',
        email: 'demo@example.com'
      })
    });
    const text = await res.text();
    console.log("Response:", res.status, text);
  } catch (err) {
    console.error(err);
  }
}

setupUser();
