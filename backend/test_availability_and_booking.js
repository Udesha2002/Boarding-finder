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

async function runTest() {
  console.log('================================================================');
  console.log('🧪 VERIFYING AVAILABILITY & SIMPLE BOOKING SYSTEM');
  console.log('================================================================');

  const ts = Date.now();
  let passed = 0;
  let total = 0;

  function assert(title, condition, extraInfo = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ [PASS ${total}] ${title} ${extraInfo ? '(' + extraInfo + ')' : ''}`);
    } else {
      console.error(`✕ [FAIL ${total}] ${title} ${extraInfo ? '(' + extraInfo + ')' : ''}`);
      process.exitCode = 1;
    }
  }

  // 1. Create Owner 1
  const owner1Res = await request('POST', '/api/auth/register', {
    name: 'Owner One',
    email: `owner1_${ts}@test.com`,
    password: 'Password123',
    role: 'owner'
  });
  assert('Owner 1 registered', owner1Res.status === 201, `Token: ${!!owner1Res.body?.token}`);
  const owner1Token = owner1Res.body?.token;

  // 2. Create Owner 2 (for authorization tests)
  const owner2Res = await request('POST', '/api/auth/register', {
    name: 'Owner Two',
    email: `owner2_${ts}@test.com`,
    password: 'Password123',
    role: 'owner'
  });
  assert('Owner 2 registered', owner2Res.status === 201);
  const owner2Token = owner2Res.body?.token;

  // 3. Create Student User 1
  const user1Res = await request('POST', '/api/auth/register', {
    name: 'Student Alice',
    email: `alice_${ts}@test.com`,
    password: 'Password123',
    role: 'user'
  });
  assert('Student User 1 registered', user1Res.status === 201);
  const user1Token = user1Res.body?.token;

  // 4. Create Student User 2
  const user2Res = await request('POST', '/api/auth/register', {
    name: 'Student Bob',
    email: `bob_${ts}@test.com`,
    password: 'Password123',
    role: 'user'
  });
  assert('Student User 2 registered', user2Res.status === 201);
  const user2Token = user2Res.body?.token;

  // 5. Owner 1 adds Accommodation
  const accPayload = {
    name: 'University Haven - Colombo ' + ts,
    description: 'Comfortable student room close to university gate.',
    location: 'Colombo 07',
    price: 22000,
    gender: 'Any',
    facilities: ['WiFi', 'Water', 'Electricity', 'Study Desk'],
    contact: '0719876543'
  };
  const createAccRes = await request('POST', '/api/accommodations', accPayload, owner1Token);
  assert(
    'Owner 1 creates accommodation with default isAvailable: true',
    createAccRes.status === 201 && createAccRes.body?.isAvailable === true,
    `isAvailable: ${createAccRes.body?.isAvailable}`
  );
  const accId = createAccRes.body?._id;

  // 6. User views accommodation -> sees isAvailable: true
  const viewAccRes = await request('GET', `/api/accommodations/${accId}`);
  assert(
    'Public / User sees isAvailable: true',
    viewAccRes.status === 200 && viewAccRes.body?.isAvailable === true
  );

  // 7. Owner toggles availability to false
  const toggleOffRes = await request('PATCH', `/api/accommodations/${accId}/availability`, { isAvailable: false }, owner1Token);
  assert(
    'Owner 1 toggles accommodation to Not Available (isAvailable: false)',
    toggleOffRes.status === 200 && toggleOffRes.body?.isAvailable === false
  );

  // 8. Public / User views accommodation -> sees isAvailable: false
  const viewOffRes = await request('GET', `/api/accommodations/${accId}`);
  assert(
    'Public / User sees isAvailable: false after toggle',
    viewOffRes.status === 200 && viewOffRes.body?.isAvailable === false
  );

  // 9. Booking attempt when unavailable must be rejected by backend
  const bookUnavailableRes = await request('POST', '/api/bookings', { accommodationId: accId }, user1Token);
  assert(
    'Backend rejects booking for unavailable accommodation (400)',
    bookUnavailableRes.status === 400 && bookUnavailableRes.body?.message?.includes('not available'),
    `Msg: "${bookUnavailableRes.body?.message}"`
  );

  // 10. Owner switches availability back to true
  const toggleOnRes = await request('PATCH', `/api/accommodations/${accId}/availability`, { isAvailable: true }, owner1Token);
  assert(
    'Owner 1 switches accommodation back to Available (isAvailable: true)',
    toggleOnRes.status === 200 && toggleOnRes.body?.isAvailable === true
  );

  // 11. Security: Unauthenticated user cannot create booking
  const unauthBookingRes = await request('POST', '/api/bookings', { accommodationId: accId });
  assert(
    'Security: Unauthenticated booking attempt rejected (401)',
    unauthBookingRes.status === 401
  );

  // 12. Security: Owner cannot book accommodations
  const ownerBookingRes = await request('POST', '/api/bookings', { accommodationId: accId }, owner1Token);
  assert(
    'Security: Owner cannot create booking request (403)',
    ownerBookingRes.status === 403
  );

  // 13. Student User 1 books available accommodation
  const bookSuccessRes = await request('POST', '/api/bookings', { accommodationId: accId }, user1Token);
  assert(
    'User 1 creates booking request (status: pending)',
    bookSuccessRes.status === 201 && bookSuccessRes.body?.booking?.status === 'pending',
    `Status: ${bookSuccessRes.body?.booking?.status}`
  );
  const booking1Id = bookSuccessRes.body?.booking?._id;

  // 14. Duplicate booking protection: User 1 cannot book the same accommodation again
  const duplicateBookingRes = await request('POST', '/api/bookings', { accommodationId: accId }, user1Token);
  assert(
    'Duplicate booking protection: User 1 cannot create duplicate pending booking',
    duplicateBookingRes.status === 400 && duplicateBookingRes.body?.message?.includes('already have a booking request'),
    `Msg: "${duplicateBookingRes.body?.message}"`
  );

  // 15. Student User 1 views their bookings (GET /api/bookings/my)
  const myBookingsRes = await request('GET', '/api/bookings/my', null, user1Token);
  assert(
    'User 1 retrieves their bookings list (GET /api/bookings/my)',
    myBookingsRes.status === 200 && myBookingsRes.body?.length >= 1 && myBookingsRes.body[0].status === 'pending',
    `Total: ${myBookingsRes.body?.length}, First Status: ${myBookingsRes.body?.[0]?.status}`
  );

  // 16. Owner 1 views booking requests for their accommodations (GET /api/bookings/owner)
  const ownerBookingsRes = await request('GET', '/api/bookings/owner', null, owner1Token);
  assert(
    'Owner 1 retrieves booking requests for their properties (GET /api/bookings/owner)',
    ownerBookingsRes.status === 200 && ownerBookingsRes.body?.some(b => b._id === booking1Id),
    `Requests count: ${ownerBookingsRes.body?.length}`
  );

  // 17. Security: User cannot approve/reject booking
  const userApproveRes = await request('PUT', `/api/bookings/${booking1Id}/approve`, null, user1Token);
  assert(
    'Security: Regular user cannot approve booking (403)',
    userApproveRes.status === 403
  );

  // 18. Security: Owner 2 cannot approve Owner 1's booking
  const owner2ApproveRes = await request('PUT', `/api/bookings/${booking1Id}/approve`, null, owner2Token);
  assert(
    'Security: Owner 2 cannot approve Owner 1 booking request (403 Forbidden)',
    owner2ApproveRes.status === 403
  );

  // 19. Owner 1 approves Student User 1's booking
  const approveRes = await request('PUT', `/api/bookings/${booking1Id}/approve`, null, owner1Token);
  assert(
    'Owner 1 approves booking (status: approved)',
    approveRes.status === 200 && approveRes.body?.booking?.status === 'approved',
    `Status: ${approveRes.body?.booking?.status}`
  );

  // 20. AUTOMATIC AVAILABILITY CHANGE: Accommodation must now be isAvailable = false
  const accAfterApprove = await request('GET', `/api/accommodations/${accId}`);
  assert(
    'Accommodation automatically becomes isAvailable: false upon booking approval',
    accAfterApprove.status === 200 && accAfterApprove.body?.isAvailable === false,
    `isAvailable: ${accAfterApprove.body?.isAvailable}`
  );

  // 21. Student User 2 tries to book now that accommodation is automatically unavailable
  const user2BookAfterApprove = await request('POST', '/api/bookings', { accommodationId: accId }, user2Token);
  assert(
    'Another user (Student 2) cannot book after approval (accommodation is now unavailable)',
    user2BookAfterApprove.status === 400 && user2BookAfterApprove.body?.message?.includes('not available'),
    `Msg: "${user2BookAfterApprove.body?.message}"`
  );

  // 22. Owner 1 manually turns availability back ON for accommodation 2 test
  const acc2Res = await request('POST', '/api/accommodations', {
    ...accPayload,
    name: 'University Lodge 2 - ' + ts
  }, owner1Token);
  const acc2Id = acc2Res.body?._id;

  // Student User 2 creates booking for Accommodation 2
  const book2Res = await request('POST', '/api/bookings', { accommodationId: acc2Id }, user2Token);
  const booking2Id = book2Res.body?.booking?._id;
  assert(
    'Student User 2 creates booking for second accommodation (status: pending)',
    book2Res.status === 201 && book2Res.body?.booking?.status === 'pending'
  );

  // 23. Owner 1 rejects Student User 2's booking
  const rejectRes = await request('PUT', `/api/bookings/${booking2Id}/reject`, null, owner1Token);
  assert(
    'Owner 1 rejects booking (status: rejected)',
    rejectRes.status === 200 && rejectRes.body?.booking?.status === 'rejected',
    `Status: ${rejectRes.body?.booking?.status}`
  );

  // 24. REJECT REQUIREMENT: Accommodation availability must NOT automatically change upon reject
  const acc2AfterReject = await request('GET', `/api/accommodations/${acc2Id}`);
  assert(
    'Rejecting booking does NOT change accommodation availability (remains true)',
    acc2AfterReject.status === 200 && acc2AfterReject.body?.isAvailable === true,
    `isAvailable: ${acc2AfterReject.body?.isAvailable}`
  );

  // 25. Verify User 1 sees Approved status in My Bookings
  const user1FinalBookings = await request('GET', '/api/bookings/my', null, user1Token);
  const user1Booking = user1FinalBookings.body?.find(b => b._id === booking1Id);
  assert(
    'User 1 sees Approved status in My Bookings',
    user1Booking?.status === 'approved' && user1Booking?.accommodation?.name?.includes('University Haven')
  );

  // 26. Verify User 2 sees Rejected status in My Bookings
  const user2FinalBookings = await request('GET', '/api/bookings/my', null, user2Token);
  const user2Booking = user2FinalBookings.body?.find(b => b._id === booking2Id);
  assert(
    'User 2 sees Rejected status in My Bookings',
    user2Booking?.status === 'rejected'
  );

  // Cleanup test accommodations
  await request('DELETE', `/api/accommodations/${accId}`, null, owner1Token);
  await request('DELETE', `/api/accommodations/${acc2Id}`, null, owner1Token);

  console.log('================================================================');
  console.log(`📊 TEST RESULTS: ${passed}/${total} TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL AVAILABILITY & BOOKING FEATURES ARE 100% OPERATIONAL!');
  } else {
    console.log('❌ SOME TESTS FAILED. PLEASE CHECK LOGS ABOVE.');
  }
  console.log('================================================================');
}

runTest().catch(console.error);
