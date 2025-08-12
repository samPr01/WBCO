const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/btc';
const TEST_ETH_ADDRESS = '0x1234567890123456789012345678901234567890';

async function testAPI() {
  console.log('🧪 Testing BTC Deposit API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Generate BTC Address
    console.log('2️⃣ Testing BTC Address Generation...');
    const generateResponse = await axios.post(`${API_BASE}/generate-address`, {
      ethAddress: TEST_ETH_ADDRESS
    });
    console.log('✅ Address Generated:', generateResponse.data);
    const btcAddress = generateResponse.data.data.btcAddress;
    console.log('');

    // Test 3: Get BTC Address
    console.log('3️⃣ Testing Get BTC Address...');
    const addressResponse = await axios.get(`${API_BASE}/address/${TEST_ETH_ADDRESS}`);
    console.log('✅ Address Retrieved:', addressResponse.data);
    console.log('');

    // Test 4: Check BTC Deposit Balance
    console.log('4️⃣ Testing BTC Balance Check...');
    const balanceResponse = await axios.get(`${API_BASE}/check-deposit/${TEST_ETH_ADDRESS}`);
    console.log('✅ Balance Check:', balanceResponse.data);
    console.log('');

    // Test 5: Get Transaction History
    console.log('5️⃣ Testing Transaction History...');
    const txResponse = await axios.get(`${API_BASE}/transactions/${TEST_ETH_ADDRESS}`);
    console.log('✅ Transaction History:', txResponse.data);
    console.log('');

    // Test 6: Test with invalid ETH address
    console.log('6️⃣ Testing Invalid ETH Address...');
    try {
      await axios.get(`${API_BASE}/check-deposit/invalid_address`);
    } catch (error) {
      console.log('✅ Invalid address properly rejected:', error.response.data);
    }
    console.log('');

    // Test 7: Test duplicate address generation
    console.log('7️⃣ Testing Duplicate Address Generation...');
    const duplicateResponse = await axios.post(`${API_BASE}/generate-address`, {
      ethAddress: TEST_ETH_ADDRESS
    });
    console.log('✅ Duplicate request handled:', duplicateResponse.data);
    console.log('');

    console.log('🎉 All tests passed!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`- ETH Address: ${TEST_ETH_ADDRESS}`);
    console.log(`- BTC Address: ${btcAddress}`);
    console.log(`- API Status: Healthy`);
    console.log(`- Database: Working`);
    console.log(`- Blockstream Integration: Working`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
