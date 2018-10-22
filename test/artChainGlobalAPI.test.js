const assert = require('assert');
const Prom = require('bluebird');

const contract_compile_deploy = require('../scripts/contract_to_chain_web3_1.0.js');
const AcgApi = require('../api/artChainGlobalAPI.js');

const RPC_SERVER = "http://127.0.0.1:7545"

let contracts;
let users;
const acgApi = AcgApi();
let acg20Inst;
let acg721Inst;

const post_artwork_prize = 1e3;

describe('A simple test suite', async function () {
    before (async function () {
        console.log("Setup environment start ...");
        contracts = await contract_compile_deploy(RPC_SERVER);
        console.log("Setup environment finish ...");

        await acgApi.connect_to_chain(RPC_SERVER);
        acgApi.set_contract(contracts);
        
        [acg20Inst, acg721Inst] = acgApi.get_contracts_instrance();

        // Create test accounts with prefunded eth
        const user_number = 3;
        const prefund_eth = 100;
        users = await acgApi.prepare_test_accounts(user_number, prefund_eth);
    });

    it('Test API: add_new_user', async () => {
        await acgApi.add_new_user(users[0]);

        const expected_acg20_balance = 0;
        const expected_acg721_balance = 0;

        const acg20_balance = await acg20Inst.methods.balanceOf(users[0]).call();
        const acg721_balance = await acg721Inst.methods.balanceOf(users[0]).call();

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
        const acg20_balance_before = await acg20Inst.methods.balanceOf(artist).call();
        const acg721_balance_before = await acg721Inst.methods.balanceOf(artist).call();

        // Post a new artwork, it will:
        // - Add a new 721 token for user
        // - Add amount of 20 token as prize
        const artwork_id = await acgApi.post_new_artwork(artist, artwork);

        // Obtain chain status after posting the new artwork
        const acg20_balance_after = await acg20Inst.methods.balanceOf(artist).call();
        const acg721_balance_after = await acg721Inst.methods.balanceOf(artist).call();

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
});
