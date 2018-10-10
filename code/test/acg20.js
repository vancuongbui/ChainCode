const expectThrow = require("../helpers/expectThrow.js")

var ACG20TOKEN = artifacts.require("ACG20");

contract('Support of API add_new_user()', function(accounts) {
  
  it("Add two new user with different initial balance", async function() {
    let acg20Inst = await ACG20TOKEN.deployed();
    let user0 = accounts[0];
    let user1 = accounts[1];

    user0_mint = acg20Inst.mint(user0, 100);
    user1_mint = acg20Inst.mint(user1, 200);

    await user0_mint;
    await user1_mint;

    let totalSupply = await acg20Inst.totalSupply.call();
    assert.equal(totalSupply.toNumber(), 300, "Total supply should be 300")
  })
});

contract('Support of API post_new_artwork()', function(accounts) {
  // need to nothing
});

contract('Support of API buy_token()', function(accounts) {
  let acg20Inst;
  let contractOwner = accounts[0];

  it("Initial total supply should be zero", async () => {
    acg20Inst = await ACG20TOKEN.deployed();

    let totalSupply = await acg20Inst.totalSupply.call();
    assert.equal(totalSupply.toNumber(), 0, "Initial otal supply should be 0")
  });
  it("Buy token should increase total supply", async () => {
    await acg20Inst.mint(accounts[1], 100, {from: contractOwner});
    let totalSupply = await acg20Inst.totalSupply.call();
    assert.equal(totalSupply.toNumber(), 100, "Total supply increased to 100")
  });
});

contract('Support of API buy_artwork()', function(accounts) {
  let acg20Inst;
  let user0 = accounts[0];
  let user1 = accounts[1];

  it("test setup: add two users with initial balances", async () => {
    acg20Inst = await ACG20TOKEN.deployed();

    user0_mint = acg20Inst.mint(user0, 100);
    user1_mint = acg20Inst.mint(user1, 200);
    await user0_mint;
    await user1_mint;

    let totalSupply = await acg20Inst.totalSupply.call();
    assert.equal(totalSupply.toNumber(), 300, "Total supply should be 300");
  });
  it("transfer money from user 0 to user 1.", async () => {
    await acg20Inst.transfer(user1, 100, 0, {from: user0});
    let getUser0Balance = acg20Inst.balanceOf.call(user0);
    let getUser1Balance = acg20Inst.balanceOf.call(user1);
    let getTotalBalance = acg20Inst.totalSupply.call();
    let user0Balance = await getUser0Balance;
    let user1Balance = await getUser1Balance;
    let totalSupply = await getTotalBalance;

    assert.equal(totalSupply.toNumber(), 300, "Total supply should not change");
    assert.equal(user0Balance.toNumber(), 0, "Balance of user 0 is 0");
    assert.equal(user1Balance.toNumber(), 300, "Balance of user 1 is 300");
  });
});

contract('Support of API freeze_token()', function(accounts) {

  let acg20Inst;
  let admin;
  let userInitBalance = 1e4;
  let artwork1 = 0;
  let artwork2 = 1;

  before ( async () => {
    acg20Inst = await ACG20TOKEN.deployed();

    admin = accounts[0];
    await acg20Inst.mint(admin, userInitBalance);
    await acg20Inst.mint(accounts[1], userInitBalance);
    await acg20Inst.mint(accounts[2], userInitBalance);
    await acg20Inst.mint(accounts[3], userInitBalance);
    await acg20Inst.mint(accounts[4], userInitBalance);
  });
  it("freeze() will reduce user balance but won't change total supply", async () => {
    let frozen_amount = 1e3;
    await acg20Inst.freeze(accounts[1], 1e3, artwork1, {from: admin});

    let userBalance = await acg20Inst.balanceOf.call(accounts[1]);
    assert.equal(userBalance.toNumber(), userInitBalance-frozen_amount, "User's balance should be reduced by frozen amount");

    let totalSupply = await acg20Inst.totalSupply.call();
    assert.equal(totalSupply.toNumber(), userInitBalance*5, "Total supply should not affected by freeze() operation");
  });
  it("If other user provides a higher bid, then token is unfrozen for previous bidder", async () => {
    let higher_frozen_amount = 2e3;
    await acg20Inst.freeze(accounts[2], higher_frozen_amount, artwork1, {from: admin});

    let user1Balance = await acg20Inst.balanceOf.call(accounts[1]);
    assert.equal(user1Balance.toNumber(), userInitBalance, "Frozen tokens should be withdrawn");
  });
  it("User can even provides higher bid than his own", async () => {
    let even_higher_frozen_amount = 5e3;
    await acg20Inst.freeze(accounts[2], even_higher_frozen_amount, artwork1, {from: admin});

    let user2Balance = await acg20Inst.balanceOf.call(accounts[2]);
    assert.equal(user2Balance.toNumber(), userInitBalance-even_higher_frozen_amount, "User's balance should be decreased by his highest bid");
  });
  it("User can bid for more than one artwork at the same time", async () => {
    let frozen_amount_for_artwork2 = 2e3;
    let even_higher_frozen_amount = 5e3;
    await acg20Inst.freeze(accounts[2], frozen_amount_for_artwork2, artwork2, {from: admin});

    let user2Balance = await acg20Inst.balanceOf.call(accounts[2]);
    assert.equal(user2Balance.toNumber(), userInitBalance-even_higher_frozen_amount-frozen_amount_for_artwork2, "User's balance should be further decreased by his bid for another artwork");
  });
  it("During auction, check recorded bid price and bidder", async () => {
    let bid_artwork1 = 5e3
    let bid_artwork2 = 2e3;

    let bidder = await acg20Inst.highestBidder.call(artwork1);
    let bid = await acg20Inst.highestBid.call(artwork1);
  
    assert.equal(bidder, accounts[2], "bidder should be user 2");
    assert.equal(bid.toNumber(), bid_artwork1, "bid should be 5000")

    bidder = await acg20Inst.highestBidder.call(artwork2);
    bid = await acg20Inst.highestBid.call(artwork2);
    assert.equal(bidder, accounts[2], "bidder should be user 2");
    assert.equal(bid.toNumber(), bid_artwork2, "bid should be 2000")
  });
  it("At the end of auction, buyer's price should match highest bid", async () => {
    let frozen_amount_for_artwork2 = 2e3;
    let wrong_price = frozen_amount_for_artwork2+1;
    await expectThrow(acg20Inst.transfer(accounts[4], wrong_price, artwork2, {from:accounts[2]}), "Exception: transfer value is mismatching with auction price");
  });
  it("If contract operation throws exception, all change should be rewinded", async () => {
    let expectedBalance = 3e3;
    let user2Balance = await acg20Inst.balanceOf.call(accounts[2]);
    assert.equal(user2Balance.toNumber(), expectedBalance, "User's balance shall not change if an expection is throw from contract");
  });
  it("At the end of auction, user's balance will be reduced by the final price", async () => {
    let frozen_amount_for_artwork1 = 5e3;
    let frozen_amount_for_artwork2 = 2e3;
    let new_frozen_for_artwork2 = 3e3;

    // end of the auction
    //await acg20Inst.transfer(accounts[4], frozen_amount_for_artwork2, artwork2, {from:accounts[2]});
    await acg20Inst.transfer(accounts[4], frozen_amount_for_artwork2, artwork2, {from:accounts[2]}), "Exception: transfer value is mismatching with auction price";

    // a new auction starts on the same artwork (should not appear), it won't affect previous bidder's balance
    await acg20Inst.freeze(accounts[3], new_frozen_for_artwork2, artwork2, {from: admin});

    let user2Balance = await acg20Inst.balanceOf.call(accounts[2]);
    assert.equal(user2Balance.toNumber(), userInitBalance-frozen_amount_for_artwork1-frozen_amount_for_artwork2, "User's balance should be decreased by final auction payment");
  });
});

contract('Support of API check_artwork()', function(accounts) {
  // need to nothing
});

contract('Support of API check_user()', function(accounts) {
  // need to nothing
});

contract('Support of API check_transaction()', function(accounts) {
  // need to nothing
});
