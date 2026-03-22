const fetch = global.fetch || require('node-fetch');
const fs = require('fs');

async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test1773830126842@test.com', password: 'password' }) 
    });
    const { token } = await loginRes.json();
    
    fs.writeFileSync('dummy.pdf', 'dummy content');
    
    // Using Node 18+ FormData
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync('dummy.pdf')], { type: 'application/pdf' });
    formData.append('file', fileBlob, 'dummy.pdf');
    
    const uploadRes = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    });
    console.log('Upload status:', uploadRes.status);
    const text = await uploadRes.text();
    console.log('Upload response:', text);
    
    process.exit(uploadRes.status === 200 ? 0 : 1);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();
