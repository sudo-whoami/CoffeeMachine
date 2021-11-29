// eslint-disable-next-line no-undef
const BillingSystem = artifacts.require("BillingSystem");

module.exports = async function(deployer) {
  await deployer.deploy(BillingSystem);
};