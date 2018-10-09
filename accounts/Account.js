const assert = require('assert');
//const ganache = require('ganache-cli');
const Web3 = require('web3');
var provider_0 = new Web3.providers.HttpProvider('http://127.0.0.1:8000');
var provider_1 = new Web3.providers.HttpProvider('http://127.0.0.1:8001');
var provider_2 = new Web3.providers.HttpProvider('http://127.0.0.1:8002');
const web3 = new Web3(provider_0);
const web3_1 = new Web3(provider_1);
const web3_2 = new Web3(provider_2);
const { interface, bytecode } = require('../compile');

let node0_accounts;
let node1_accounts;
let node2_accounts;
// define const to test static value, such as name of the token and so on


/**
 * it('passes after 3000ms', function (done) {
  setTimeout(done, 3000)
})
 */
// use beforeEach() if you need to initiate the presetting condition for each test
before(async () => {
    
    node0_accounts = await web3.eth.getAccounts();
    node1_accounts = await web3_1.eth.getAccounts();
    node2_accounts = await web3_2.eth.getAccounts();

})

/**
 *  Before you test, keep in mind that, everytime you envoke a transaction, you need 
 * to specify which account you use to envoke the transaction
 * */ 
describe('ERC token smart contract', () => {

    // it('allow to get balanceOf an account', async () => {
    //     //test balance of founder who we set to acounts[0] of node0
    //     const node0Account0_balanceOf = await ercToken.methods.balanceOf(accounts[0]).call({
    //         from: accounts[0]
    //     });
    //     console.log("acount 0 of node0 balance: ", node0Account0_balanceOf);
    //     assert.equal(founderBalance, node0Account0_balanceOf);
    //     // test balance of poi
    //     const textBalanceAccount_2 = await ercToken.methods.balanceOf(node1_accounts[0]).call({
    //         from: accounts[0]
    //     });
    //     assert.equal(textBalanceAccount_2, poiBalance);
    // });

    // Test unlock and locking account
    it('allow to unlock an account', async () => { 
        var result = false;       
        for (var i = 4; i < accounts.length; i++) {
            try {
                //web3.personal.unlockAccount("0x..", "<passs>", 1000);
                await web3.eth.personal.unlockAccount(accounts[i], "Test@2018", 1000000000);
                result = true
            } catch (e) {
                console.log(e);
                //return false;
            }
            assert.ok(result);
        }
        
    })
    // // Test create new account using web3
    // it('allow to create new personal account', async () => {
    //     var newAccount = "DEFAULT_ACCOUT";
    //     try {
    //         newAccount = await web3.eth.personal.newAccount("Test@2018");
    //         console.log(newAccount);
    //     } catch(e) {
    //         console.log("Create account error", e);
    //     }
    //     if (newAccount != "DEFAULT_ACCOUT") {
    //         await web3.eth.personal.unlockAccount(newAccount, "Test@2018");
    //         var newBalance = await web3.eth.getBalance(newAccount)
    //         console.log("balance of new account: ", newBalance);
    //     }
    // })
    // //test transfer function of the Token 
    
})