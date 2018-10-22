const assert = require('assert');
const Prom = require('bluebird');

const contract_compile_deploy = require('../scripts/contract_to_chain.js');
const AcgApi = require('../api/artChainGlobalAPI.js');

let contracts;
let users;
const acgApi = AcgApi();
let acg20Inst;
let acg721Inst;

const post_artwork_prize = 1e3;

describe('A simple test suite', async function () {
    before (async function () {
        console.log("Get the deployed contract instance ...");
        contracts = await contract_compile_deploy();

        assert.ok(acgApi.connect_to_chain("http://127.0.0.1:7545"));
        acgApi.set_contract(contracts);
        
        [acg20Inst, acg721Inst] = acgApi.get_contracts_instrance();

        // Create test accounts with prefunded eth
        const user_number = 10;
        const prefund_eth = 100;
        users = await acgApi.prepare_test_accounts(user_number, prefund_eth);
    });

    it('Test API: add_new_user', async () => {
        await acgApi.add_new_user(users[0]);

        const expected_acg20_balance = 0;
        const expected_acg721_balance = 0;

        const acg20_balance = acg20Inst.balanceOf.call(users[0]);
        const acg721_balance = acg721Inst.balanceOf.call(users[0]);

        assert.equal(expected_acg20_balance, acg20_balance.toNumber(),
        "New user's balance of ACG20 token should be zero");
        assert.equal(expected_acg721_balance, acg721_balance.toNumber(),
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
        const acg20_balance_before = acg20Inst.balanceOf.call(artist);
        const acg721_balance_before = acg721Inst.balanceOf.call(artist);

        // Post a new artwork, it will:
        // - Add a new 721 token for user
        // - Add amount of 20 token as prize
        const artwork_id = await acgApi.post_new_artwork(artist, artwork);

        // Obtain chain status after posting the new artwork
        const acg20_balance_after = acg20Inst.balanceOf.call(artist);
        const acg721_balance_after = acg721Inst.balanceOf.call(artist);

        // Check the change of user's balance
        assert.equal(
            acg20_balance_before.toNumber() + post_artwork_prize,
            acg20_balance_after.toNumber(),
            "ACG20 balance should increase by prize");
        assert.equal(
            acg721_balance_before.toNumber() + 1,
            acg721_balance_after.toNumber(),
            "ACG721 balance should increase by 1");
            //console.log("New artwork ID = ", artwork_id);
        });

        it('Test API: buy_token', async () => {
            const buyer = users[2];
            const token_value = 1e5;

            // Obtain chain status
            const acg20_balance_before = acg20Inst.balanceOf.call(buyer);
    
            // buyer buy amount of ACG20 tokens
            const transaction_id = acgApi.buy_token(buyer, token_value);
            console.log("Transaction Hash is ", transaction_id);

            // wait for the transaction established
            await Prom.promisify(web3.eth.getTransactionReceipt)(transaction_id);

            // Obtain chain status after posting the new artwork
            const acg20_balance_after = acg20Inst.balanceOf.call(buyer);
    
            // Check the change of user's balance
            assert.equal(
                acg20_balance_before.toNumber() + token_value,
                acg20_balance_after.toNumber(),
                "ACG20 balance should increase after buy_token()");
        });
});
