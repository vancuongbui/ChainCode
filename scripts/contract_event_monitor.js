const AcgApi = require('../api/artChainGlobalAPI.js');
const path = require('path');

const RPC_SERVER = "http://127.0.0.1:31000"
const acgApi = AcgApi();
let web3;

const CTRL_COMPILE_NEW_CONTRACT_AND_DEPLOY = false;
const CTRL_CREATE_NEW_ACCOUTNS_FOR_TEST = false;

const contract_address = [
    '0x649D7F521CEd7a9969bC97F7DD5Db46aeF0a93e0',
    '0x3Fc2b3A1E5dc3EAdb1b79108eA8c4A4DF21dB45E'
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function prepare () {
    // ----------------------------------------------------------
    // Connect to RPC server
    // ----------------------------------------------------------
    web3 = await acgApi.connect_to_chain(RPC_SERVER);

    if (CTRL_COMPILE_NEW_CONTRACT_AND_DEPLOY) {
        // ----------------------------------------------------------
        // Compile new contracts from source code and deploy to chain
        // ----------------------------------------------------------

        // Step 1: Compile contracts from source
        const contract_folder = path.resolve(__dirname, '..', 'contracts');
        acgApi.compile_contract_from_source(contract_folder);

        // Step 2: Deploy the contracts to the chain
        await acgApi.deploy_new_contracts();
    } else {
        // ----------------------------------------------------------
        // Retrieve contracts instance from the chain
        // ----------------------------------------------------------

        // Step 1. Load contract interface definition
        const contract_folder = path.resolve(__dirname, '..', 'build', 'contracts');
        acgApi.read_in_compiled_contract_JSON(contract_folder);
        
        // Step 2. Retrieve deployed contracts instance by address and interface
        await acgApi.retrieve_deployed_contracts(contract_address);
    }

    // ----------------------------------------------------------
    // CREATE NEW ACCOUNTS ON THE NODE FOR TEST
    // ----------------------------------------------------------
    if (CTRL_CREATE_NEW_ACCOUTNS_FOR_TEST) {
        const user_number = 5;
        const prefund_eth = 1e6;
        let users = [];
        // Create test accounts with prefunded eth
        for (let i=0; i<user_number; i++) {
            users[i] = await acgApi.create_new_account_and_top_up('password', prefund_eth);
        }
        // Print out initial balance of testing accounts
        for (let i=0; i<user_number; i++) {
            const userBalance = await web3.eth.getBalance(users[i]);
            console.log("Test accounts: ", users[i], "initial balance is ", web3.utils.fromWei(userBalance, "ether"), "ether");
        }
    }

    // ----------------------------------------------------------
    // Simple test
    // ----------------------------------------------------------
    await acgApi.simple_test_on_environment();
}

async function monitor_events () {
    // Get contract instances
    [contract20, contract721] = acgApi.get_contracts_instrance();

    contract20.events.allEvents({ fromBlock: 'latest' }, console.log);
    contract721.events.allEvents({ fromBlock: 'latest' }, console.log);
}

async function retrieve_past_events() {
    // Get contract instances
    [contract20, contract721] = acgApi.get_contracts_instrance();
    const events_array = await contract20.getPastEvents('allEvents', {
        fromBlock: 0,
        toBlock: 'latest'
    });
    return events_array;
}

function teardown() {
    web3.currentProvider.connection.close();
}

prepare().then( async () => {
    console.log("Start work from here ....");

    //const events_array = await retrieve_past_events();
    //console.log("Retrieve ", events_array.length, " events");
    //events_array.forEach((event) => { console.log(event) });

    monitor_events();
});
