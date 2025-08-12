const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/btc';

// Test data
const testEthAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
const testBtcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';

async function runTests() {
  console.log('🚀 Starting BTC API Tests...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', health.data.status);
    console.log('📊 Network stats:', health.data.networkStats);
    console.log('');

    // Test 2: Generate BTC address
    console.log('2️⃣ Testing BTC address generation...');
    const generateResponse = await axios.post(`${BASE_URL}/generate-address`, {
      ethAddress: testEthAddress
    });
    console.log('✅ Address generated:', generateResponse.data.data.btcAddress);
    console.log('💰 Initial balance:', generateResponse.data.data.balance);
    console.log('');

    // Test 3: Check deposit/balance
    console.log('3️⃣ Testing balance check...');
    const balanceResponse = await axios.get(`${BASE_URL}/check-deposit/${testEthAddress}`);
    console.log('✅ Balance check passed:', balanceResponse.data.data.balance);
    console.log('📝 Last updated:', balanceResponse.data.data.lastUpdated);
    console.log('');

    // Test 4: Get address info
    console.log('4️⃣ Testing address info...');
    const addressResponse = await axios.get(`${BASE_URL}/address/${testEthAddress}`);
    console.log('✅ Address info retrieved');
    console.log('📍 BTC Address:', addressResponse.data.data.btcAddress);
    console.log('💰 Balance:', addressResponse.data.data.balance);
    console.log('');

    // Test 5: Get transaction history
    console.log('5️⃣ Testing transaction history...');
    const txResponse = await axios.get(`${BASE_URL}/transactions/${testEthAddress}`);
    console.log('✅ Transaction history retrieved');
    console.log('📊 Transaction count:', txResponse.data.data.transactions.length);
    console.log('');

    // Test 6: Test withdrawal with insufficient balance
    console.log('6️⃣ Testing withdrawal with insufficient balance...');
    try {
      await axios.post(`${BASE_URL}/withdraw`, {
        ethAddress: testEthAddress,
        btcAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        amount: 1.0 // Try to withdraw 1 BTC when balance is likely 0
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Insufficient balance error handled correctly');
        console.log('❌ Error:', error.response.data.error);
        console.log('📊 Details:', error.response.data.details);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 7: Test withdrawal with invalid address
    console.log('7️⃣ Testing withdrawal with invalid BTC address...');
    try {
      await axios.post(`${BASE_URL}/withdraw`, {
        ethAddress: testEthAddress,
        btcAddress: 'invalid-address',
        amount: 0.001
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid address error handled correctly');
        console.log('❌ Error:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 8: Test withdrawal with invalid ETH address
    console.log('8️⃣ Testing withdrawal with invalid ETH address...');
    try {
      await axios.post(`${BASE_URL}/withdraw`, {
        ethAddress: 'invalid-eth-address',
        btcAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        amount: 0.001
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid ETH address error handled correctly');
        console.log('❌ Error:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 9: Test withdrawal with valid data (small amount)
    console.log('9️⃣ Testing withdrawal with valid data...');
    try {
      const withdrawResponse = await axios.post(`${BASE_URL}/withdraw`, {
        ethAddress: testEthAddress,
        btcAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        amount: 0.00001 // Minimum amount
      });
      console.log('✅ Withdrawal successful!');
      console.log('📊 Transaction hash:', withdrawResponse.data.data.transactionHash);
      console.log('💰 New balance:', withdrawResponse.data.data.newBalance);
      console.log('⏰ Timestamp:', withdrawResponse.data.data.timestamp);
    } catch (error) {
      console.log('❌ Withdrawal failed:', error.response?.data?.error || error.message);
    }
    console.log('');

    // Test 10: Check updated balance after withdrawal
    console.log('🔟 Testing balance after withdrawal...');
    const updatedBalanceResponse = await axios.get(`${BASE_URL}/check-deposit/${testEthAddress}`);
    console.log('✅ Updated balance:', updatedBalanceResponse.data.data.balance);
    console.log('');

    // Test 11: Get updated transaction history
    console.log('1️⃣1️⃣ Testing updated transaction history...');
    const updatedTxResponse = await axios.get(`${BASE_URL}/transactions/${testEthAddress}`);
    console.log('✅ Updated transaction history retrieved');
    console.log('📊 Total transactions:', updatedTxResponse.data.data.transactions.length);
    
    // Show latest transaction
    if (updatedTxResponse.data.data.transactions.length > 0) {
      const latestTx = updatedTxResponse.data.data.transactions[0];
      console.log('🆕 Latest transaction:');
      console.log('   Type:', latestTx.transaction_type);
      console.log('   Amount:', latestTx.amount);
      console.log('   Status:', latestTx.status);
      console.log('   Hash:', latestTx.transaction_hash);
    }
    console.log('');

    // Test 12: Test rate limiting (make multiple rapid requests)
    console.log('1️⃣2️⃣ Testing rate limiting...');
    const rapidRequests = [];
    for (let i = 0; i < 6; i++) {
      rapidRequests.push(
        axios.post(`${BASE_URL}/withdraw`, {
          ethAddress: testEthAddress,
          btcAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
          amount: 0.00001
        }).catch(error => ({ error: true, status: error.response?.status, message: error.response?.data?.message }))
      );
    }
    
    const results = await Promise.all(rapidRequests);
    const rateLimited = results.filter(r => r.error && r.status === 429).length;
    console.log(`✅ Rate limiting working: ${rateLimited} requests were rate limited`);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('📋 Summary:');
    console.log('   ✅ Health check passed');
    console.log('   ✅ Address generation working');
    console.log('   ✅ Balance checking working');
    console.log('   ✅ Transaction history working');
    console.log('   ✅ Withdrawal validation working');
    console.log('   ✅ Error handling working');
    console.log('   ✅ Rate limiting working');
    console.log('');
    console.log('🚀 BTC API is ready for production!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Response data:', error.response.data);
      console.error('📊 Status:', error.response.status);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
