const hre = require("hardhat");

async function main() {
  console.log("Deploying FraudShield contract...");

  const FraudShield = await hre.ethers.getContractFactory("FraudShield");
  const fraudShield = await FraudShield.deploy();

  await fraudShield.waitForDeployment();

  const address = await fraudShield.getAddress();
  console.log(`FraudShield deployed to: ${address}`);
  console.log("Save this address for your frontend configuration.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
