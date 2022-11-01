const { assert } = require("chai");

const fundraiserFactoryContract = artifacts.require("FundraiserFactory");
const fundraiserContract = artifacts.require("Fundraiser");

contract("FundraiserFactory", (accounts) => {
  let factory;
  const name = "Patungan Beli Kecap";
  const url = "belikecap.com";
  const imageURL = "https://placekitten.com/300/300";
  const description =
    "patungan duit buat beli kecap untuk warung sate bu harti";
  const beneficiary = accounts[1];

  it("increment the fundraiserCount", async () => {
    factory = await fundraiserFactoryContract.deployed();
    const oldFundraiserCount = await factory.fundraiserCount();

    await factory.createFundraiser(
      name,
      url,
      imageURL,
      description,
      beneficiary
    );

    const newFundraiserCount = await factory.fundraiserCount();

    assert.equal(
      newFundraiserCount - oldFundraiserCount,
      1,
      "new fundraser should increment 1"
    );
  });

  describe("Emit fundraiser create event", async () => {
    factory = await fundraiserFactoryContract.deployed();
    const tx = await factory.createFundraiser(
      name,
      url,
      imageURL,
      description,
      beneficiary
    );

    const expectedEvent = "FundraiserCreated";
    const actualEvent = tx.logs[0].event;

    assert.equal(actualEvent, expectedEvent, "event should match");
  });
});

contract("FundraiserFactory: fundraisers", (accounts) => {
  async function createFundraiserFactory(fundraiserCount, accounts) {
    const factory = await fundraiserFactoryContract.new();
    await addFundraisers(factory, fundraiserCount, accounts);
    return factory;
  }

  async function addFundraisers(factory, count, accounst) {
    const name = "Beneficiary";
    const lowerCaseName = name.toLowerCase();
    const beneficiary = accounst[1];

    for (let i = 0; i < count; i++) {
      console.info(i, "index loop");
      await factory.createFundraiser(
        `${name} ${i}`,
        `${lowerCaseName}${i}.com`,
        `${lowerCaseName}${i}.png`,
        `Description for ${name} ${i}`,
        beneficiary
      );
    }
  }

  describe("when fundraiser collection is empty", () => {
    it("return an empty collection", async () => {
      const factory = await createFundraiserFactory(0, accounts);
      const fundraisers = await factory.fundraisers(10, 0);
      assert.equal(fundraisers.length, 0, "collection should be empty");
    });
  });

  describe("varying limits", () => {
    let factory;
    beforeEach(async () => {
      factory = await createFundraiserFactory(30, accounts);
    });

    it("return 10 when limit is 10", async () => {
      const fundraisers = await factory.fundraisers(10, 0);
      assert.equal(fundraisers.length, 10, "result size should 10");
    });

    xit("return 20 when limit is 20", async () => {
      const fundraisers = await factory.fundraisers(20, 0);
      assert.equal(fundraisers.length, 20, "result size should 20");
    });

    xit("return 30 when limit is 30", async () => {
      const fundraisers = await factory.fundraisers(30, 0);
      assert.equal(fundraisers.length, 30, "result size should 30");
    });
  });

  describe("varying offset", () => {
    let factory;
    beforeEach(async () => {
      factory = await createFundraiserFactory(10, accounts);
    });

    it("contains the fundraiser with appropriate offset", async () => {
      const fundraisers = await factory.fundraisers(1, 0);
      const fundraiser = await fundraiserContract.at(fundraisers[0]);
      const name = await fundraiser.name();
      assert.ok(await name.includes(0), `${name} did not include the offset`);
    });

    it("contains the fundraiser with the appropriate offset", async () => {
      const fundraisers = await factory.fundraisers(1, 7);
      const fundraiser = await fundraiserContract.at(fundraisers[0]);
      const name = await fundraiser.name();
      const nameIncluded = await name.includes(7);
      console.info(name, "name ", nameIncluded, "include");
      assert.ok(await name.includes(7), `${name} did not include the offset`);
    });
  });

  describe("boundary conditions", () => {
    let factory;
    beforeEach(async () => {
      factory = await createFundraiserFactory(10, accounts);
    });

    it("raises out of bounds error", async () => {
      try {
        await factory.fundraisers(1, 11);
        assert.fail("error was not raised");
      } catch (err) {
        const expected = "offset out of bounds";
        assert.ok(err.message.includes(expected), `${err.message}`);
      }
    });

    xit("adjusts return size to prevent out of bounds error", async () => {
      try {
        const fundraisers = await factory.fundraisers(10, 5);
        assert.equal(fundraisers.length, 5, "collection adjusted");
      } catch (err) {
        assert.fail("limit and offset exceeded bounds");
      }
    });
  });
});
