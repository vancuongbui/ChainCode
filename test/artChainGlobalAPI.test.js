const assert = require('assert');
const contract_compile_deploy = require('../scripts/contract_to_chain.js');
const AcgApi = require('../api/artChainGlobalAPI.js');

let contracts;
let users;
const acgApi = AcgApi();

describe('A simple test suite', async function () {
    before (async function () {
        console.log("Get the deployed contract instance ...");
        contracts = await contract_compile_deploy();

        assert.ok(acgApi.connect_to_chain("http://127.0.0.1:7545"));
        acgApi.set_contract(contracts);
        

        // Create test accounts with prefunded eth
        const user_number = 10;
        const prefund_eth = 100;
        users = await acgApi.prepare_test_accounts(user_number, prefund_eth);
    });

    it('Test API: add_new_user', async () => {
        await acgApi.add_new_user(users[0]);
        assert.ok(true);
    });
});
