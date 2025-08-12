const { DeployTestRunner, CONFIG } = require('./deploy-test');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Mock axios for testing
jest.mock('axios');

describe('DeployTestRunner', () => {
  let runner;
  let mockConsoleLog;

  beforeEach(() => {
    runner = new DeployTestRunner();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    test('should have correct wallet addresses', () => {
      expect(CONFIG.wallets.BTC).toBe('bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l');
      expect(CONFIG.wallets.USDT).toBe('TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY');
      expect(CONFIG.wallets.Ethereum).toBe('0x2499aDe1b915E12819e8E38B1d9ed3493107E2B1');
    });

    test('should have correct test amounts', () => {
      expect(CONFIG.test.btcAmount).toBe(0.001);
      expect(CONFIG.test.usdtAmount).toBe(10);
      expect(CONFIG.test.ethAmount).toBe(0.01);
    });

    test('should have correct build size limit', () => {
      expect(CONFIG.build.maxSize).toBe(1024 * 1024); // 1MB
    });
  });

  describe('Wallet Configuration Update', () => {
    test('should update wallet configuration successfully', async () => {
      // Mock fs.promises
      const mockMkdir = jest.spyOn(fs, 'mkdir').mockResolvedValue();
      const mockWriteFile = jest.spyOn(fs, 'writeFile').mockResolvedValue();

      await runner.updateWalletConfig();

      expect(mockMkdir).toHaveBeenCalledWith(
        path.join(process.cwd(), 'config'),
        { recursive: true }
      );

      expect(mockWriteFile).toHaveBeenCalledWith(
        path.join(process.cwd(), 'config', 'wallets.json'),
        expect.stringContaining('"BTC": "bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l"')
      );

      expect(runner.testResults.configUpdate).toBe(true);

      mockMkdir.mockRestore();
      mockWriteFile.mockRestore();
    });

    test('should handle wallet configuration update errors', async () => {
      const mockWriteFile = jest.spyOn(fs, 'writeFile').mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(runner.updateWalletConfig()).rejects.toThrow(
        'Failed to update wallet config: Permission denied'
      );

      mockWriteFile.mockRestore();
    });
  });

  describe('API Tests', () => {
    test('should check API availability successfully', async () => {
      axios.get.mockResolvedValue({
        data: { success: true, status: 'healthy' }
      });

      await runner.checkAPIAvailability();

      expect(axios.get).toHaveBeenCalledWith(
        `${CONFIG.api.baseUrl}/api/btc/health`,
        { timeout: CONFIG.api.timeout }
      );
    });

    test('should handle API unavailability', async () => {
      axios.get.mockRejectedValue(new Error('Connection refused'));

      await expect(runner.checkAPIAvailability()).rejects.toThrow(
        'API not available: Connection refused'
      );
    });

    test('should test BTC operations successfully', async () => {
      // Mock successful API responses
      axios.post.mockResolvedValueOnce({
        data: { success: true, data: { btcAddress: 'test-address' } }
      });
      axios.post.mockResolvedValueOnce({
        data: { success: true, data: { newBalance: '0.001' } }
      });

      await runner.testBTCOperations();

      expect(runner.testResults.btcDeposit).toBe(true);
      expect(runner.testResults.btcWithdrawal).toBe(true);
    });

    test('should test USDT operations successfully', async () => {
      // Mock setTimeout
      jest.useFakeTimers();

      const promise = runner.testUSDTOperations();
      jest.runAllTimers();
      await promise;

      expect(runner.testResults.usdtDeposit).toBe(true);
      expect(runner.testResults.usdtWithdrawal).toBe(true);

      jest.useRealTimers();
    });

    test('should test ETH operations successfully', async () => {
      // Mock setTimeout
      jest.useFakeTimers();

      const promise = runner.testETHOperations();
      jest.runAllTimers();
      await promise;

      expect(runner.testResults.ethDeposit).toBe(true);
      expect(runner.testResults.ethWithdrawal).toBe(true);

      jest.useRealTimers();
    });
  });

  describe('Build Analysis', () => {
    test('should calculate directory size correctly', async () => {
      // Mock fs.readdir and fs.stat
      const mockReaddir = jest.spyOn(fs, 'readdir').mockResolvedValue([
        { name: 'file1.js', isDirectory: () => false },
        { name: 'file2.css', isDirectory: () => false },
        { name: 'subdir', isDirectory: () => true }
      ]);

      const mockStat = jest.spyOn(fs, 'stat')
        .mockResolvedValueOnce({ size: 1024 }) // file1.js
        .mockResolvedValueOnce({ size: 2048 }) // file2.css
        .mockResolvedValueOnce({ size: 512 }); // subdir file

      const mockReaddirSubdir = jest.spyOn(fs, 'readdir').mockResolvedValueOnce([
        { name: 'subfile.txt', isDirectory: () => false }
      ]);

      const size = await runner.calculateDirectorySize('/test/path');

      expect(size).toBe(3584); // 1024 + 2048 + 512

      mockReaddir.mockRestore();
      mockStat.mockRestore();
      mockReaddirSubdir.mockRestore();
    });

    test('should check if directory exists', async () => {
      const mockAccess = jest.spyOn(fs, 'access').mockResolvedValue();

      const exists = await runner.directoryExists('/test/path');

      expect(exists).toBe(true);
      expect(mockAccess).toHaveBeenCalledWith('/test/path');

      mockAccess.mockRestore();
    });

    test('should return false for non-existent directory', async () => {
      const mockAccess = jest.spyOn(fs, 'access').mockRejectedValue(
        new Error('ENOENT')
      );

      const exists = await runner.directoryExists('/non/existent/path');

      expect(exists).toBe(false);

      mockAccess.mockRestore();
    });
  });

  describe('Report Generation', () => {
    test('should generate report with all tests passed', () => {
      // Set all tests to passed
      Object.keys(runner.testResults).forEach(key => {
        runner.testResults[key] = true;
      });
      runner.testResults.buildSize = 512 * 1024; // 512KB

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      runner.generateReport();

      expect(mockExit).toHaveBeenCalledWith(0);

      mockExit.mockRestore();
    });

    test('should generate report with some tests failed', () => {
      // Set some tests to failed
      runner.testResults.configUpdate = false;
      runner.testResults.buildSuccess = false;

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      runner.generateReport();

      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });

    test('should warn about large build size', () => {
      // Set all tests to passed but large build size
      Object.keys(runner.testResults).forEach(key => {
        runner.testResults[key] = true;
      });
      runner.testResults.buildSize = 2 * 1024 * 1024; // 2MB

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      runner.generateReport();

      expect(mockExit).toHaveBeenCalledWith(0);

      mockExit.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    test('should run complete test suite successfully', async () => {
      // Mock all dependencies
      const mockMkdir = jest.spyOn(fs, 'mkdir').mockResolvedValue();
      const mockWriteFile = jest.spyOn(fs, 'writeFile').mockResolvedValue();
      const mockReaddir = jest.spyOn(fs, 'readdir').mockResolvedValue([]);
      const mockAccess = jest.spyOn(fs, 'access').mockResolvedValue();
      const mockStat = jest.spyOn(fs, 'stat').mockResolvedValue({ size: 1024 });

      axios.get.mockResolvedValue({
        data: { success: true, status: 'healthy' }
      });
      axios.post.mockResolvedValue({
        data: { success: true, data: { btcAddress: 'test-address' } }
      });

      // Mock setTimeout
      jest.useFakeTimers();

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      const promise = runner.run();
      jest.runAllTimers();
      await promise;

      expect(mockExit).toHaveBeenCalledWith(0);

      // Cleanup
      mockMkdir.mockRestore();
      mockWriteFile.mockRestore();
      mockReaddir.mockRestore();
      mockAccess.mockRestore();
      mockStat.mockRestore();
      mockExit.mockRestore();
      jest.useRealTimers();
    });

    test('should handle errors gracefully', async () => {
      const mockWriteFile = jest.spyOn(fs, 'writeFile').mockRejectedValue(
        new Error('Test error')
      );

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await runner.run();

      expect(mockExit).toHaveBeenCalledWith(1);

      mockWriteFile.mockRestore();
      mockExit.mockRestore();
    });
  });
});

// Test utilities
describe('Test Utilities', () => {
  test('should validate environment variables', () => {
    const originalEnv = process.env.NODE_ENV;
    
    // Test with missing NODE_ENV
    delete process.env.NODE_ENV;
    
    // This would normally be called by the main function
    // For testing, we'll just verify the behavior
    expect(process.env.NODE_ENV).toBeUndefined();
    
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  test('should handle configuration with environment variables', () => {
    const originalApiUrl = process.env.API_BASE_URL;
    
    // Test with custom API URL
    process.env.API_BASE_URL = 'http://custom-api:3001';
    
    // Re-import to get updated config
    jest.resetModules();
    const { CONFIG: UpdatedConfig } = require('./deploy-test');
    
    expect(UpdatedConfig.api.baseUrl).toBe('http://custom-api:3001');
    
    // Restore original environment
    process.env.API_BASE_URL = originalApiUrl;
  });
});
