const assert = require('assert');
const Prom = require('bluebird');
const path = require('path');
const fs = require('fs');

//const contract_compile_deploy = require('../scripts/contract_to_chain_web3_1.0.js');
const AcgApi = require('../api/artChainGlobalAPI.js');

const RPC_SERVER = "http://127.0.0.1:31000"

let users = [];
let web3;
const acgApi = AcgApi();
let acg20Inst;
let acg721Inst;

const COMPILE_CONTRACTS_FROM_SOURCE_FILE = false;
const RETRIEVE_DEPLOYED_CONTRACTS_FROM_CHAIN = true;
const SIMPLE_TEST_ON_ENVIRONMENT = false;
const CREATE_NEW_ACCOUNTS_FOR_TEST = false;
const contract_address = [
    '0x81046AF5312eE8D8f7AbBe2528e0419E0E2554E6',
    '0x9924B156F473e0ed26C5ebd819Ba28A9Bb84E63B'
]
const post_artwork_prize = 1e3;

describe('A simple test suite', async function () {
    before (async function () {
        //this.timeout(30000);
        console.log("Setup environment start ...");
        //contracts = await contract_compile_deploy(RPC_SERVER);

        // Connect to RPC server
       web3 = await acgApi.connect_to_chain(RPC_SERVER);

        // Get contract interface by:
        // 1. compiling from source files, or
        // 2. read in the compiled JSON files
        if (COMPILE_CONTRACTS_FROM_SOURCE_FILE) {
            const contract_folder = path.resolve(__dirname, '..', 'contracts');
            acgApi.compile_contract_from_source(contract_folder);   
        } else {
            const contract_folder = path.resolve(__dirname, '..', 'build', 'contracts');
            acgApi.read_in_compiled_contract_JSON(contract_folder);    
        }

        if (RETRIEVE_DEPLOYED_CONTRACTS_FROM_CHAIN) {
            // Fetch the deployed contracts
            acgApi.retrieve_deployed_contracts(contract_address);
        } else {
            // Deploy new contracts for test
            await acgApi.deploy_new_contracts();
        }

        if (SIMPLE_TEST_ON_ENVIRONMENT) {
            acgApi.simple_test_on_environment();
        }

        // Create test accounts with prefunded eth
        const user_number = 4;
        const prefund_eth = 100;
        if (CREATE_NEW_ACCOUNTS_FOR_TEST) {
            for (let i=0; i<user_number; i++) {
                users[i] = await acgApi.create_new_account_and_top_up('password', prefund_eth);
            }    
        } else {
            users = await acgApi.retrieve_batch_accounts_from_node(user_number);
        }
        // Print out initial balance of users
        for (let i=0; i<user_number; i++) {
            const userBalance = await web3.eth.getBalance(users[i]);
            console.log("User ", users[i], "is added, initial balance is ", web3.utils.fromWei(userBalance, "ether"), "ether");
        }

        console.log("Setup environment finish ...");
        
        [acg20Inst, acg721Inst] = acgApi.get_contracts_instrance();
    });

    it('Test API: add_new_user', async () => {
        const new_user_added = await acgApi.add_new_user(users[0]);
        assert.ok(new_user_added, "Adding new user succeeded");

        // New user's balance is expected to be zero
        const expected_acg20_balance = 0;
        const expected_acg721_balance = 0;

        const trans_acg20_balance = acg20Inst.methods.balanceOf(users[0]).call();
        const trans_acg721_balance = acg721Inst.methods.balanceOf(users[0]).call();
        const acg20_balance = await trans_acg20_balance;
        const acg721_balance = await trans_acg721_balance;

        assert.equal(expected_acg20_balance, Number(acg20_balance),
        "New user's balance of ACG20 token should be zero");
        assert.equal(expected_acg721_balance, Number(acg721_balance),
        "New user's balance of ACG721 token should be zero");
    });

    it('Test API: post_new_artwork', async () => {
        const artist = users[1];
        const artwork = {
            "type":"paint",
            "artist":"Qin Wang",
            "loyalty":"0.1",
            "status":"normal",
            "prize":"10000"
        };

        // Obtain chain status
        const trans_acg20_balance_before = acg20Inst.methods.balanceOf(artist).call();
        const trans_acg721_balance_before = acg721Inst.methods.balanceOf(artist).call();
        const acg20_balance_before = await trans_acg20_balance_before;
        const acg721_balance_before = await trans_acg721_balance_before;

        // Post a new artwork, it will:
        // - Add a new 721 token for user
        // - Add amount of 20 token as prize
        const artwork_id = await acgApi.post_new_artwork(artist, artwork);
        
        // Obtain chain status after posting the new artwork
        const trans_acg20_balance_after = acg20Inst.methods.balanceOf(artist).call();
        const trans_acg721_balance_after = acg721Inst.methods.balanceOf(artist).call();
        const acg20_balance_after = await trans_acg20_balance_after;
        const acg721_balance_after = await trans_acg721_balance_after;

        // Check the change of user's balance
        assert.equal(
            Number(acg20_balance_before) + Number(post_artwork_prize),
            Number(acg20_balance_after),
            "ACG20 balance should increase by prize");
        assert.equal(
            Number(acg721_balance_before) + 1,
            Number(acg721_balance_after),
            "ACG721 balance should increase by 1");
        });

        it('Test API: buy_token', async () => {
            const buyer = users[2];
            const token_value = 1e5;

            // Obtain chain status
            const acg20_balance_before = await acg20Inst.methods.balanceOf(buyer).call();
    
            // buyer buy amount of ACG20 tokens
            const transaction_id = await acgApi.buy_token(buyer, token_value);
            console.log("buy_token() return transaction ID: ", transaction_id);

            // wait for the transaction established
            await transaction_id;
            
            // Obtain chain status after posting the new artwork
            const acg20_balance_after = await acg20Inst.methods.balanceOf(buyer).call();
    
            // Check the change of user's balance
            assert.equal(
                Number(acg20_balance_before) + token_value,
                Number(acg20_balance_after),
                "ACG20 balance should increase after buy_token()");
        });

        it('Test API: check_user', async function () {
            const artist = users[1];
            let user_type, user_balance_20, user_balance_721, artwork_list;
            [user_type, user_balance_20, user_balance_721, artwork_list] = 
            await acgApi.check_user(artist);
    
            console.log("User's type is ", user_type);
            console.log("User's balance of ACG20 tokens is ", user_balance_20);
            console.log("User's balance of ACG721 tokens is ", user_balance_721);
            console.log("User's artwork list is\n", artwork_list);
    
        });
        
});
