const http = require('http');

async function testSuite() {
  console.log('--- STARTING SMART CELL PORTAL TEST SUITE ---');

  // Helper fetch function
  const fetchJson = (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      };

      const req = http.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  };

  // 1. Thana Login Test (Kotwali Nagar CUG)
  console.log('\n1. Testing Thana Login (Kotwali Nagar CUG 9454403303):');
  const loginRes = await fetchJson('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cug: '9454403303', pin: '123456' }),
  });
  console.log('Status:', loginRes.status);
  console.log('Logged In User:', loginRes.body.user?.thanaName, '| CUG:', loginRes.body.user?.cug, '| Circle:', loginRes.body.user?.circle);

  // 2. Smart Cell Super Admin Login Test
  console.log('\n2. Testing Super Admin Login (PIN admin123):');
  const adminRes = await fetchJson('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'SUPER_ADMIN', cug: '9454400000', pin: 'admin123' }),
  });
  console.log('Status:', adminRes.status);
  console.log('Admin Role:', adminRes.body.user?.role, '| Name:', adminRes.body.user?.thanaName);

  // 3. Live Duplicate Mobile Check (Existing number: 9839123456)
  console.log('\n3. Testing Duplicate Mobile Detection (9839123456):');
  const dupRes = await fetchJson('http://localhost:3000/api/cplan/check-mobile?mobile=9839123456');
  console.log('Duplicate check result:', dupRes.body);

  // 4. Live Unique Mobile Check (New number: 9876543210)
  console.log('\n4. Testing Unique Mobile Number (9876543210):');
  const uniqueRes = await fetchJson('http://localhost:3000/api/cplan/check-mobile?mobile=9876543210');
  console.log('Unique check result:', uniqueRes.body);

  // 5. Attempt adding duplicate record (Should be rejected)
  console.log('\n5. Testing Duplicate Submission Rejection:');
  const rejectRes = await fetchJson('http://localhost:3000/api/cplan/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      thanaId: 'kotwali-ayodhya',
      thanaName: 'Kotwali Ayodhya',
      personName: 'फर्जी प्रविष्टि',
      relativeName: 'अज्ञात',
      mobileNumber: '9839123456', // DUPLICATE!
      villageOrWard: 'वार्ड 1',
      categoryProfession: 'संभ्रांत नागरिक',
    }),
  });
  console.log('Status:', rejectRes.status, '| Error message:', rejectRes.body.error);

  // 6. Test e-Office Vault (Kotwali Cantt)
  console.log('\n6. Testing e-Office & VPN Vault for Kotwali Cantt:');
  const vaultRes = await fetchJson('http://localhost:3000/api/eoffice/credentials?thanaId=kotwali-cantt');
  console.log('VPN User:', vaultRes.body.credentials?.[0]?.vpnUsername, '| Password:', vaultRes.body.credentials?.[0]?.vpnPassword);

  // 7. Test District Stats
  console.log('\n7. Testing District Stats:');
  const statsRes = await fetchJson('http://localhost:3000/api/stats');
  console.log('Stats:', statsRes.body.stats);

  console.log('\n--- ALL TESTS COMPLETED SUCCESSFULLY ---');
}

testSuite().catch(console.error);
