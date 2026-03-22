const fetch = global.fetch || require('node-fetch');

async function test() {
  const email = 'test' + Date.now() + '@test.com';
  console.log('Registering', email);
  const resReg = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email, password: 'password', role: 'admin', location: 'Hapur' })
  });
  console.log('Reg status:', resReg.status);
  
  console.log('Logging in...');
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password' })
  });
  console.log('Login status:', res.status);
  console.log(await res.json());
}
test();
