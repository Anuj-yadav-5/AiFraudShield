const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FraudShield", function () {
  let fraudShield;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const FraudShield = await ethers.getContractFactory("FraudShield");
    fraudShield = await FraudShield.deploy();
    await fraudShield.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as owner", async function () {
      expect(await fraudShield.owner()).to.equal(owner.address);
    });

    it("Should start with zero assessments", async function () {
      expect(await fraudShield.getAssessmentCount()).to.equal(0);
    });
  });

  describe("recordRiskAssessment", function () {
    it("Should record a low-risk assessment", async function () {
      const tx = await fraudShield.recordRiskAssessment(
        "TX001",
        owner.address,
        addr1.address,
        15,
        "Low",
        "Allow"
      );

      await expect(tx)
        .to.emit(fraudShield, "RiskAssessmentRecorded")
        .withArgs(
          "TX001",
          owner.address,
          addr1.address,
          15,
          "Low",
          "Allow",
          await getBlockTimestamp(tx)
        );

      expect(await fraudShield.getAssessmentCount()).to.equal(1);
    });

    it("Should record a high-risk assessment", async function () {
      await fraudShield.recordRiskAssessment(
        "TX002",
        owner.address,
        addr1.address,
        91,
        "High",
        "Hold"
      );

      const result = await fraudShield.getRiskAssessment("TX002");
      expect(result.riskScore).to.equal(91);
      expect(result.riskLevel).to.equal("High");
      expect(result.action).to.equal("Hold");
    });

    it("Should reject risk score above 100", async function () {
      await expect(
        fraudShield.recordRiskAssessment(
          "TX003",
          owner.address,
          addr1.address,
          101,
          "High",
          "Hold"
        )
      ).to.be.revertedWith("Risk score must be 0-100");
    });

    it("Should reject duplicate transaction IDs", async function () {
      await fraudShield.recordRiskAssessment(
        "TX004",
        owner.address,
        addr1.address,
        50,
        "Medium",
        "Warn"
      );

      await expect(
        fraudShield.recordRiskAssessment(
          "TX004",
          owner.address,
          addr1.address,
          50,
          "Medium",
          "Warn"
        )
      ).to.be.revertedWith("Assessment already recorded");
    });
  });

  describe("getRiskAssessment", function () {
    it("Should return correct assessment data", async function () {
      await fraudShield.recordRiskAssessment(
        "TX005",
        owner.address,
        addr1.address,
        65,
        "Medium",
        "Warn"
      );

      const result = await fraudShield.getRiskAssessment("TX005");
      expect(result.txId).to.equal("TX005");
      expect(result.sender).to.equal(owner.address);
      expect(result.recipient).to.equal(addr1.address);
      expect(result.riskScore).to.equal(65);
      expect(result.riskLevel).to.equal("Medium");
      expect(result.action).to.equal("Warn");
    });

    it("Should revert for non-existent assessment", async function () {
      await expect(
        fraudShield.getRiskAssessment("NONEXISTENT")
      ).to.be.revertedWith("Assessment not found");
    });
  });

  describe("getAssessmentIdAtIndex", function () {
    it("Should return IDs in order", async function () {
      await fraudShield.recordRiskAssessment("TX-A", owner.address, addr1.address, 10, "Low", "Allow");
      await fraudShield.recordRiskAssessment("TX-B", owner.address, addr1.address, 50, "Medium", "Warn");
      await fraudShield.recordRiskAssessment("TX-C", owner.address, addr1.address, 90, "High", "Hold");

      expect(await fraudShield.getAssessmentIdAtIndex(0)).to.equal("TX-A");
      expect(await fraudShield.getAssessmentIdAtIndex(1)).to.equal("TX-B");
      expect(await fraudShield.getAssessmentIdAtIndex(2)).to.equal("TX-C");
    });

    it("Should revert for out-of-bounds index", async function () {
      await expect(
        fraudShield.getAssessmentIdAtIndex(0)
      ).to.be.revertedWith("Index out of bounds");
    });
  });
});

// Helper to get block timestamp from a transaction
async function getBlockTimestamp(tx) {
  const receipt = await tx.wait();
  const block = await ethers.provider.getBlock(receipt.blockNumber);
  return block.timestamp;
}
