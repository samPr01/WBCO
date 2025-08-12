import { ethers } from "hardhat";

async function main() {
  console.log("Deploying WalletBase contract...");

  const WalletBase = await ethers.getContractFactory("WalletBase");
  const walletBase = await WalletBase.deploy();

  await walletBase.waitForDeployment();

  const address = await walletBase.getAddress();
  console.log("WalletBase deployed to:", address);

  // Verify contract on Etherscan
  console.log("Waiting for block confirmations...");
  await walletBase.deployTransaction.wait(6);
  
  console.log("Contract deployed successfully!");
  console.log("Contract address:", address);
  console.log("Network:", network.name);
  
  // Save deployment info
  const deploymentInfo = {
    contract: "WalletBase",
    address: address,
    network: network.name,
    deployer: await walletBase.signer.getAddress(),
    timestamp: new Date().toISOString(),
  };
  
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
