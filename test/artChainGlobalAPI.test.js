const assert = require('assert');
const contract_compile_deploy = require('../scripts/contract_to_chain.js');
const AcgApi = require('../api/artChainGlobalAPI.js');

before (async () => {
    console.log("Test start here");
    contracts = await contract_compile_deploy();
});

describe('A simple test suite', () => {
    it('A simple test case', async () => {
        let apiObj = AcgApi();
        assert.ok(true);
    });
});