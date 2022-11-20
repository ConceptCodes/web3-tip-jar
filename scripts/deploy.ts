import { ethers } from "hardhat";

async function main() {
  const TipJar = await ethers.getContractFactory("TipJar");
  const tips = await TipJar.deploy();

  await tips.deployed();

  console.log(`[${Date.now()}] TipJar deployed to ${tips.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
