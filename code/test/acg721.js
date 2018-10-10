const expectThrow = require("../helpers/expectThrow.js")

var ACG721TOKEN = artifacts.require("ACG721");

contract('Support of API add_new_user()', function(accounts) {

  let acg721Inst;

  before ( async () => {
    acg721Inst = await ACG721TOKEN.deployed();
  });
  it("At the beginning, no extant artworks", async function() {
    let totalBalance = await acg721Inst.totalSupply.call();
    assert.equal(totalBalance.toNumber(), 0, "Total supply should be zero at beginning");
  });
  it("At the beginning, user's balance is zero", async function() {
    let userBalance = await acg721Inst.balanceOf.call(accounts[0]);
    assert.equal(userBalance.toNumber(), 0, "User's balance should be zero at beginning");
  });
});

contract('Support of API post_new_artwork()', function(accounts) {
    
  let acg721Inst;
  let artwork1, artwork2;

  before(async() => {
    acg721Inst = await ACG721TOKEN.deployed();
    artwork1 = {
      "type":"paint",
      "artist":"Qin Wang",
      "loyalty":"0.1",
      "status":"normal",
      "prize":"10000"
    };
    artwork2 = {
      "type":"sculpture",
      "artist":"Quong Bui Van",
      "loyalty":"0.3",
      "status":"normal",
      "prize":"50000"
    };
  });
  it("User add artwork", async function() {
    await acg721Inst.mintWithMetadata(accounts[1], 1, JSON.stringify(artwork1));
    let userBalance = await acg721Inst.balanceOf.call(accounts[1]);
    assert.equal(userBalance.toNumber(), 1, "User should have 1 artwork token");

    await acg721Inst.mintWithMetadata(accounts[2], 2, JSON.stringify(artwork2));
    userBalance = await acg721Inst.balanceOf.call(accounts[2]);
    assert.equal(userBalance.toNumber(), 1, "User should have 1 artwork token");
  });
  it("User is not permitted to add artwork with existent token ID", async function() {
    await expectThrow(acg721Inst.mintWithMetadata(accounts[3], 1, JSON.stringify(artwork1), "Exception: artwork with existent ID is added"));
    let userBalance = await acg721Inst.balanceOf.call(accounts[3]);
    assert.equal(userBalance.toNumber(), 0, "User should fail to add artwork with existent ID");
  });
  it("User is permitted to add artwork without any information", async function() {
    await acg721Inst.mint(accounts[3], 3);
    let userBalance = await acg721Inst.balanceOf.call(accounts[3]);
    assert.equal(userBalance.toNumber(), 1, "User should have 1 artwork token");
  });
});
contract('Support of API buy_artwork()', function(accounts) {
  let acg721Inst;
  let artwork1, artwork2;

  before(async() => {
    acg721Inst = await ACG721TOKEN.deployed();
    artwork1 = {
      "type":"paint",
      "artist":"Qin Wang",
      "loyalty":"0.1",
      "status":"normal",
      "prize":"10000"
    };
    artwork2 = {
      "type":"sculpture",
      "artist":"Quong Bui Van",
      "loyalty":"0.3",
      "status":"normal",
      "prize":"50000"
    };
    await acg721Inst.mintWithMetadata(accounts[1], 1, JSON.stringify(artwork1));
    await acg721Inst.mintWithMetadata(accounts[2], 2, JSON.stringify(artwork2));
    await acg721Inst.mint(accounts[3], 3);
  });
  it("user buy an artwork from another user", async () => {
    await acg721Inst.transfer(accounts[4], 1, {from:accounts[1]});
    let sellerBalance = await acg721Inst.balanceOf.call(accounts[1]);
    let buyerBalance = await acg721Inst.balanceOf.call(accounts[4]);
    assert.equal(sellerBalance.toNumber(), 0, "seller's balance decreased");
    assert.equal(buyerBalance.toNumber(), 1, "buyer's balance increased");
  });
  it("Selling artwork to an invalid address is not permitted", async () => {
    await expectThrow(acg721Inst.transfer(0, 3, {from:accounts[3]}), "Selling to empty address should fail");
  });
  it("User should not sell artwork not belonging him", async () => {
    await expectThrow(acg721Inst.transfer(accounts[0], 3, {from:accounts[1]}), "Selling an artworing belonging others should fail");
  });
  it("User should not sell an non-existent artwork", async () => {
    await expectThrow(acg721Inst.transfer(accounts[0], 0, {from:accounts[1]}), "Selling an non-existent artworing should fail");
  });
});
contract('Support of API buy_token()', function(accounts) {
  // do nothing
});

contract('Support of API freeze_token()', function(accounts) {
  // need to nothing
});

contract('Support of API check_artwork()', function(accounts) {
  let acg721Inst;
  let artwork1;

  before(async() => {
    acg721Inst = await ACG721TOKEN.deployed();
    artwork1 = {
      "type":"paint",
      "artist":"Qin Wang",
      "loyalty":"0.1",
      "status":"In auction",
      "prize":"10000"
    };
    await acg721Inst.mintWithMetadata(accounts[1], 1, JSON.stringify(artwork1));
  });
  it("Check artwork's owner]", async () => {
    let owner = await acg721Inst.ownerOf(1);
    assert.equal(owner, accounts[1], "Artwork's owner is expected account");
  });
  it("Usser address should be empty for an non-existent artwork]", async () => {
    let owner = await acg721Inst.ownerOf(2);
    assert.equal(owner, 0, "Artwork's owner is expected to be empty");
  });
  it("Check artwork status", async () => {
    let artworkMeta = await acg721Inst.referencedMetadata(1);
    let artworkInfo = JSON.parse(artworkMeta);
    assert.equal(artworkInfo.type, "paint", "Artwork's status is expected to be 'In auction'");
    assert.equal(artworkInfo.artist, "Qin Wang", "Artwork's status is expected to be 'In auction'");    
    assert.equal(artworkInfo.loyalty, "0.1", "Artwork's status is expected to be 'In auction'");
    assert.equal(artworkInfo.status, "In auction", "Artwork's status is expected to be 'In auction'");
    assert.equal(artworkInfo.prize, "10000", "Artwork's status is expected to be 'In auction'");
  });
});

contract('Support of API check_user()', function(accounts) {
  // need to nothing
});

contract('Support of API check_transaction()', function(accounts) {
  // need to nothing
});