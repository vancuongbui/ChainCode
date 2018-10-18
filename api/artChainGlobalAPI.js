const Web3 = require('web3');
const Prom = require('bluebird');

function ACGChainAPI() {
    let contract20;
    let contract721;

    let acg20Inst;
    let acg721Inst;

    let web3;
    let administrator;

    const post_artwork_prize = 1e3;

    function connect_to_chain(rpc_provider) {
        if (typeof web3 !== 'undefined') {
            console.log("API: Connect to an existing web3 provider ...");
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            console.log("API: Set a new web3 provider ...");
            web3 = new Web3(new Web3.providers.HttpProvider(rpc_provider));
        }
        if (!web3.isConnected()) {
            console.log("API: Failed to connect to chain, exit ...");
            return false;
        }
        administrator = web3.eth.accounts[0];
        return true;
    }

    function simple_test() {
        console.log("API: ACG20 name =", acg20Inst.name());
        console.log("API: Owner of ACG721 =", acg721Inst.owner());
    }

    function set_contract(contracts) {
        contract20 = contracts[0];
        contract721 = contracts[1];

        contract20.instance = web3.eth.contract(JSON.parse(contract20.abiString)).at(contract20.deployed.address);
        contract721.instance = web3.eth.contract(JSON.parse(contract721.abiString)).at(contract721.deployed.address);
    }

    async function prepare_test_accounts(user_number, prefund_eth) {
        console.log("API: ******** Add new users for test ********");
        let users = [];
        // web3.eth.accounts.create
        // web3.personal.newAccount
        for (let i=0; i<user_number; i++) {
            users[i] = await web3.personal.newAccount('password');
            // send some eth to new user
            await web3.eth.sendTransaction({
                from: administrator,
                to: users[i],
                value:web3.toWei(prefund_eth, "ether")})
        }
        // output user initial balance
        console.log("  admin   : " + administrator + " \tbalance: " + web3.fromWei(web3.eth.getBalance(administrator), "ether") + " ether");
        users.forEach(function(e) {
            console.log("  accounts: " + e + " \tbalance: " + web3.fromWei(web3.eth.getBalance(e), "ether") + " ether");
        });
        return users;
    }

    function get_contracts_instrance() {
        return [contract20.instance, contract721.instance];
    }

    async function add_new_user(user_address) {
        const init_token20_balance = 0;
        const mint_trans = await Prom.promisify(contract20.instance.mint.sendTransaction)(user_address, init_token20_balance, {from: administrator});
        await mint_trans;
        totalSupply = contract20.instance.totalSupply.call();
        console.log("Total Supply is ", totalSupply.toNumber());    
    }

    async function post_new_artwork(user_address, artwork_info) {
        // Generate an artwork ID, first get current timestamp,
        // i.e., the number of milliseconds since 1 January 1970 00:00:00
        let artwork_id = new Date().getTime();
        // append a 3-digit random number
        artwork_id = (artwork_id*1e3) + Math.floor(Math.random()*1e3);

        // Generate meta data
        const metadata = JSON.stringify(artwork_info);
        // Store 721 Token for user
        await Prom.promisify(contract721.instance.mintWithMetadata.sendTransaction)(user_address, artwork_id, metadata, {from: administrator, gas: 2000000});
        // Store 20 Token as prize of posting artwork
        await Prom.promisify(contract20.instance.mint.sendTransaction)(user_address, post_artwork_prize, {from: administrator});

        return artwork_id;
    }

    function buy_artwork(buyer_address, owner_address, artwork_id, artwork_prize) {
        let transaction_id = 0;
        return transaction_id;
    }

    function buy_token(buyer_address, value) {
        let transaction_id = 0;
        return transaction_id;
    }

    function freeze_token(buyer_address, artwork_id, artwork_prize, auction_time) {
        let transaction_id = 0;
        return transaction_id;
    }

    function check_artwork(artwork_id) {
        let owner_address;
        let artwork_info;
        return owner_address, artwork_info;
    }

    function check_user(user_address) {
        let type;
        let user_balance;
        let artwork_id;
        return type, user_balance, artwork_id;
    }

    function check_transaction(transaction_id) {
        return;
    }

    return {
        // ----------------------------
        // Auxiliary functions:
        // ----------------------------
        connect_to_chain: connect_to_chain,
        set_contract: set_contract,
        get_contracts_instrance: get_contracts_instrance,
        simple_test: simple_test,
        prepare_test_accounts: prepare_test_accounts,
        // ----------------------------
        // Standard API definition:
        // ----------------------------
        add_new_user: add_new_user,
        post_new_artwork: post_new_artwork,
        buy_artwork: buy_artwork,
        buy_token: buy_token,
        freeze_token: freeze_token,
        check_artwork: check_artwork,
        check_user: check_user,
        check_transaction: check_transaction
    };
}

module.exports = ACGChainAPI;