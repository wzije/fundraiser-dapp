const fundraiserFactoryContract = artifacts.require("FundraiserFactory");

module.exports = function (deployer) {
  deployer.deploy(fundraiserFactoryContract);
};
