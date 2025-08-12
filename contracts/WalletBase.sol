// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title WalletBase
 * @dev A secure contract for handling ETH and ERC20 token deposits and withdrawals
 */
contract WalletBase is ReentrancyGuard, Ownable, Pausable {
    
    // Minimal ERC20 interface
    interface IERC20 {
        function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
        function transfer(address recipient, uint256 amount) external returns (bool);
        function approve(address spender, uint256 amount) external returns (bool);
        function decimals() external view returns (uint8);
        function balanceOf(address account) external view returns (uint256);
    }
    
    // Events
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event TokenDeposited(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event TokenWithdrawn(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);
    
    // User balances - ETH and ERC20 tokens
    mapping(address => uint256) public balances; // ETH balances
    mapping(address => mapping(address => uint256)) public tokenBalances; // Token balances [user][token]
    
    // Supported tokens whitelist
    mapping(address => bool) public supportedTokens;
    mapping(address => uint8) public tokenDecimals;
    
    // Minimum and maximum transaction limits
    uint256 public minDeposit = 0.001 ether;
    uint256 public maxDeposit = 100 ether;
    uint256 public minWithdrawal = 0.001 ether;
    uint256 public maxWithdrawal = 50 ether;
    
    // Token-specific limits (in token units)
    mapping(address => uint256) public tokenMinDeposits;
    mapping(address => uint256) public tokenMaxDeposits;
    mapping(address => uint256) public tokenMinWithdrawals;
    mapping(address => uint256) public tokenMaxWithdrawals;
    
    // Daily limits
    mapping(address => uint256) public dailyDeposits;
    mapping(address => uint256) public dailyWithdrawals;
    mapping(address => mapping(address => uint256)) public dailyTokenDeposits; // [user][token]
    mapping(address => mapping(address => uint256)) public dailyTokenWithdrawals; // [user][token]
    mapping(address => uint256) public lastResetTime;
    uint256 public dailyDepositLimit = 1000 ether;
    uint256 public dailyWithdrawalLimit = 500 ether;
    
    // Fee structure (in basis points: 100 = 1%)
    uint256 public depositFee = 0; // 0% deposit fee
    uint256 public withdrawalFee = 50; // 0.5% withdrawal fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Pause functionality
    bool public depositsPaused = false;
    bool public withdrawalsPaused = false;
    
    constructor() {
        _transferOwnership(msg.sender);
        
        // Initialize supported tokens
        _addSupportedToken(address(0), 18); // ETH
        _addSupportedToken(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599, 8); // WBTC on Ethereum mainnet
        
        // Set WBTC limits (in WBTC units)
        tokenMinDeposits[0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599] = 0.0001 * 10**8; // 0.0001 WBTC
        tokenMaxDeposits[0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599] = 10 * 10**8; // 10 WBTC
        tokenMinWithdrawals[0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599] = 0.0001 * 10**8; // 0.0001 WBTC
        tokenMaxWithdrawals[0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599] = 5 * 10**8; // 5 WBTC
    }
    
    /**
     * @dev Add supported token
     */
    function addSupportedToken(address token, uint8 decimals) external onlyOwner {
        _addSupportedToken(token, decimals);
    }
    
    function _addSupportedToken(address token, uint8 decimals) internal {
        supportedTokens[token] = true;
        tokenDecimals[token] = decimals;
    }
    
    /**
     * @dev Remove supported token
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }
    
    /**
     * @dev Set token limits
     */
    function setTokenLimits(
        address token,
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 minWithdrawal,
        uint256 maxWithdrawal
    ) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        tokenMinDeposits[token] = minDeposit;
        tokenMaxDeposits[token] = maxDeposit;
        tokenMinWithdrawals[token] = minWithdrawal;
        tokenMaxWithdrawals[token] = maxWithdrawal;
    }
    
    /**
     * @dev Deposit ETH into the contract
     */
    function deposit() external payable nonReentrant whenNotPaused {
        require(!depositsPaused, "Deposits are currently paused");
        require(msg.value >= minDeposit, "Amount below minimum deposit");
        require(msg.value <= maxDeposit, "Amount above maximum deposit");
        require(checkDailyLimit(msg.sender, msg.value, true), "Daily deposit limit exceeded");
        
        // Calculate fee
        uint256 fee = (msg.value * depositFee) / FEE_DENOMINATOR;
        uint256 depositAmount = msg.value - fee;
        
        // Update balances
        balances[msg.sender] += depositAmount;
        updateDailyLimits(msg.sender, msg.value, true);
        
        emit Deposit(msg.sender, depositAmount, block.timestamp);
    }
    
    /**
     * @dev Deposit ERC20 token into the contract
     */
    function depositToken(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(!depositsPaused, "Deposits are currently paused");
        require(supportedTokens[token], "Token not supported");
        require(amount >= tokenMinDeposits[token], "Amount below minimum deposit");
        require(amount <= tokenMaxDeposits[token], "Amount above maximum deposit");
        require(checkDailyTokenLimit(msg.sender, token, amount, true), "Daily token deposit limit exceeded");
        
        // Transfer tokens from user to contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Calculate fee
        uint256 fee = (amount * depositFee) / FEE_DENOMINATOR;
        uint256 depositAmount = amount - fee;
        
        // Update balances
        tokenBalances[msg.sender][token] += depositAmount;
        updateDailyTokenLimits(msg.sender, token, amount, true);
        
        emit TokenDeposited(msg.sender, token, depositAmount, block.timestamp);
    }
    
    /**
     * @dev Withdraw ETH from the contract
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(!withdrawalsPaused, "Withdrawals are currently paused");
        require(amount >= minWithdrawal, "Amount below minimum withdrawal");
        require(amount <= maxWithdrawal, "Amount above maximum withdrawal");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(checkDailyLimit(msg.sender, amount, false), "Daily withdrawal limit exceeded");
        
        // Calculate fee
        uint256 fee = (amount * withdrawalFee) / FEE_DENOMINATOR;
        uint256 withdrawalAmount = amount - fee;
        
        // Update balances
        balances[msg.sender] -= amount;
        updateDailyLimits(msg.sender, amount, false);
        
        // Transfer funds
        (bool success, ) = payable(msg.sender).call{value: withdrawalAmount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(msg.sender, withdrawalAmount, block.timestamp);
    }
    
    /**
     * @dev Withdraw ERC20 token from the contract
     */
    function withdrawToken(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(!withdrawalsPaused, "Withdrawals are currently paused");
        require(supportedTokens[token], "Token not supported");
        require(amount >= tokenMinWithdrawals[token], "Amount below minimum withdrawal");
        require(amount <= tokenMaxWithdrawals[token], "Amount above maximum withdrawal");
        require(tokenBalances[msg.sender][token] >= amount, "Insufficient token balance");
        require(checkDailyTokenLimit(msg.sender, token, amount, false), "Daily token withdrawal limit exceeded");
        
        // Calculate fee
        uint256 fee = (amount * withdrawalFee) / FEE_DENOMINATOR;
        uint256 withdrawalAmount = amount - fee;
        
        // Update balances
        tokenBalances[msg.sender][token] -= amount;
        updateDailyTokenLimits(msg.sender, token, amount, false);
        
        // Transfer tokens
        bool success = IERC20(token).transfer(msg.sender, withdrawalAmount);
        require(success, "Token withdrawal failed");
        
        emit TokenWithdrawn(msg.sender, token, withdrawalAmount, block.timestamp);
    }
    
    /**
     * @dev Get user ETH balance
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    /**
     * @dev Get user token balance
     */
    function getTokenBalance(address user, address token) external view returns (uint256) {
        return tokenBalances[user][token];
    }
    
    /**
     * @dev Get contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get contract token balance
     */
    function getContractTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @dev Check daily limits for ETH
     */
    function checkDailyLimit(address user, uint256 amount, bool isDeposit) internal view returns (bool) {
        uint256 lastReset = lastResetTime[user];
        uint256 currentTime = block.timestamp;
        
        // Reset daily limits if 24 hours have passed
        if (currentTime >= lastReset + 1 days) {
            return true;
        }
        
        if (isDeposit) {
            return dailyDeposits[user] + amount <= dailyDepositLimit;
        } else {
            return dailyWithdrawals[user] + amount <= dailyWithdrawalLimit;
        }
    }
    
    /**
     * @dev Check daily limits for tokens
     */
    function checkDailyTokenLimit(address user, address token, uint256 amount, bool isDeposit) internal view returns (bool) {
        uint256 lastReset = lastResetTime[user];
        uint256 currentTime = block.timestamp;
        
        // Reset daily limits if 24 hours have passed
        if (currentTime >= lastReset + 1 days) {
            return true;
        }
        
        if (isDeposit) {
            return dailyTokenDeposits[user][token] + amount <= dailyDepositLimit;
        } else {
            return dailyTokenWithdrawals[user][token] + amount <= dailyWithdrawalLimit;
        }
    }
    
    /**
     * @dev Update daily limits for ETH
     */
    function updateDailyLimits(address user, uint256 amount, bool isDeposit) internal {
        uint256 lastReset = lastResetTime[user];
        uint256 currentTime = block.timestamp;
        
        // Reset daily limits if 24 hours have passed
        if (currentTime >= lastReset + 1 days) {
            if (isDeposit) {
                dailyDeposits[user] = amount;
            } else {
                dailyWithdrawals[user] = amount;
            }
            lastResetTime[user] = currentTime;
        } else {
            if (isDeposit) {
                dailyDeposits[user] += amount;
            } else {
                dailyWithdrawals[user] += amount;
            }
        }
    }
    
    /**
     * @dev Update daily limits for tokens
     */
    function updateDailyTokenLimits(address user, address token, uint256 amount, bool isDeposit) internal {
        uint256 lastReset = lastResetTime[user];
        uint256 currentTime = block.timestamp;
        
        // Reset daily limits if 24 hours have passed
        if (currentTime >= lastReset + 1 days) {
            if (isDeposit) {
                dailyTokenDeposits[user][token] = amount;
            } else {
                dailyTokenWithdrawals[user][token] = amount;
            }
            lastResetTime[user] = currentTime;
        } else {
            if (isDeposit) {
                dailyTokenDeposits[user][token] += amount;
            } else {
                dailyTokenWithdrawals[user][token] += amount;
            }
        }
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdrawal(owner(), balance);
    }
    
    /**
     * @dev Emergency token withdrawal (owner only)
     */
    function emergencyWithdrawToken(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        bool success = IERC20(token).transfer(owner(), balance);
        require(success, "Emergency token withdrawal failed");
        
        emit TokenWithdrawn(owner(), token, balance, block.timestamp);
    }
    
    /**
     * @dev Pause/unpause deposits (owner only)
     */
    function setDepositsPaused(bool paused) external onlyOwner {
        depositsPaused = paused;
    }
    
    /**
     * @dev Pause/unpause withdrawals (owner only)
     */
    function setWithdrawalsPaused(bool paused) external onlyOwner {
        withdrawalsPaused = paused;
    }
    
    /**
     * @dev Set transaction limits (owner only)
     */
    function setLimits(
        uint256 _minDeposit,
        uint256 _maxDeposit,
        uint256 _minWithdrawal,
        uint256 _maxWithdrawal
    ) external onlyOwner {
        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
        minWithdrawal = _minWithdrawal;
        maxWithdrawal = _maxWithdrawal;
    }
    
    /**
     * @dev Set daily limits (owner only)
     */
    function setDailyLimits(
        uint256 _dailyDepositLimit,
        uint256 _dailyWithdrawalLimit
    ) external onlyOwner {
        dailyDepositLimit = _dailyDepositLimit;
        dailyWithdrawalLimit = _dailyWithdrawalLimit;
    }
    
    /**
     * @dev Set fees (owner only)
     */
    function setFees(uint256 _depositFee, uint256 _withdrawalFee) external onlyOwner {
        require(_depositFee <= 500, "Deposit fee too high"); // Max 5%
        require(_withdrawalFee <= 500, "Withdrawal fee too high"); // Max 5%
        depositFee = _depositFee;
        withdrawalFee = _withdrawalFee;
    }
    
    /**
     * @dev Get user's daily limits info
     */
    function getUserDailyLimits(address user) external view returns (
        uint256 depositUsed,
        uint256 withdrawalUsed,
        uint256 lastReset
    ) {
        uint256 lastResetTime_ = lastResetTime[user];
        uint256 currentTime = block.timestamp;
        
        if (currentTime >= lastResetTime_ + 1 days) {
            return (0, 0, lastResetTime_);
        }
        
        return (dailyDeposits[user], dailyWithdrawals[user], lastResetTime_);
    }
    
    /**
     * @dev Get user's daily token limits info
     */
    function getUserDailyTokenLimits(address user, address token) external view returns (
        uint256 depositUsed,
        uint256 withdrawalUsed,
        uint256 lastReset
    ) {
        uint256 lastResetTime_ = lastResetTime[user];
        uint256 currentTime = block.timestamp;
        
        if (currentTime >= lastResetTime_ + 1 days) {
            return (0, 0, lastResetTime_);
        }
        
        return (dailyTokenDeposits[user][token], dailyTokenWithdrawals[user][token], lastResetTime_);
    }
    
    // Fallback function to receive ETH
    receive() external payable {
        revert("Use deposit() function");
    }
}
