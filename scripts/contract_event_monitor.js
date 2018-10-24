const AcgApi = require('../api/artChainGlobalAPI.js');
const path = require('path');

const RPC_SERVER = "http://127.0.0.1:31000"
const acgApi = AcgApi();
let web3;

const contract_address = [
    '0x81046AF5312eE8D8f7AbBe2528e0419E0E2554E6',
    '0x9924B156F473e0ed26C5ebd819Ba28A9Bb84E63B'
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function prepare () {
    // ----------------------------------------------------------
    // Connect to RPC server
    // ----------------------------------------------------------
    web3 = await acgApi.connect_to_chain(RPC_SERVER);

    // ----------------------------------------------------------
    // Retrieve deployed contracts instance from the chain
    // ----------------------------------------------------------
    // Step 1. Load contract interface definition
    const contract_folder = path.resolve(__dirname, '..', 'build', 'contracts');
    acgApi.read_in_compiled_contract_JSON(contract_folder);  
    // Step 2. Retrieve contracts instance by interface and address 
    acgApi.retrieve_deployed_contracts(contract_address);

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
        //filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
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

    console.log(web3.currentProvider.connection.connecting);

    teardown();
    return;

    //const events_array = await retrieve_past_events();
    //console.log("Retrieve ", events_array.length, " events");
    //events_array.forEach((event) => { console.log(event) });

    monitor_events();
});