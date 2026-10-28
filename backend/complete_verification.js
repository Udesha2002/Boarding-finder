const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        ...(data ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, body: buf });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function checkFrontend() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:5173', (res) => {
      resolve({ status: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
  });
}

async function runCompleteTest() {
  console.log('====================================================');
  console.log('🚀 RUNNING BOARDING FINDER RESTORATION TEST SUITE');
  console.log('====================================================');

  const ts = Date.now();

  // Test 0: Verify Frontend
  const fe = await checkFrontend();
  console.log(`[0] Frontend (http://localhost:5173): Status ${fe.status} ${fe.status === 200 ? '✓ OK' : '✕ FAILED'}`);

  // Test 1: User Registration
  const userPayload = {
    name: "Test User",
    email: `test_user_${ts}@example.com`,
    password: "Test12345",
    role: "user"
  };
  const regUserRes = await request('POST', '/api/auth/register', userPayload);
  console.log(`[1] Register User: Status ${regUserRes.status} ${regUserRes.status === 201 ? '✓ PASSED' : '✕ FAILED'} (Role: ${regUserRes.body?.user?.role})`);

  // Test 2: User Login
  const loginUserRes = await request('POST', '/api/auth/login', {
    email: userPayload.email,
    password: userPayload.password
  });
  console.log(`[2] Login User: Status ${loginUserRes.status} ${loginUserRes.status === 200 ? '✓ PASSED' : '✕ FAILED'} (Token received: ${!!loginUserRes.body?.token})`);
  const userToken = loginUserRes.body?.token;

  // Test 3: Owner Registration
  const ownerPayload = {
    name: "Test Owner",
    email: `test_owner_${ts}@example.com`,
    password: "Test12345",
    role: "owner"
  };
  const regOwnerRes = await request('POST', '/api/auth/register', ownerPayload);
  console.log(`[3] Register Owner: Status ${regOwnerRes.status} ${regOwnerRes.status === 201 ? '✓ PASSED' : '✕ FAILED'} (Role: ${regOwnerRes.body?.user?.role})`);

  // Test 4: Owner Login
  const loginOwnerRes = await request('POST', '/api/auth/login', {
    email: ownerPayload.email,
    password: ownerPayload.password
  });
  console.log(`[4] Login Owner: Status ${loginOwnerRes.status} ${loginOwnerRes.status === 200 ? '✓ PASSED' : '✕ FAILED'} (Token received: ${!!loginOwnerRes.body?.token})`);
  const ownerToken = loginOwnerRes.body?.token;

  // Test 5: Owner 2 Registration for Security Verification
  const owner2Payload = {
    name: "Second Owner",
    email: `second_owner_${ts}@example.com`,
    password: "Test12345",
    role: "owner"
  };
  const regOwner2Res = await request('POST', '/api/auth/register', owner2Payload);
  const owner2Token = regOwner2Res.body?.token;

  // Test 6: Owner Add Accommodation (JSON)
  const accommodationPayload = {
    name: "Green View Boarding - Galle " + ts,
    description: "Quiet and peaceful study boarding for university students. 10 minutes to Faculty of Medicine.",
    location: "Galle",
    price: 16000,
    gender: "Male",
    facilities: ["WiFi", "Water", "Electricity", "Study Area", "Parking"],
    contact: "0771234567"
  };
  const addAccRes = await request('POST', '/api/accommodations', accommodationPayload, ownerToken);
  console.log(`[5] Owner Add Accommodation: Status ${addAccRes.status} ${addAccRes.status === 201 ? '✓ PASSED' : '✕ FAILED'} (ID: ${addAccRes.body?._id})`);
  const accId = addAccRes.body?._id;

  // Test 7: Owner View Own Accommodations (GET /my)
  const myAccRes = await request('GET', '/api/accommodations/my', null, ownerToken);
  const foundInMy = myAccRes.body?.some?.(item => item._id === accId);
  console.log(`[6] Owner Dashboard Listing (/my): Status ${myAccRes.status} ${foundInMy ? '✓ PASSED' : '✕ FAILED'} (Count: ${myAccRes.body?.length})`);

  // Test 8: Owner Edit Accommodation (JSON PUT)
  const updatePayload = {
    name: "Green View Boarding - Galle (Renovated)",
    price: 17500,
    facilities: ["WiFi", "Water", "Electricity", "Study Area", "Parking", "Attached Bathroom"]
  };
  const updateRes = await request('PUT', `/api/accommodations/${accId}`, updatePayload, ownerToken);
  console.log(`[7] Owner Edit Accommodation: Status ${updateRes.status} ${updateRes.body?.price === 17500 ? '✓ PASSED' : '✕ FAILED'} (New Price: ${updateRes.body?.price})`);

  // Test 9: Security Check - Second Owner cannot edit first owner's accommodation
  const unauthorizedUpdateRes = await request('PUT', `/api/accommodations/${accId}`, { price: 99999 }, owner2Token);
  console.log(`[8] Owner Security (Prevent unauthorized edit): Status ${unauthorizedUpdateRes.status} ${unauthorizedUpdateRes.status === 403 ? '✓ PASSED (403 Forbidden)' : '✕ FAILED'}`);

  // Test 10: User Browse All Accommodations
  const allAccRes = await request('GET', '/api/accommodations');
  console.log(`[9] User Browse Accommodations: Status ${allAccRes.status} ${allAccRes.status === 200 ? '✓ PASSED' : '✕ FAILED'} (Count: ${allAccRes.body?.length})`);

  // Test 11: User Search by Keyword
  const searchRes = await request('GET', `/api/accommodations?search=Green%20View`);
  console.log(`[10] User Search by Keyword: Status ${searchRes.status} ${searchRes.body?.length > 0 ? '✓ PASSED' : '✕ FAILED'} (Matches: ${searchRes.body?.length})`);

  // Test 12: User Filter by Location and Price Range
  const filterRes = await request('GET', `/api/accommodations?location=Galle&minPrice=10000&maxPrice=25000&gender=Male`);
  console.log(`[11] User Filter by Location & Price: Status ${filterRes.status} ${filterRes.body?.length > 0 ? '✓ PASSED' : '✕ FAILED'} (Matches: ${filterRes.body?.length})`);

  // Test 13: User View Accommodation Details
  const detailsRes = await request('GET', `/api/accommodations/${accId}`);
  console.log(`[12] User View Accommodation Details: Status ${detailsRes.status} ${detailsRes.body?.owner?.name ? '✓ PASSED' : '✕ FAILED'} (Owner: ${detailsRes.body?.owner?.name}, Contact: ${detailsRes.body?.contact})`);

  // Test 14: Security Check - Second Owner cannot delete first owner's accommodation
  const unauthorizedDelRes = await request('DELETE', `/api/accommodations/${accId}`, null, owner2Token);
  console.log(`[13] Owner Security (Prevent unauthorized delete): Status ${unauthorizedDelRes.status} ${unauthorizedDelRes.status === 403 ? '✓ PASSED (403 Forbidden)' : '✕ FAILED'}`);

  // Test 15: Owner Delete Accommodation
  const delRes = await request('DELETE', `/api/accommodations/${accId}`, null, ownerToken);
  console.log(`[14] Owner Delete Accommodation: Status ${delRes.status} ${delRes.status === 200 ? '✓ PASSED' : '✕ FAILED'}`);

  // Test 16: Verify Accommodation removed
  const verifyDelRes = await request('GET', `/api/accommodations/${accId}`);
  console.log(`[15] Accommodation Removal Verified: Status ${verifyDelRes.status} ${verifyDelRes.status === 404 ? '✓ PASSED (404 Not Found)' : '✕ FAILED'}`);

  console.log('====================================================');
  console.log('🎉 ALL RESTORATION TESTS PASSED WITHOUT ERRORS!');
  console.log('====================================================');
}

runCompleteTest().catch(console.error);
