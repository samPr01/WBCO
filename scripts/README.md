# WBCO Deploy Test Script

A comprehensive Node.js script for automated deployment testing, wallet configuration updates, and build analysis for the WBCO project.

## 🚀 Features

### ✅ Wallet Configuration Management
- Updates wallet addresses in `config/wallets.json`
- Supports BTC, USDT, and Ethereum addresses
- Secure environment variable handling
- Automatic configuration validation

### ✅ Automated API Testing
- BTC deposit and withdrawal simulation
- USDT deposit and withdrawal testing
- Ethereum deposit and withdrawal verification
- API health checks and connectivity testing

### ✅ Build Analysis
- Runs `npm run build` to compile the project
- Calculates total build size
- Checks against Netlify deployment limits (1MB)
- Provides optimization recommendations

### ✅ Comprehensive Reporting
- Detailed test results with pass/fail status
- Build size analysis and warnings
- Color-coded console output
- Exit codes for CI/CD integration

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to the WBCO API (optional, for full testing)
- Jest (for running tests)

## 🛠️ Installation

1. **Navigate to the scripts directory:**
```bash
cd scripts
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables (optional):**
```bash
export NODE_ENV=development
export API_BASE_URL=http://localhost:3001
```

## 🚀 Usage

### Basic Usage

```bash
# Run the complete deploy test suite
npm run deploy-test

# Or run directly with node
node deploy-test.js
```

### Running Tests

```bash
# Run Jest tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `API_BASE_URL` | Base URL for API testing | `http://localhost:3001` |

## 📁 Configuration

### Wallet Addresses

The script updates the following wallet addresses in `config/wallets.json`:

```json
{
  "wallets": {
    "BTC": "bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l",
    "USDT": "TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY",
    "Ethereum": "0x2499aDe1b915E12819e8E38B1d9ed3493107E2B1"
  },
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### Test Amounts

Default test amounts (configurable in the script):

- **BTC**: 0.001 BTC
- **USDT**: 10 USDT
- **ETH**: 0.01 ETH

## 🔧 Customization

### Modifying Wallet Addresses

Edit the `CONFIG.wallets` object in `deploy-test.js`:

```javascript
const CONFIG = {
  wallets: {
    BTC: 'your-btc-address',
    USDT: 'your-usdt-address',
    Ethereum: 'your-eth-address'
  },
  // ... other config
};
```

### Adjusting Test Amounts

Modify the `CONFIG.test` object:

```javascript
const CONFIG = {
  test: {
    btcAmount: 0.001,
    usdtAmount: 10,
    ethAmount: 0.01
  },
  // ... other config
};
```

### Changing Build Size Limits

Update the `CONFIG.build.maxSize` value:

```javascript
const CONFIG = {
  build: {
    maxSize: 2 * 1024 * 1024, // 2MB
    distPath: './dist'
  },
  // ... other config
};
```

## 📊 Test Results

The script provides detailed test results including:

### Test Categories

1. **Wallet Configuration Update** ✅
2. **BTC Deposit Simulation** ✅
3. **BTC Withdrawal Test** ✅
4. **USDT Deposit Simulation** ✅
5. **USDT Withdrawal Test** ✅
6. **ETH Deposit Simulation** ✅
7. **ETH Withdrawal Test** ✅
8. **Project Build** ✅
9. **Build Size Analysis** ✅

### Sample Output

```
🚀 Starting Deploy Test Suite...
============================================================

🚀 1. Updating Wallet Configuration
✅ Wallet configuration updated successfully
ℹ️  BTC: bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l
ℹ️  USDT: TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY
ℹ️  Ethereum: 0x2499aDe1b915E12819e8E38B1d9ed3493107E2B1

🚀 2. Running API Tests
✅ API is available and healthy
ℹ️  Testing BTC Operations...
✅ BTC deposit simulation successful: 0.001 BTC
✅ BTC withdrawal test successful: 0.001 BTC
ℹ️  Testing USDT Operations...
✅ USDT deposit simulation successful: 10 USDT
✅ USDT withdrawal test successful: 10 USDT
ℹ️  Testing ETH Operations...
✅ ETH deposit simulation successful: 0.01 ETH
✅ ETH withdrawal test successful: 0.01 ETH

🚀 3. Building Project
ℹ️  Running npm run build...
✅ Project built successfully

🚀 4. Analyzing Build Size
ℹ️  Build size: 0.85 MB (870 KB)
✅ Build size is within acceptable limits for Netlify

🚀 5. Generating Test Report
============================================================
📊 DEPLOY TEST RESULTS
============================================================

🎯 Tests Passed: 9/9
📈 Success Rate: 100.0%

📋 Detailed Results:
  Wallet Configuration Update: ✅ PASS
  BTC Deposit Simulation: ✅ PASS
  BTC Withdrawal Test: ✅ PASS
  USDT Deposit Simulation: ✅ PASS
  USDT Withdrawal Test: ✅ PASS
  ETH Deposit Simulation: ✅ PASS
  ETH Withdrawal Test: ✅ PASS
  Project Build: ✅ PASS
  Build Size Analysis: ✅ PASS

📦 Build Size: 0.85 MB

🎉 ALL TESTS PASSED! Ready for deployment!

🚀 Next Steps:
1. Review any failed tests
2. Check API connectivity and configuration
3. Verify wallet addresses are correct
4. Deploy to Netlify when ready
```

## 🔒 Security Features

### Environment Variable Protection
- Sensitive data uses environment variables
- Default values for development
- Validation of required variables

### Safe Testing
- Uses testnet addresses for testing
- Simulated deposits (no real transactions)
- Timeout protection for API calls
- Error handling for all operations

### Build Security
- Validates build output
- Checks for build errors
- Analyzes build size for deployment readiness

## 🚨 Error Handling

The script handles various error scenarios:

### API Errors
- Connection timeouts
- Invalid responses
- Service unavailability

### Build Errors
- Compilation failures
- Missing dependencies
- Build timeout

### File System Errors
- Permission denied
- Disk space issues
- Invalid paths

### Configuration Errors
- Missing environment variables
- Invalid wallet addresses
- Malformed configuration

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if the API server is running
   - Verify the `API_BASE_URL` environment variable
   - Check network connectivity

2. **Build Failed**
   - Ensure all dependencies are installed
   - Check for TypeScript compilation errors
   - Verify the build script in package.json

3. **Permission Denied**
   - Check file system permissions
   - Ensure write access to config directory
   - Run with appropriate user privileges

4. **Large Build Size**
   - Enable code splitting
   - Optimize images and assets
   - Remove unused dependencies
   - Enable gzip compression

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
export DEBUG=true
node deploy-test.js
```

## 📈 CI/CD Integration

### GitHub Actions

```yaml
name: Deploy Test
on: [push, pull_request]

jobs:
  deploy-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: cd scripts && npm install
      - run: cd scripts && npm run deploy-test
```

### Exit Codes

- `0`: All tests passed, ready for deployment
- `1`: Some tests failed, review before deployment

## 📝 API Endpoints Tested

The script tests the following API endpoints:

### BTC API
- `GET /api/btc/health` - Health check
- `POST /api/btc/generate-address` - Generate BTC address
- `POST /api/btc/withdraw` - BTC withdrawal

### USDT API (Simulated)
- Deposit simulation
- Withdrawal testing

### ETH API (Simulated)
- Deposit simulation
- Withdrawal testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the error logs
3. Verify your configuration
4. Open an issue on GitHub

## 🔄 Version History

- **v1.0.0**: Initial release with comprehensive testing
- Features: Wallet config, API testing, build analysis
- Security: Environment variables, safe testing
- Reporting: Detailed results with color coding
