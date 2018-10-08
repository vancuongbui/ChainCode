var ACG20COIN = artifacts.require("ACG20");

contract('Support of API add_new_user()', function(accounts) {
  
  it("Add two new user with different initial balance", async function() {
    let acg20Inst = await ACG20COIN.deployed();
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
})

contract('Support of API buy_token()', function(accounts) {
  let acg20Inst;
  let contractOwner = accounts[0];

  it("Initial total supply should be zero", async () => {
    acg20Inst = await ACG20COIN.deployed();

    let totalSupply = await acg20Inst.totalSupply.call();
    assert.equal(totalSupply.toNumber(), 0, "Initial otal supply should be 0")
  });
  it("Buy token should increase total supply", async () => {
    await acg20Inst.mint(accounts[1], 100, {from: contractOwner});
    let totalSupply = await acg20Inst.totalSupply.call();
    assert.equal(totalSupply.toNumber(), 100, "Total supply increased to 100")
  });
})

contract('Support of API buy_artwork()', function(accounts) {
  let acg20Inst;
  let user0 = accounts[0];
  let user1 = accounts[1];

  it("test setup: add two users with initial balances", async () => {
    acg20Inst = await ACG20COIN.deployed();

    user0_mint = acg20Inst.mint(user0, 100);
    user1_mint = acg20Inst.mint(user1, 200);
    await user0_mint;
    await user1_mint;

    let totalSupply = await acg20Inst.totalSupply.call();
    assert.equal(totalSupply.toNumber(), 300, "Total supply should be 300");
  });
  it("transfer money from user 0 to user 1.", async () => {
    await acg20Inst.transfer(user1, 100, {from: user0});
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
})

contract('Support of API freeze_token()', function(accounts) {
  // 
})

contract('Support of API check_artwork()', function(accounts) {
  // need to nothing
})

contract('Support of API check_user()', function(accounts) {
  // need to nothing
})

contract('Support of API check_transaction()', function(accounts) {
  // need to nothing
})
