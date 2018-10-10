const expectThrow = require("../helpers/expectThrow.js")

var ACG20TOKEN = artifacts.require("ACG20");

contract('API Support: add_new_user()', function(accounts) {
  
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

contract('API Support: post_new_artwork()', function(accounts) {
  // need to nothing
});

contract('API Support: buy_token()', function(accounts) {
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

contract('API Support: buy_artwork()', function(accounts) {
  let acg20Inst;
  let userInitBalance = 1e4;
  let totalSupply = userInitBalance * accounts.length;
  let userBalance = [];

  before("Add two users with initial balances", async () => {
    acg20Inst = await ACG20TOKEN.deployed();

    accounts.forEach(async (user) => {
      await acg20Inst.mint(user, userInitBalance);
    });
    accounts.forEach( (user) => {
      userBalance[user] = userInitBalance;
    });
  });
  it("transfer money from one user to another", async () => {
    let sender = accounts[0];
    let receiver = accounts[1];
    let transferAmout = 1e3;
    let artworkId = 0;

    await acg20Inst.transfer(receiver, transferAmout, artworkId, {from: sender});
    userBalance[sender] -= transferAmout;
    userBalance[receiver] += transferAmout;

    let senderBalanceValue = await acg20Inst.balanceOf.call(sender);
    let recverBalanceValue = await acg20Inst.balanceOf.call(receiver);
    let totalSupplyValue = await acg20Inst.totalSupply.call();

    assert.equal(totalSupplyValue.toNumber(), totalSupply, "Total supply should not change");
    assert.equal(senderBalanceValue.toNumber(), userBalance[sender], "Balance of sender is decreased");
    assert.equal(recverBalanceValue.toNumber(), userBalance[receiver], "Balance of receiver is increased");
  });
  it("User can grant amount of tokens to another user", async () => {
    let owner = accounts[3];
    let spender = accounts[4];
    let approvedAmount = 5e3;

    await acg20Inst.approve(spender, approvedAmount, {from:owner});

    let approvedValue = await acg20Inst.allowance.call(owner, spender);
    assert.equal(approvedValue.toNumber(), approvedAmount, "Spender received expected amount");

    let ownerBalance = await acg20Inst.balanceOf.call(owner);
    assert(ownerBalance.toNumber(), userBalance[owner], "Owner's balance should not be affected by approval operation");
  });
  it("Owner could ask a delegator to transfer his tokens", async () => {
    let owner = accounts[3];
    let spender = accounts[4];
    let receiver = accounts[5];
    let artworkId = 0;
    
    // Record status before transfer operation
    let approvedAmount = await acg20Inst.allowance.call(owner, spender).then((value) => {
      return value.toNumber();
    });
    let transferAmount = approvedAmount/2;

    // Submit transfer operation
    await acg20Inst.transferFrom(owner, receiver, transferAmount, artworkId, {from:spender});
    //(owner, receiver, transferAmount, artworkId);
    approvedAmount -= transferAmount;
    userBalance[owner] -= transferAmount;
    userBalance[receiver] += transferAmount;

    // Record status after transfer operation
    let approvedAfter = await acg20Inst.allowance.call(owner, spender);
    let ownerBalanceAfter = await acg20Inst.balanceOf.call(owner);
    let receiverBalanceAfter = await acg20Inst.balanceOf.call(receiver);

    assert.equal(approvedAfter.toNumber(), approvedAmount, "Approved amount reduced by transfer operation");
    assert.equal(ownerBalanceAfter.toNumber(), userBalance[owner], "Owner's balanced is reduced by transfer operation");
    assert.equal(receiverBalanceAfter.toNumber(), userBalance[receiver], "Receiver's balance is increased by transfer operation");
  });
});

contract('API Support: freeze_token()', function(accounts) {

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

contract('API Support: check_artwork()', function(accounts) {
  // need to nothing
});

contract('API Support: check_user()', function(accounts) {
  // need to nothing
});

contract('API Support: check_transaction()', function(accounts) {
  // need to nothing
});

contract('Code dev: burn() and burnFrom()', function(accounts) {
  let acg20Inst;
  let userInitBalance = 1e4;
  let userBalance = new Array;

  before ( async () => {
    acg20Inst = await ACG20TOKEN.deployed();
    accounts.forEach(async (user, index) => {
      await acg20Inst.mint(user, userInitBalance);
    });
    for (let index=0; index<accounts.length; index++) {
      userBalance[index] = userInitBalance;
    }
  });
  it("User should destroy any amount of tokens under his balance", async () => {
    let burnedAmount = 100;
    userBalance[0] = userBalance[0] - burnedAmount;
    await acg20Inst.burn(burnedAmount, {from:accounts[0]});
    let balance = await acg20Inst.balanceOf(accounts[0]);
    assert.equal(balance.toNumber(), userBalance[0], "Some tokesn are burned");
  });
  it("User should not destroy tokesn amount more than this balance", async () => {
    await expectThrow(acg20Inst.burn(userBalance[0]+1, {from: userBalance[0]}), "Burned amount exceeds account balance");
  });
  it("User can grants amout of tokens to a delegator", async () => {
    let owner = accounts[1];
    let expectedBalance = userBalance[1];
    let spender = accounts[2];
    let grantedToken = 2e3;
    
    await acg20Inst.approve(spender, grantedToken, {from:owner});
    let balance = await acg20Inst.balanceOf(owner);
    let allowToken = await acg20Inst.allowance(owner, spender);

    assert.equal(allowToken, grantedToken, "Allowed amount of token should be equal to the granted amount");
    assert.equal(balance, expectedBalance, "Approval action should have no effect to user's balance");
  });
  it("After user grants amount of tokens to a delegator, delegator could destroy the granted part", async () => {
    let grantedToken = 2e3;
    let owner = accounts[1];
    let ownerBalance = userBalance[1];

    let spender = accounts[2];
    await acg20Inst.burnFrom(owner, grantedToken, {from:spender});
    ownerBalance = ownerBalance - grantedToken;

    let balance = await acg20Inst.balanceOf.call(owner);
    assert.equal(balance, ownerBalance, "Owner's token shoud be burned by approver")
  });
});

contract('Code dev: transferOwnerShip', function(accounts) {
  let acg20Inst;
  let owner, newOwner;

  before ( async () => {
    acg20Inst = await ACG20TOKEN.deployed();
    owner = accounts[0];
    newOwner = accounts[1];
  });
  it("After contract deployement, the owner should be who created the contract", async () => {
    let ownerValue = await acg20Inst.owner.call();
    assert.equal(ownerValue, owner, "Expected owner address");
  });
  it("Ownership could not be transferred to an zero address", async () => {
    await expectThrow(acg20Inst.transferOwnership(0), "Transferring ownership to zero address will throw an exception");
  });
  it("Ownership could be transferred to a valid user", async () => {
    await acg20Inst.transferOwnership(newOwner, {from:owner});
    let ownerValue = await acg20Inst.owner.call();
    assert.equal(ownerValue, newOwner, "Expected new owner address");
  });
});