const { assert } = require("chai");

let catchRevert = require("../exception").catchRevert;
const FundraiserContract = artifacts.require("Fundraiser");

contract("Fundraiser", (accounts) => {
  let fundraiser;
  const name = "Beli Mobil";
  const url = "belimobil.com";
  const imageURL = "https://placekitten.com/300/300";
  const description =
    "Ini adalah penggalangan dana untuk pembelian mobil pribadi";
  const owner = accounts[4];
  const beneficiary = accounts[5];

  describe("Initialization", () => {
    beforeEach(async () => {
      fundraiser = await FundraiserContract.new(
        name,
        url,
        imageURL,
        description,
        beneficiary,
        owner
      );
    });

    it("throw when withdraw by non owner", async () => {
      await catchRevert(fundraiser.withdraw({ from: accounts[2] }));
    });

    it("transfer balance to beneficiary", async () => {
      const oldContractBalance = await web3.eth.getBalance(fundraiser.address);
      const oldBeneficiaryBalance = await web3.eth.getBalance(beneficiary);

      //withdraw
      await fundraiser.withdraw({ from: owner });

      const newContractBalance = await web3.eth.getBalance(fundraiser.address);
      const newBeneficiaryBalance = await web3.eth.getBalance(beneficiary);

      const differenceNewAndOld = newBeneficiaryBalance - oldBeneficiaryBalance;

      assert.equal(newContractBalance, 0, "new contract should 0");
      assert.equal(
        differenceNewAndOld,
        oldContractBalance,
        "diff new bene should match with old contract"
      );
    });
  });

  describe("fallback function", () => {
    const value = web3.utils.toWei("1");
    it("increase the total donation amount", async () => {
      const oldTotalDonation = await fundraiser.totalDonations();

      await web3.eth.sendTransaction({
        to: fundraiser.address,
        from: accounts[9],
        value,
      });

      const newTotalDonation = await fundraiser.totalDonations();

      const diffTotalDonation = newTotalDonation - oldTotalDonation;

      assert.equal(
        diffTotalDonation,
        value,
        "diff should match with donation value"
      );
    });

    it("increase donation count", async () => {
      const oldDonationCount = await fundraiser.donationCount();

      await web3.eth.sendTransaction({
        to: fundraiser.address,
        from: accounts[9],
        value,
      });

      const newDonationCount = await fundraiser.donationCount();

      const diffCount = newDonationCount - oldDonationCount;

      assert.equal(diffCount, 1, "diff should 1");
    });
  });
});
