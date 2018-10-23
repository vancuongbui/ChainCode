const Web3 = require('web3');
const path = require('path');
const fs = require('fs');
const solc = require('solc');

function ACGChainAPI() {

    const contract20 = {abiString:"", bytecode:"", instance:""};
    const contract721 = {abiString:"", bytecode:"", instance:""};

    let web3;
    let administrator;

    const post_artwork_prize = 1e3;

    async function connect_to_chain(rpc_provider) {
        if (typeof web3 !== 'undefined') {
            console.log("API: Connect to an existing web3 provider ...");
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            console.log("API: Set a new web3 provider ...");
            web3 = new Web3(new Web3.providers.HttpProvider(rpc_provider));
        }
        // Exception is thrown if the connection failed
        await web3.eth.net.isListening();
        accounts = await web3.eth.getAccounts();
        administrator = accounts[0];
        console.log("Connected to RPC server, set administrator to ", administrator, "...");
        return web3;
    }

    function compile_contract_from_source(contract_folder) {
        const CONTRACT_ACG20_PATH = path.resolve(contract_folder, 'acg20.sol');
        const CONTRACT_ACG721_PATH = path.resolve(contract_folder, 'acg721.sol');
        const LIB_SAFEMATH_PATH = path.resolve(contract_folder, '..', 'helpers', 'SafeMath.sol');
        const input = {
            'acg20.sol': fs.readFileSync(CONTRACT_ACG20_PATH, 'utf8'),
            'acg721.sol': fs.readFileSync(CONTRACT_ACG721_PATH, 'utf8'),
            'SafeMath.sol': fs.readFileSync(LIB_SAFEMATH_PATH, 'utf8')
        };
        compilingResult = solc.compile({sources: input}, 1, (path) => {
            // Solc doesn't support importing from other folders
            // so resolve the missing files here
            if (path == "helpers/SafeMath.sol") {
                return {contents: fs.readFileSync('./helpers/SafeMath.sol', 'utf8') };
            } else {
                return {error: 'File not found'};
            }
        });
        // Output compiling error and warnings.
        if (compilingResult.errors) {
            compilingResult.errors.forEach((errInfo) => {
                console.log(errInfo);
            });
        }
        // Check if both contracts compiled successfully
        compiledAcg20 = compilingResult.contracts['acg20.sol:ACG20'];
        compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
        if (!compiledAcg20 || !compiledAcg721) {
            console.log("Compiling contract failed, exit ...");
            return;
        }
        contract20.abiString = compiledAcg20.interface;
        contract20.bytecode = '0x' + compiledAcg20.bytecode;
        contract721.abiString = compiledAcg721.interface;
        contract721.bytecode = '0x' + compiledAcg721.bytecode;
    }

    function read_in_compiled_contract_JSON(contract_folder) {
        const CONTRACT_ACG20_PATH = path.resolve(contract_folder, "ACG20.json");
        const CONTRACT_ACG20_SRC = fs.readFileSync(CONTRACT_ACG20_PATH, 'utf8');

        const compiledAcg20 = JSON.parse(CONTRACT_ACG20_SRC);
        contract20.abiString = JSON.stringify(compiledAcg20.abi);
        contract20.bytecode = compiledAcg20.bytecode;

        const CONTRACT_ACG721_PATH = path.resolve(contract_folder, 'ACG721.json');
        const CONTRACT_ACG721_SRC = fs.readFileSync(CONTRACT_ACG721_PATH, 'utf8');
        
        const compiledAcg721 = JSON.parse(CONTRACT_ACG721_SRC);
        contract721.abiString = JSON.stringify(compiledAcg721.abi);
        contract721.bytecode = compiledAcg721.bytecode;
    }

    function retrieve_deployed_contracts(address) {
        contract20.instance = new web3.eth.Contract(JSON.parse(contract20.abiString), address[0]);
        contract721.instance = new web3.eth.Contract(JSON.parse(contract721.abiString), address[1]);
    }

    async function deploy_new_contracts() {
        contract20.instance = new web3.eth.Contract(JSON.parse(contract20.abiString), null, {
            data: contract20.bytecode
        });

        let estimatedGas = await contract20.instance.deploy().estimateGas();
        console.log("Estimate to use ", estimatedGas, "gas to deploy the contract");
        await contract20.instance.deploy().send({
            from: administrator,
            gas: estimatedGas
        });

        contract721.instance = new web3.eth.Contract(JSON.parse(contract721.abiString), null, {
            data: contract721.bytecode
        });
        estimatedGas = await contract721.instance.deploy().estimateGas();
        console.log("Estimate to use ", estimatedGas, "gas to deploy the contract");
        await contract721.instance.deploy().send({
            from: administrator,
            gas: estimatedGas
        });
        console.log("Contracts deployed successfully ...\nACG20 is deployed at: ",
        contract20.instance.options.address,
        "\nACG721 is deployed at: ", contract721.instance.options.address);
    }

    async function simple_test_on_environment() {
        console.log("******** Simple test ********");
        const name = await contract20.instance.methods.name().call();
        const owner = await contract721.instance.methods.owner().call();
        console.log("Simple test: ACG20 name =", name);
        console.log("Simple test: Owner of ACG721 =", owner);
    }

    function get_contracts_instrance() {
        return [contract20.instance, contract721.instance];
    }

    async function create_new_account_and_top_up(password, value) {
        // Create a new account on the node
        const user = await web3.eth.personal.newAccount(password);
        // Top up some eth for new user
        await web3.eth.sendTransaction({
            from: administrator,
            to: user,
            value: web3.utils.toWei(value.toString(), "ether")
        });
        return user;
    };

    async function create_batch_accounts_and_top_up(user_number, password, prefund_eth) {
        console.log("API: ******** Add new users for test ********");
        let users = [];
        for (let i=0; i<user_number; i++) {
            users[i] = await web3.eth.personal.newAccount(password);
            // send some eth to new user
            await web3.eth.sendTransaction({
                from: administrator,
                to: users[i],
                value: web3.utils.toWei(prefund_eth.toString(), "ether")
            });
        };
        return users;
    }

    async function retrieve_batch_accounts_from_node(user_number) {
        let users = await web3.eth.getAccounts();
        // First account is supposed to be administrator
        // Need at least (user_number) more accounts for general users
        if (users.length < user_number+1) {
            error("There aren't as many accounts as expected ...");
        }
        return users.slice(2, 2+user_number);
    }

    async function add_new_user(user_address) {
        const init_token20_balance = 0;
        await contract20.instance.methods.mint(user_address, init_token20_balance).send({
            from: administrator
        });
        return true;
    }

    async function post_new_artwork(user_address, artwork_info) {
        // Generate an artwork ID, first get current timestamp,
        // i.e., the number of milliseconds since 1 January 1970 00:00:00
        let artwork_id = new Date().getTime();
        // append a 3-digit random number
        artwork_id = (artwork_id*1e3) + Math.floor(Math.random()*1e3);

        // Generate meta data
        const metadata = JSON.stringify(artwork_info);

        // Store 721 Token for user, because we don't know the size of
        // meta data, so need first estimate required gas amount for the transaction
        //const gasValue = await contract721.instance.methods.mintWithMetadata(user_address, artwork_id, metadata).estimateGas({
        //    from: administrator
        //});
        // Store 20 Token as prize of posting artwork
        const trans_721_mint = contract721.instance.methods.mintWithMetadata(user_address, artwork_id, metadata).send({
            from: administrator,
            gas: 1500000
        });
        const trans_20_mint = contract20.instance.methods.mint(user_address, post_artwork_prize).send({
            from: administrator
        });
        console.log("Posted a new artwork, start ...");
        await trans_721_mint;
        await trans_20_mint;
        console.log("Posted a new artwork, stop ...");
        return artwork_id;
    }

    function buy_artwork(buyer_address, owner_address, artwork_id, artwork_prize) {
        let transaction_id = 0;
        return transaction_id;
    }

    async function buy_token(buyer_address, value) {
        const receipt = await contract20.instance.methods.mint(buyer_address, value).send({
            from: administrator
        });

        return receipt.transactionHash;
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

    async function check_transaction(transaction_id) {
        return web3.eth.getTransaction(transaction_id);
    }

    return {
        // ----------------------------
        // Auxiliary functions:
        // ----------------------------
        connect_to_chain: connect_to_chain,
        compile_contract_from_source: compile_contract_from_source,
        read_in_compiled_contract_JSON: read_in_compiled_contract_JSON,
        retrieve_deployed_contracts: retrieve_deployed_contracts,
        deploy_new_contracts: deploy_new_contracts,
        get_contracts_instrance: get_contracts_instrance,
        simple_test_on_environment: simple_test_on_environment,
        create_new_account_and_top_up: create_new_account_and_top_up,
        create_batch_accounts_and_top_up: create_batch_accounts_and_top_up,
        retrieve_batch_accounts_from_node, retrieve_batch_accounts_from_node,
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