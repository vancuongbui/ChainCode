const assert = require('assert');
//const ganache = require('ganache-cli');
const Web3 = require('web3');
var provider = new Web3.providers.HttpProvider('http://127.0.0.1:8000');
var provider_2 = new Web3.providers.HttpProvider('http://127.0.0.1:8001');
var provider_3 = new Web3.providers.HttpProvider('http://127.0.0.1:8002');
const web3 = new Web3(provider);
const web3_2 = new Web3(provider_2);
const web3_3 = new Web3(provider_3);
const { interface, bytecode } = require('../compile');

let AGC20Token;
let accounts;
// define const to test static value, such as name of the token and so on
const originTokenName = "ArtChain Global Token 20";
const symbol = "ACG20";
const totalSupply = 350000000000000000;



/**
 * it('passes after 3000ms', function (done) {
  setTimeout(done, 3000)
})
 */
// use beforeEach() if you need to initiate the presetting condition for each test
before(async () => {
    
    accounts = await web3.eth.getAccounts();
    accounts_2 = await web3_2.eth.getAccounts();
    accounts_3 = await web3_3.eth.getAccounts();

    //console.log(accounts.length);
    console.log("Get account 0 of node 0", accounts[0]);
    console.log("Get account 2 of node 0", accounts[2]);
    console.log("Get account 0 of node 1", accounts_2[0]);
    console.log("Get account 0 of node 2", accounts_3[0]);
    //console.log(interface);

    AGC20Token = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
        data: "0x" + bytecode,
    })
    .send({
        from: accounts[0],
        gas: '2000000'
    });
})

/**
 *  Before you test, keep in mind that, everytime you envoke a transaction, you need 
 * to specify which account you use to envoke the transaction
 * */ 
describe('ERC token smart contract', () => {

    it('deplys a ERC Token contract', async () => {
        
        console.log("testing the adress of deployment", AGC20Token.options.address);  
        console.log(AGC20Token.methods);      
        assert.ok(AGC20Token.options.address);
        // this.timeout(15000);
        // setTimeout(done, 10000);
    });
    it('allow to get balanceOf an account', async () => {
        //test balance of founder who we set to acounts[0] of node0
        const node0Account0_balanceOf = await AGC20Token.methods.balanceOf(accounts[0]).call({
            from: accounts[0]
        });
        console.log("acount 0 of node0 balance: ", node0Account0_balanceOf);
        assert.equal(0, node0Account0_balanceOf);
    });

    // Testing the return name of the token
    it('allow getting name of token', async () => {
        const tokenName = await AGC20Token.methods.name().call({
            from: accounts[0]
        });
        console.log("Token name", tokenName);
        assert.equal(originTokenName, tokenName);
    })
    //Testing get owner - predefine = accounts[0]
    it('get the owner: ', async () => {
        const getOwner = await AGC20Token.methods.owner().call();
        console.log("the owner who create the contract is: ", getOwner);
        assert.equal(accounts[0], getOwner);
    })
    it('get total supply: ', async () => {
        const totalSupply = await AGC20Token.methods.totalSupply().call();
        console.log("total supply of the token ACG20: ", totalSupply);
        assert.equal(0, totalSupply);
    })
    it('top up token for user accounts_1[0] by owner only', async () => {
        const topupValue = 1000;
        const topupAddress = accounts_2[0];
        const previousBalance = await AGC20Token.methods.balanceOf(topupAddress).call();
        console.log('previous balance is: ', previousBalance);
        await AGC20Token.methods.mint(topupAddress, topupValue).send({
            from: accounts[0]
        });
        const newAccountBalance = await AGC20Token.methods.balanceOf(topupAddress).call();
        console.log(newAccountBalance);
        assert.equal(Number(topupValue) + Number(previousBalance), Number(newAccountBalance));
        // cannot topup for the account if sender is not the founder/owner
        // this need to recode on solidity and test again since it gave an error not handdled
        // const notAllowedTopupResult = false;
        // try {
        //     await AGC20Token.methods.mint(topupAddress, topupValue).send({
        //         from: accounts_2[0]
        //     });
        //     notAllowedTopupResult = true;
        // } catch(e) {
        //     console.log(e);
        // }
        
        // assert.equl(notAllowedTopupResult, false);
    })
    // test halt() of an account
    // it('is the account haled ', async () => {
    //     assert.ok(await AGC20Token.methods.halt().call());
    // })
    // test changing new founder
    // it('allow change founder', async () => {
    //     const newFounder = accounts_3[0];
    //     const founderChangeResult = await AGC20Token.methods.changeFounder(newFounder).send({
    //         from: accounts[0]
    //     });
    //     console.log("the new founder is: ", await AGC20Token.methods.founder().call());
    // })
    // // Test unlock and locking account
    it('allow to unlock an account', async () => { 
        var result = false;       
        try {
            //web3.personal.unlockAccount("0x..", "<passs>", 1000);
            await web3.eth.personal.unlockAccount(accounts[3], "Test@2018", 1000000);
            await web3.eth.personal.unlockAccount(accounts[2], "Test@2018", 1000000);
            result = true
        } catch (e) {
            console.log(e);
            //return false;
        }
        assert.ok(result);
    })
    // // Test create new account using web3
    it('allow to create new personal account', async () => {
        var newAccount = "DEFAULT_ACCOUT";
        try {
            newAccount = await web3.eth.personal.newAccount("Test@2018");
            console.log(newAccount);
        } catch(e) {
            console.log("Create account error", e);
        }
        if (newAccount != "DEFAULT_ACCOUT") {
            await web3.eth.personal.unlockAccount(newAccount, "Test@2018");
            var newBalance = await web3.eth.getBalance(newAccount)
            console.log("balance of new account: ", newBalance);
        }
    })
    // //test transfer function of the Token 
    it('allows transfer from one to other account', async () => {
        const destAccount = accounts_2[0];
        const fromAccount = accounts_3[0];
        // topup some to sender before transfer
        const topupValue = 1000;
        const topupAddress = accounts_3[0];
        await AGC20Token.methods.mint(topupAddress, topupValue).send({
            from: accounts[0]
        });
        const currentBalance = await AGC20Token.methods.balanceOf(topupAddress).call();     //we pre-set it before
        console.log("current account is: ", currentBalance);
        const transferValue = 100;

        // using try catch
        try {
            await AGC20Token.methods.transferFrom(fromAccount, destAccount, transferValue).send({
                from: accounts[0],
                // suppose the transfer need to send from the owner
            });
        } catch(err) {
            console.log(err);
        };
        
        const newBalanceOfDestination = await AGC20Token.methods.balanceOf(destAccount).call();
        //console.log(AGC20Token.methods); 
        console.log("new balance: ", newBalanceOfDestination);  
        //assert.equal(Number(newBalanceOfDestination), Number(previousBalance) + Number(transferValue));
    });
    // it('allow multiple accounts to enter', async () => {
    //     for (i = 0; i < 3; i++) {
    //         await lottery.methods.enter().send({
    //             from: accounts[i],
    //             value: web3.utils.toWei('0.013', 'ether')
    //         });
    //     }
    //     const players = await lottery.methods.getPlayers().call({
    //         from: accounts[0],
    //     })
    //     console.log(players);
    //     // testing
    //     for (i = 0; i < 3; i++) {
    //         assert.equal(players[i], accounts[i]);
    //     }
    //     assert.equal(3, players.length);
    //     // get balance:
    //     const balance = await lottery.methods.getBalance().call();
    //     console.log('current balance is: ', balance);
    // });
    // // test amount required to enter
    // it('required more than 0.01 ether to enter', async () => {
    //     try {
    //         await lottery.methods.enter().send({
    //             from: accounts[0],
    //             value: web3.utils.toWei('0.001', 'ether')
    //         });
    //     } catch(error) {
    //         console.log('player need to send at least 0.01 ether to enter');
    //         assert(error);   //if an error appeared, then
    //     }
        
    // });
    // //test the winner
    // it('test whether or not the winner will change everytime we pick', async () => {
    //     for (i = 0; i < 3; i++) {
    //         await lottery.methods.enter().send({
    //             from: accounts[i],
    //             value: web3.utils.toWei('0.012', 'ether')
    //         });
    //     }
    //     const players = await lottery.methods.getPlayers().call({
    //         from: accounts[0],
    //     })
    //     try {
    //         const lotteryWinner = await lottery.methods.picwinner().send({
    //             from: accounts[0],
    //         })
    //         if (lotteryWinner) {
    //             console.log(lotteryWinner);
    //         }
    //     } catch(error) {
    //         console.log(error);
    //         assert(error);
    //     }
    // });
    // // test the function getManager
    // it('test to get manager', async () => {        
    //         const manager = await lottery.methods.getManager().call();
    //         console.log('address of manager is: ', manager);
    //         assert.ok(manager);
    // })
})