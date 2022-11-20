import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TipJar", function () {
  async function deployTipJar() {
    const [owner, otherAccount] = await ethers.getSigners();

    const TipJar = await ethers.getContractFactory("TipJar");
    const tips = await TipJar.deploy();
    const balance = await ethers.provider.getBalance(tips.address);

    return { tips, owner, otherAccount, balance };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { tips, owner } = await loadFixture(deployTipJar);

      expect(await tips.owner()).to.equal(owner.address);
    });

    it("Balance should be empty", async function () {
      const { balance } = await loadFixture(deployTipJar);
      expect(balance).to.equal(ethers.utils.parseEther("0"));
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from not the owner", async function () {
        const { tips, otherAccount } = await loadFixture(deployTipJar);

        await expect(
          tips.connect(otherAccount).withdrawTips()
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert with the right error if the balance is empty", async function () {
        const { tips, owner } = await loadFixture(deployTipJar);

        await expect(tips.connect(owner).withdrawTips()).to.be.revertedWith(
          "TipJar: Insufficient Balance"
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { tips, owner, balance, otherAccount } = await loadFixture(
          deployTipJar
        );
        await tips.connect(otherAccount).signer.sendTransaction({
          to: tips.address,
          value: 100,
        });
        await expect(tips.connect(owner).withdrawTips())
          .to.emit(tips, "TipsWithdrawn")
          .withArgs(owner.address, 100);
      });
    });
  });

  describe("Transfers", function () {
    describe("Validations", function () {
      it("Fallback: Should revert with the right error if the amount is 0", async function () {
        const { tips, otherAccount } = await loadFixture(deployTipJar);

        await expect(
          tips.connect(otherAccount).signer.sendTransaction({
            to: tips.address,
            value: 0,
          })
        ).to.be.revertedWith("TipJar: Tip amount must be greater than 0");
      });

      it("Fallback: Balance should update on successful transfers", async function () {
        const { tips, otherAccount, balance } = await loadFixture(
          deployTipJar
        );
        await tips.connect(otherAccount).signer.sendTransaction({
          to: tips.address,
          value: 100,
        });
        expect(await ethers.provider.getBalance(tips.address)).to.equal(
          balance.add(100)
        );
      });

      it("Function: Should revert with the right error if the amount is 0", async function () {
        const { tips, otherAccount } = await loadFixture(deployTipJar);

        await expect(tips.connect(otherAccount).sendTip(0)).to.be.revertedWith(
          "TipJar: Tip amount must be greater than 0"
        );
      });

      it("Function: Balance should update on successful transfers", async function () {
        const { tips, otherAccount, balance } = await loadFixture(
          deployTipJar
        );
        await tips.connect(otherAccount).sendTip(100);
        expect(await ethers.provider.getBalance(tips.address)).to.equal(
          balance.add(100)
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on transfers", async function () {
        const { tips, otherAccount } = await loadFixture(deployTipJar);

        await expect(
          tips.connect(otherAccount).signer.sendTransaction({
            to: tips.address,
            value: 10,
          })
        )
          .to.emit(tips, "TipReceived")
          .withArgs(otherAccount.address, anyValue);
      });
    });
  });
});
