// scripts/deploy.ts
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const ContractFactory = await ethers.getContractFactory("ReputationSystem");
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  const filePath = path.join(__dirname, "../project/src/contractAddress.json");
  fs.writeFileSync(filePath, JSON.stringify({ address }, null, 2));

  console.log("✅ Contract deployed to:", address);
  console.log("📦 Address written to project/src/contractAddress.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
