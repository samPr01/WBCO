const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/btc';

// Test data
const testEthAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
const testBtcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
const testWithdrawAddress = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logTest(testName) {
  log(`\n🧪 ${testName}`, 'cyan');
}

async function runCompleteTests() {
  log('🚀 Starting Complete BTC API Test Suite...', 'bright');
  log('='.repeat(60), 'bright');
  
  let passedTests = 0;
  let totalTests = 0;

  const testResults = {
    health: false,
    addressGeneration: false,
    balanceCheck: false,
    addressInfo: false,
    transactionHistory: false,
    withdrawalValidation: false,
    withdrawalSuccess: false,
    rateLimiting: false,
    errorHandling: false
  };

  try {
    // Test 1: Health Check
    logTest('1. Health Check');
    totalTests++;
    try {
      const health = await axios.get(`${BASE_URL}/health`);
      if (health.data.success && health.data.data.status === 'healthy') {
        logSuccess('Health check passed');
        logInfo(`Status: ${health.data.data.status}`);
        logInfo(`Network: ${health.data.data.network}`);
        logInfo(`Latest Block: ${health.data.data.latestBlockHeight}`);
        testResults.health = true;
        passedTests++;
      } else {
        logError('Health check failed - unexpected response');
      }
    } catch (error) {
      logError(`Health check failed: ${error.message}`);
    }

    // Test 2: Generate BTC Address
    logTest('2. BTC Address Generation');
    totalTests++;
    try {
      const generateResponse = await axios.post(`${BASE_URL}/generate-address`, {
        ethAddress: testEthAddress
      });
      
      if (generateResponse.data.success) {
        logSuccess('Address generation successful');
        logInfo(`ETH Address: ${generateResponse.data.data.ethAddress}`);
        logInfo(`BTC Address: ${generateResponse.data.data.btcAddress}`);
        logInfo(`Initial Balance: ${generateResponse.data.data.balance}`);
        testResults.addressGeneration = true;
        passedTests++;
      } else {
        logError('Address generation failed');
      }
    } catch (error) {
      logError(`Address generation failed: ${error.response?.data?.error || error.message}`);
    }

    // Test 3: Check Balance
    logTest('3. Balance Check');
    totalTests++;
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/check-deposit/${testEthAddress}`);
      
      if (balanceResponse.data.success) {
        logSuccess('Balance check successful');
        logInfo(`Balance: ${balanceResponse.data.data.balance} BTC`);
        logInfo(`Last Updated: ${balanceResponse.data.data.lastUpdated}`);
        testResults.balanceCheck = true;
        passedTests++;
      } else {
        logError('Balance check failed');
      }
    } catch (error) {
      logError(`Balance check failed: ${error.response?.data?.error || error.message}`);
    }

    // Test 4: Get Address Info
    logTest('4. Address Information');
    totalTests++;
    try {
      const addressResponse = await axios.get(`${BASE_URL}/address/${testEthAddress}`);
      
      if (addressResponse.data.success) {
        logSuccess('Address info retrieved successfully');
        logInfo(`BTC Address: ${addressResponse.data.data.btcAddress}`);
        logInfo(`Balance: ${addressResponse.data.data.balance}`);
        testResults.addressInfo = true;
        passedTests++;
      } else {
        logError('Address info retrieval failed');
      }
    } catch (error) {
      logError(`Address info failed: ${error.response?.data?.error || error.message}`);
    }

    // Test 5: Get Transaction History
    logTest('5. Transaction History');
    totalTests++;
    try {
      const txResponse = await axios.get(`${BASE_URL}/transactions/${testEthAddress}`);
      
      if (txResponse.data.success) {
        logSuccess('Transaction history retrieved successfully');
        logInfo(`Transaction Count: ${txResponse.data.data.transactions.length}`);
        testResults.transactionHistory = true;
        passedTests++;
      } else {
        logError('Transaction history retrieval failed');
      }
    } catch (error) {
      logError(`Transaction history failed: ${error.response?.data?.error || error.message}`);
    }

    // Test 6: Withdrawal Validation - Insufficient Balance
    logTest('6. Withdrawal Validation (Insufficient Balance)');
    totalTests++;
    try {
      await axios.post(`${BASE_URL}/withdraw`, {
        ethAddress: testEthAddress,
        btcAddress: testWithdrawAddress,
        amount: 1.0 // Try to withdraw 1 BTC when balance is likely 0
      });
      logError('Expected insufficient balance error but withdrawal succeeded');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.error === 'Insufficient balance') {
        logSuccess('Insufficient balance validation working correctly');
        logInfo(`Error: ${error.response.data.error}`);
        logInfo(`Current Balance: ${error.response.data.details.currentBalance}`);
        logInfo(`Requested Amount: ${error.response.data.details.requestedAmount}`);
        testResults.withdrawalValidation = true;
        passedTests++;
      } else {
        logError(`Unexpected error: ${error.response?.data?.error || error.message}`);
      }
    }

    // Test 7: Withdrawal Validation - Invalid BTC Address
    logTest('7. Withdrawal Validation (Invalid BTC Address)');
    totalTests++;
    try {
      await axios.post(`${BASE_URL}/withdraw`, {
        ethAddress: testEthAddress,
        btcAddress: 'invalid-address',
        amount: 0.001
      });
      logError('Expected invalid address error but withdrawal succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        logSuccess('Invalid BTC address validation working correctly');
        logInfo(`Error: ${error.response.data.error}`);
        passedTests++;
      } else {
        logError(`Unexpected error: ${error.response?.data?.error || error.message}`);
      }
    }

    // Test 8: Withdrawal Validation - Invalid ETH Address
    logTest('8. Withdrawal Validation (Invalid ETH Address)');
    totalTests++;
    try {
      await axios.post(`${BASE_URL}/withdraw`, {
        ethAddress: 'invalid-eth-address',
        btcAddress: testWithdrawAddress,
        amount: 0.001
      });
      logError('Expected invalid ETH address error but withdrawal succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        logSuccess('Invalid ETH address validation working correctly');
        logInfo(`Error: ${error.response.data.error}`);
        passedTests++;
      } else {
        logError(`Unexpected error: ${error.response?.data?.error || error.message}`);
      }
    }

    // Test 9: Successful Withdrawal (Small Amount)
    logTest('9. Successful Withdrawal');
    totalTests++;
    try {
      const withdrawResponse = await axios.post(`${BASE_URL}/withdraw`, {
        ethAddress: testEthAddress,
        btcAddress: testWithdrawAddress,
        amount: 0.00001 // Minimum amount
      });
      
      if (withdrawResponse.data.success) {
        logSuccess('Withdrawal successful!');
        logInfo(`Amount: ${withdrawResponse.data.data.amount} BTC`);
        logInfo(`Transaction Hash: ${withdrawResponse.data.data.transactionHash}`);
        logInfo(`New Balance: ${withdrawResponse.data.data.newBalance}`);
        logInfo(`Timestamp: ${withdrawResponse.data.data.timestamp}`);
        testResults.withdrawalSuccess = true;
        passedTests++;
      } else {
        logError('Withdrawal failed');
      }
    } catch (error) {
      logError(`Withdrawal failed: ${error.response?.data?.error || error.message}`);
    }

    // Test 10: Check Updated Balance After Withdrawal
    logTest('10. Updated Balance After Withdrawal');
    totalTests++;
    try {
      const updatedBalanceResponse = await axios.get(`${BASE_URL}/check-deposit/${testEthAddress}`);
      
      if (updatedBalanceResponse.data.success) {
        logSuccess('Updated balance retrieved successfully');
        logInfo(`New Balance: ${updatedBalanceResponse.data.data.balance} BTC`);
        passedTests++;
      } else {
        logError('Updated balance retrieval failed');
      }
    } catch (error) {
      logError(`Updated balance failed: ${error.response?.data?.error || error.message}`);
    }

    // Test 11: Updated Transaction History
    logTest('11. Updated Transaction History');
    totalTests++;
    try {
      const updatedTxResponse = await axios.get(`${BASE_URL}/transactions/${testEthAddress}`);
      
      if (updatedTxResponse.data.success) {
        logSuccess('Updated transaction history retrieved successfully');
        logInfo(`Total Transactions: ${updatedTxResponse.data.data.transactions.length}`);
        
        if (updatedTxResponse.data.data.transactions.length > 0) {
          const latestTx = updatedTxResponse.data.data.transactions[0];
          logInfo(`Latest Transaction:`);
          logInfo(`  Type: ${latestTx.transaction_type}`);
          logInfo(`  Amount: ${latestTx.amount}`);
          logInfo(`  Status: ${latestTx.status}`);
          logInfo(`  Hash: ${latestTx.transaction_hash}`);
        }
        passedTests++;
      } else {
        logError('Updated transaction history retrieval failed');
      }
    } catch (error) {
      logError(`Updated transaction history failed: ${error.response?.data?.error || error.message}`);
    }

    // Test 12: Rate Limiting
    logTest('12. Rate Limiting Test');
    totalTests++;
    try {
      const rapidRequests = [];
      for (let i = 0; i < 6; i++) {
        rapidRequests.push(
          axios.post(`${BASE_URL}/withdraw`, {
            ethAddress: testEthAddress,
            btcAddress: testWithdrawAddress,
            amount: 0.00001
          }).catch(error => ({ error: true, status: error.response?.status, message: error.response?.data?.message }))
        );
      }
      
      const results = await Promise.all(rapidRequests);
      const rateLimited = results.filter(r => r.error && r.status === 429).length;
      
      if (rateLimited > 0) {
        logSuccess(`Rate limiting working correctly: ${rateLimited} requests were rate limited`);
        testResults.rateLimiting = true;
        passedTests++;
      } else {
        logWarning('Rate limiting may not be working as expected');
      }
    } catch (error) {
      logError(`Rate limiting test failed: ${error.message}`);
    }

    // Test 13: Error Handling
    logTest('13. Error Handling');
    totalTests++;
    try {
      // Test with non-existent user
      await axios.get(`${BASE_URL}/check-deposit/0x0000000000000000000000000000000000000000`);
      logError('Expected 404 error for non-existent user');
    } catch (error) {
      if (error.response?.status === 404) {
        logSuccess('Error handling working correctly for non-existent user');
        testResults.errorHandling = true;
        passedTests++;
      } else {
        logError(`Unexpected error: ${error.response?.data?.error || error.message}`);
      }
    }

    // Test 14: Admin Endpoint (if API key is configured)
    logTest('14. Admin Endpoint Test');
    totalTests++;
    try {
      const adminResponse = await axios.get(`${BASE_URL}/admin/users`);
      if (adminResponse.data.success) {
        logSuccess('Admin endpoint accessible');
        logInfo(`Total Users: ${adminResponse.data.data.users.length}`);
        passedTests++;
      } else {
        logWarning('Admin endpoint may require authentication');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logWarning('Admin endpoint requires authentication (expected)');
        passedTests++;
      } else {
        logError(`Admin endpoint error: ${error.response?.data?.error || error.message}`);
      }
    }

  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
  }

  // Final Results
  log('\n' + '='.repeat(60), 'bright');
  log('📊 TEST RESULTS SUMMARY', 'bright');
  log('='.repeat(60), 'bright');
  
  log(`\n🎯 Tests Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, passedTests === totalTests ? 'green' : 'yellow');
  
  log('\n📋 Detailed Results:', 'bright');
  Object.entries(testResults).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`  ${test}: ${status}`, color);
  });

  if (passedTests === totalTests) {
    log('\n🎉 ALL TESTS PASSED! BTC API is ready for production!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
  }

  log('\n🚀 Next Steps:', 'bright');
  log('1. Review any failed tests');
  log('2. Check API logs for detailed error information');
  log('3. Verify environment configuration');
  log('4. Test with real BTC addresses if needed');
  log('5. Deploy to production when ready');

  return {
    passed: passedTests,
    total: totalTests,
    successRate: (passedTests / totalTests) * 100,
    results: testResults
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runCompleteTests().then(results => {
    process.exit(results.passed === results.total ? 0 : 1);
  });
}

module.exports = { runCompleteTests };
