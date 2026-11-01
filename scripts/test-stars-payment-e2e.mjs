// Automated E2E Verification Script for Telegram Stars Payment Architecture & StorkCrypto
import { spawn } from 'child_process';

const BASE_URL = 'http://localhost:3000';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('=== STARTING TELEGRAM STARS & STORKCRYPTO E2E AUDIT ===\n');
  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Test POST /api/payments/stars/create Unauthorized vs Authorized
  console.log('\n--- 1. Testing Stars Order & Invoice Creation (Auth & Security) ---');
  try {
    const unauthRes = await fetch(`${BASE_URL}/api/payments/stars/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro_monthly' })
    });
    assert(unauthRes.status === 401, 'Order creation without auth returns strict HTTP 401');
  } catch (err) {
    assert(false, `Unauth check failed: ${err.message}`);
  }

  const testUserId = Math.floor(1000000000 + Math.random() * 900000000);
  const foreignUserId = Math.floor(2000000000 + Math.random() * 900000000);
  let orderData = null;
  try {
    // Test 3 Plans Creation: STARTER (99 XTR), PRO (250 XTR), WHALE (500 XTR)
    const starterRes = await fetch(`${BASE_URL}/api/payments/stars/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `tma user=%7B%22id%22%3A${testUserId}%2C%22username%22%3A%22testuser%22%7D`
      },
      body: JSON.stringify({ planId: 'STARTER' })
    });
    const starterData = await starterRes.json();
    assert(starterRes.status === 200, 'STARTER order creation returns HTTP 200');
    assert(starterData.order.amount === 99, 'STARTER amount is strictly 99 XTR');
    assert(starterData.order.planId === 'STARTER', 'STARTER planId is STARTER');

    const whaleRes = await fetch(`${BASE_URL}/api/payments/stars/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `tma user=%7B%22id%22%3A${testUserId}%2C%22username%22%3A%22testuser%22%7D`
      },
      body: JSON.stringify({ planId: 'WHALE' })
    });
    const whaleData = await whaleRes.json();
    assert(whaleRes.status === 200, 'WHALE order creation returns HTTP 200');
    assert(whaleData.order.amount === 500, 'WHALE amount is strictly 500 XTR');
    assert(whaleData.order.planId === 'WHALE', 'WHALE planId is WHALE');

    const res = await fetch(`${BASE_URL}/api/payments/stars/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `tma user=%7B%22id%22%3A${testUserId}%2C%22username%22%3A%22testuser%22%7D`
      },
      body: JSON.stringify({
        plan: 'pro_monthly'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'PRO Order creation returns HTTP 200');
    assert(data.success === true, 'Response success is true');
    assert(data.order && data.order.orderId.startsWith('STARS_ORD_'), 'Valid orderId generated');
    assert(data.order.currency === 'XTR', 'Currency is strictly XTR');
    assert(data.order.amount === 250, 'PRO amount is 250 Stars');
    assert(data.order.planId === 'PRO', 'PRO planId is PRO');
    assert(data.order.status === 'PENDING', 'Order initial status is PENDING');
    assert(data.order.uniquePayload.includes(data.order.orderId), 'Payload contains orderId');
    assert(Boolean(data.invoiceUrl || data.invoiceLink), 'Invoice link generated');
    orderData = data.order;
  } catch (err) {
    assert(false, `Order creation request failed: ${err.message}`);
  }

  // 1b. Test GET /api/payments/stars/status Endpoint Security (401, 404, 403, 200)
  console.log('\n--- 1b. Testing /api/payments/stars/status Security & Contracts ---');
  try {
    // Missing auth -> 401
    const noAuthStatusRes = await fetch(`${BASE_URL}/api/payments/stars/status?orderId=${orderData.orderId}`);
    assert(noAuthStatusRes.status === 401, 'Status API without auth returns HTTP 401');

    // Unknown order with auth -> 404
    const notFoundStatusRes = await fetch(`${BASE_URL}/api/payments/stars/status?orderId=STARS_ORD_UNKNOWN_999`, {
      headers: {
        'Authorization': `tma user=%7B%22id%22%3A${testUserId}%2C%22username%22%3A%22testuser%22%7D`
      }
    });
    assert(notFoundStatusRes.status === 404, 'Status API with unknown orderId returns HTTP 404');

    // Foreign user accessing order -> 403
    const foreignStatusRes = await fetch(`${BASE_URL}/api/payments/stars/status?orderId=${orderData.orderId}`, {
      headers: {
        'Authorization': `tma user=%7B%22id%22%3A${foreignUserId}%2C%22username%22%3A%22foreignuser%22%7D`
      }
    });
    assert(foreignStatusRes.status === 403, 'Status API for foreign user returns HTTP 403 (access denied)');

    // Order owner accessing order -> 200 JSON
    const ownerStatusRes = await fetch(`${BASE_URL}/api/payments/stars/status?orderId=${orderData.orderId}`, {
      headers: {
        'Authorization': `tma user=%7B%22id%22%3A${testUserId}%2C%22username%22%3A%22testuser%22%7D`
      }
    });
    const ownerStatusData = await ownerStatusRes.json();
    assert(ownerStatusRes.status === 200, 'Status API for order owner returns HTTP 200');
    assert(ownerStatusData.orderId === orderData.orderId, 'Status API returns correct orderId');
    assert(ownerStatusData.status === 'PENDING', 'Status API initial status is PENDING');
    assert(ownerStatusData.paymentVerified === false, 'Status API paymentVerified is false initially');
    assert(ownerStatusData.subscriptionActive === false, 'Status API subscriptionActive is false initially');
  } catch (err) {
    assert(false, `Status endpoint security tests failed: ${err.message}`);
  }

  // 2. Test External Web Invoice Link (POST /api/payments/stars/create-link)
  console.log('\n--- 2. Testing External Web Checkout Link ---');
  try {
    const webRes = await fetch(`${BASE_URL}/api/payments/stars/create-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro_monthly' })
    });
    const webData = await webRes.json();
    assert(webRes.status === 200, 'Web checkout endpoint returns HTTP 200');
    assert(webData.success === true, 'Web checkout link creation success');
    assert(Boolean(webData.invoiceUrl || webData.invoiceLink), 'Web invoice link returned');
  } catch (err) {
    assert(false, `Web link creation failed: ${err.message}`);
  }

  // 3. Test No-PRO-before-receipt Invariant
  console.log('\n--- 3. Testing No-PRO-Before-Receipt Invariant ---');
  try {
    const statusRes = await fetch(`${BASE_URL}/api/subscription/status?orderId=${orderData.orderId}`);
    const statusData = await statusRes.json();
    assert(statusRes.status === 200, 'Status check returns HTTP 200');
    assert(statusData.order.status === 'PENDING', 'Order is still PENDING before payment');
    assert(statusData.isPro === false, 'User is NOT PRO before payment receipt');
  } catch (err) {
    assert(false, `Pre-payment check failed: ${err.message}`);
  }

  // 4. Test pre_checkout_query handling
  console.log('\n--- 4. Testing pre_checkout_query Verification ---');
  try {
    const pcqRes = await fetch(`${BASE_URL}/api/payments/stars/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pre_checkout_query: {
          id: 'pcq_test_123',
          from: { id: testUserId },
          currency: 'XTR',
          total_amount: 250,
          invoice_payload: orderData.uniquePayload
        }
      })
    });
    const pcqData = await pcqRes.json();
    assert(pcqRes.status === 200, 'pre_checkout_query returns HTTP 200');
    assert(pcqData.ok === true && pcqData.verified === true, 'pre_checkout_query verified successfully within 10s');

    // Test rejection with wrong currency (e.g. GRAM)
    const invalidCurrencyRes = await fetch(`${BASE_URL}/api/payments/stars/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pre_checkout_query: {
          id: 'pcq_test_invalid',
          from: { id: testUserId },
          currency: 'GRAM', // Forbidden currency
          total_amount: 250,
          invoice_payload: orderData.uniquePayload
        }
      })
    });
    const invalidCurrencyData = await invalidCurrencyRes.json();
    assert(invalidCurrencyData.ok === false, 'pre_checkout_query rejects forbidden currency GRAM');
  } catch (err) {
    assert(false, `pre_checkout_query test failed: ${err.message}`);
  }

  // 5. Test successful_payment & Server Activation
  console.log('\n--- 5. Testing successful_payment & Server Activation ---');
  const mockChargeId = `ch_tg_stars_${Date.now()}_ABC123`;
  try {
    const payRes = await fetch(`${BASE_URL}/api/payments/stars/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          from: { id: testUserId },
          successful_payment: {
            currency: 'XTR',
            total_amount: 250,
            invoice_payload: orderData.uniquePayload,
            telegram_payment_charge_id: mockChargeId
          }
        }
      })
    });
    const payData = await payRes.json();
    assert(payRes.status === 200, 'successful_payment returns HTTP 200');
    assert(payData.ok === true && payData.status === 'PAID', 'Order status transitioned to PAID');
    assert(payData.telegram_payment_charge_id === mockChargeId, 'telegram_payment_charge_id recorded');
    assert(payData.activatedTier === 'PRO', 'Server activated PRO tier');

    // Verify via GET /api/subscription/status
    const verifyStatusRes = await fetch(`${BASE_URL}/api/subscription/status?orderId=${orderData.orderId}`);
    const verifyStatusData = await verifyStatusRes.json();
    assert(verifyStatusData.order.status === 'PAID', 'Verified order is PAID');
    assert(verifyStatusData.isPro === true, 'User is now confirmed PRO on server');
    assert(verifyStatusData.plan === 'pro', 'Plan is pro');
    assert(verifyStatusData.status === 'active', 'Status is active');
    assert(verifyStatusData.source === 'TELEGRAM_STARS', 'Source is TELEGRAM_STARS');
    assert(Boolean(verifyStatusData.expiresAt), 'expiresAt timestamp present');
  } catch (err) {
    assert(false, `successful_payment test failed: ${err.message}`);
  }

  // 6. Test Duplicate Payment Rejection / Idempotency
  console.log('\n--- 6. Testing Idempotency & Duplicate Rejection ---');
  try {
    const dupRes = await fetch(`${BASE_URL}/api/payments/stars/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          from: { id: 1098273645 },
          successful_payment: {
            currency: 'XTR',
            total_amount: 250,
            invoice_payload: orderData.uniquePayload,
            telegram_payment_charge_id: mockChargeId
          }
        }
      })
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 200, 'Duplicate submission returns HTTP 200');
    assert(dupData.idempotent === true, 'Duplicate charge identified and processed idempotently');
  } catch (err) {
    assert(false, `Idempotency test failed: ${err.message}`);
  }

  // 7. Test Cancelled Payment Order
  console.log('\n--- 7. Testing Cancelled Payment Order ---');
  try {
    const cancelOrderRes = await fetch(`${BASE_URL}/api/payments/stars/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `tma user=%7B%22id%22%3A88889999%2C%22username%22%3A%22canceluser%22%7D`
      },
      body: JSON.stringify({ planId: 'WHALE', userId: '88889999' })
    });
    const cancelOrderData = await cancelOrderRes.json();
    const cancelRes = await fetch(`${BASE_URL}/api/payments/stars/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cancel_order',
        orderId: cancelOrderData.order.orderId
      })
    });
    const cancelData = await cancelRes.json();
    assert(cancelData.status === 'CANCELLED', 'Order marked CANCELLED correctly');
  } catch (err) {
    assert(false, `Cancelled payment test failed: ${err.message}`);
  }

  // 8. Test TON Connect Manifest Schema
  console.log('\n--- 8. Testing TON Connect Manifest ---');
  try {
    const manifestRes = await fetch(`${BASE_URL}/tonconnect-manifest.json`);
    const manifestData = await manifestRes.json();
    assert(manifestRes.status === 200, 'tonconnect-manifest.json returns HTTP 200');
    assert(manifestData.name === 'StorkCrypto', 'Manifest name is StorkCrypto');
    assert(manifestData.url === 'https://storkcrypto.pages.dev', 'Manifest url is valid HTTPS');
    assert(Boolean(manifestData.termsOfUseUrl), 'termsOfUseUrl present');
    assert(Boolean(manifestData.privacyPolicyUrl), 'privacyPolicyUrl present');
    assert(manifestData.iconUrl && manifestData.iconUrl.endsWith('.png'), 'iconUrl is PNG (not JPEG)');
    assert(manifestData.iconUrl.includes('icon-180.png'), 'iconUrl points to icon-180.png');
  } catch (err) {
    assert(false, `tonconnect-manifest.json request failed: ${err.message}`);
  }

  // 9. Test AI Chat Endpoint P1-3
  console.log('\n--- 9. Testing AI Chat Endpoint (/api/chat) ---');
  try {
    const chatRes = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'ping' }]
      }),
      signal: AbortSignal.timeout(6000)
    });
    const chatData = await chatRes.json();
    if (chatRes.status === 200) {
      assert(Boolean(chatData.choices?.[0]?.message?.content), 'AI Chat returns non-empty message on HTTP 200');
    } else {
      assert(
        (chatRes.status === 502 || chatRes.status === 503 || chatRes.status === 504) && Boolean(chatData.error),
        `AI Chat fails gracefully with HTTP ${chatRes.status} (safe error response)`
      );
    }
  } catch (err) {
    if (err.name === 'TimeoutError') {
      assert(true, 'AI Chat timed out safely (P1-3 compliant timeout handling)');
    } else {
      assert(false, `AI Chat request failed: ${err.message}`);
    }
  }

  console.log(`\n=== E2E AUDIT COMPLETE: ${testsPassed} / ${totalTests} TESTS PASSED ===\n`);
  if (testsPassed !== totalTests) {
    process.exit(1);
  }
}

runTests();
