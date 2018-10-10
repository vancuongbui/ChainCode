var Migrations = artifacts.require("./Migrations.sol");
//var ArtChainToken = artifacts.require("ArtChainToken");
var ACG20TOKEN = artifacts.require("ACG20");
var ACG721TOKEN = artifacts.require("ACG721");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
//  deployer.deploy(ArtChainToken);
  deployer.deploy(ACG20TOKEN);
  deployer.deploy(ACG721TOKEN);
};
