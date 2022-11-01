let catchRevert = require("../exception").catchRevert;
const FundraiserContract = artifacts.require("Fundraiser");

contract("Fundraiser", (accounts) => {
  let fundraiser;
  const name = "Beli Mobil";
  const url = "belimobil.com";
  const imageURL = "https://placekitten.com/300/300";
  const description =
    "Ini adalah penggalangan dana untuk pembelian mobil pribadi";
  const beneficiary = accounts[1];
  const owner = accounts[0];

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

    it("get the beneficiary name", async () => {
      const actual = await fundraiser.name();
      assert.equal(actual, name, "name should match");
    });

    it("get the beneficiary url", async () => {
      const actual = await fundraiser.url();
      assert.equal(actual, url, "url should match");
    });

    it("get the beneficiary imageURL", async () => {
      const actual = await fundraiser.imageURL();
      assert.equal(actual, imageURL, "imageURL should match");
    });

    it("get the beneficiary description", async () => {
      const actual = await fundraiser.description();
      assert.equal(actual, description, "description should match");
    });

    it("get the beneficiary address", async () => {
      const actual = await fundraiser.beneficiary();
      assert.equal(actual, beneficiary, "beneficiary address should match");
    });

    //change the owner
    // it("get the beneficiary custodian", async () => {
    //   const actual = await fundraiser.custodian();
    //   assert.equal(actual, custodian, "custodian should match");
    // });

    it("get the owner", async () => {
      const actual = await fundraiser.owner();
      assert.equal(actual, owner, "owner should match");
    });
  });

  describe("setBeneficiary", () => {
    const newBeneficiary = accounts[2];

    it("update beneficiary address when called by owner account", async () => {
      await fundraiser.setBeneficiary(newBeneficiary, { from: owner });
      const actualBeneficiary = await fundraiser.beneficiary();
      assert.equal(
        actualBeneficiary,
        newBeneficiary,
        "beneficiaries should match"
      );
    });

    it("throw an error when called from a non-owner account", async () => {
      // try {
      //   await fundraiser.setBeneficiary(newBeneficiary, {
      //     from: accounts[3],
      //   });

      //   assert.fail("witdraw was not restricted to owners");
      // } catch (err) {
      //   const expectError = "Ownable: caller is not the owner";
      //   const actualError = err.reason;
      //   // assert.equal(actualError, expectError, "should not be permitted");
      //   // expect(err).to.be.a(ReferenceError);
      // }

      await catchRevert(
        fundraiser.setBeneficiary(newBeneficiary, { from: accounts[3] })
      );
    });
  });

  describe("making donation", () => {
    const value = web3.utils.toWei("0.1");
    const donor = accounts[2];

    it("increase my donation count", async () => {
      const currentDonationCount = await fundraiser.myDonationCount({
        from: donor,
      });

      await fundraiser.donate({ from: donor, value: value });

      const newDonationCount = await fundraiser.myDonationCount({
        from: donor,
      });

      assert.equal(
        1,
        newDonationCount - currentDonationCount,
        "my donation should increate 1"
      );
    });

    it("include donations my donation count", async () => {
      await fundraiser.donate({ from: donor, value: value });

      const { values, dates } = await fundraiser.myDonations({ from: donor });

      assert.equal(values[0], value, "value should matched");
      assert(dates[0], "date should be present");
    });
  });
});
