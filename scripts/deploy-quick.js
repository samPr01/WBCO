const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying WalletBase contract...");

  // Get the contract factory
  const WalletBase = await ethers.getContractFactory("WalletBase");
  
  // Deploy the contract
  const walletBase = await WalletBase.deploy();
  await walletBase.waitForDeployment();
  
  const address = await walletBase.getAddress();
  console.log("✅ WalletBase deployed to:", address);
  
  // Add some common tokens
  console.log("🔧 Configuring supported tokens...");
  
  // USDT on Ethereum mainnet
  await walletBase.addSupportedToken("0xdAC17F958D2ee523a2206206994597C13D831ec7", 6);
  await walletBase.setTokenLimits(
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    ethers.parseUnits("10", 6),    // min deposit: 10 USDT
    ethers.parseUnits("10000", 6), // max deposit: 10,000 USDT
    ethers.parseUnits("5", 6),     // min withdrawal: 5 USDT
    ethers.parseUnits("5000", 6)   // max withdrawal: 5,000 USDT
  );
  
  // USDC on Ethereum mainnet
  await walletBase.addSupportedToken("0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C", 6);
  await walletBase.setTokenLimits(
    "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C",
    ethers.parseUnits("10", 6),    // min deposit: 10 USDC
    ethers.parseUnits("10000", 6), // max deposit: 10,000 USDC
    ethers.parseUnits("5", 6),     // min withdrawal: 5 USDC
    ethers.parseUnits("5000", 6)   // max withdrawal: 5,000 USDC
  );
  
  console.log("✅ Contract deployment complete!");
  console.log("📋 Contract Address:", address);
  console.log("🔗 Add this address to your frontend configuration");
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
