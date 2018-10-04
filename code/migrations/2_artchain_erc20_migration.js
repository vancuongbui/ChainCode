var ArtChainToken = artifacts.require("ArtChainToken");

module.exports = function(deployer) {
  deployer.deploy(ArtChainToken);
};
