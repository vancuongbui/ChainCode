const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const path = require('path');

/*
//async await action
const deploy = async () => {
    console.log("bytecode", bytecode);
    console.log("interface", interface)
    const accounts = await web3.eth.getAccounts();
    // get a list of account, then deploy the account
    console.log('attempt to deploy from accounts', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ 
            data: '0x' + bytecode,      //keep in mind to put '0x' as prefix of the bytecode
            // arguments: ['initial-message-1'],
         })
         .send({
            from: accounts[0],
            gas: '1000000',
         });
    console.log('contract deployed to ', result.options.address);
    console.log(interface);
}
*/

const contract_compile_deploy = async () => {

    // ----------------------------------------------------------------------------
    // Connect to ethereum network
    // ----------------------------------------------------------------------------
    if (CTRL_CONNECT_NETWORK) {
        console.log("******** Connect to ethereum network ********");
        let web3;
        // Connect to local node
        if (typeof web3 !== 'undefined') {
            console.log("Connect to an existing provider ...");
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            console.log("Set a new provider ...");
            //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
            //web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7546"));
            //var provider = new Web3.providers.HttpProvider('http://127.0.0.1:7546')
            //web3 = new Web3(provider);
            web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }
        const admin = web3.eth.accounts[0];
        console.log("connected to ethereum, set admin = ", admin);    
    }

    // ----------------------------------------------------------------------------
    // Add new users for test
    // ----------------------------------------------------------------------------
    if (CTRL_CREATE_NEW_USER) {
        console.log("******** Add new users for test ********");
        // web3.eth.accounts.create
        // web3.personal.newAccount
        const users = [];
        const userNumber = 10;
        const userInitBalance = 10;
        for (let i=0; i<userNumber; i++) {
            let newUser = await web3.personal.newAccount('password');
            // send some eth to new user
            await web3.eth.sendTransaction({to: newUser, from: admin, value:web3.toWei(userInitBalance, "ether")})
            //await web3.eth.sendTransaction({to: users[i], from: admin, value:'1000000'})
        }
        {
            let i= 0;
            web3.eth.accounts.forEach(function(e) {
                console.log("  eth.accounts["+i+"]: " +  e + " \tbalance: " + web3.fromWei(web3.eth.getBalance(e), "ether") + " ether"); i++;
            });
        }
    }

    // ----------------------------------------------------------------------------
    // Compile contract
    // ----------------------------------------------------------------------------
    if (CTRL_COMPILE_CONTRACT) {
        console.log("******** Compile contract ********");
        const useCompiledContract = false;
        const contract20 = {abi:"", bytecode:""};
        let contract721 = {abi:"", bytecode:""};
        if (useCompiledContract) {
            const CONTRACT_ACG20_PATH = path.resolve(__dirname, '..', 'build', 'contracts', 'ACG20.json');
            const CONTRACT_ACG20_SRC = fs.readFileSync(CONTRACT_ACG20_PATH, 'utf8');
            compiledAcg20 = JSON.parse(CONTRACT_ACG20_SRC);
    
            contract20.abi = JSON.stringify(compiledAcg20.abi);
            contract20.bytecode = compiledAcg20.bytecode;
    
            const CONTRACT_ACG721_PATH = path.resolve(__dirname, '..', 'build', 'contracts', 'ACG721.json');
            const CONTRACT_ACG721_SRC = fs.readFileSync(CONTRACT_ACG721_PATH, 'utf8');
            compiledAcg721 = JSON.parse(CONTRACT_ACG721_SRC);
    
            contract721.abi = JSON.stringify(compiledAcg721.abi);
            contract721.bytecode = compiledAcg721.bytecode;
    
        } else {
            const input = {
                'acg20.sol': fs.readFileSync('./contracts/acg20.sol', 'utf8'),
                'acg721.sol': fs.readFileSync('./contracts/acg721.sol', 'utf8'),
                'SafeMath.sol': fs.readFileSync('./helpers/SafeMath.sol', 'utf8')
            };
            compilingResult = solc.compile({sources: input}, 1);
            if (compilingResult.errors) {
                compilingResult.errors.forEach((errInfo) => {
                    console.log(errInfo);
                });
            }
            compiledAcg20 = compilingResult.contracts['acg20.sol:ACG20'];
            compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
            if (!compiledAcg20 || !compiledAcg721) {
                console.log("Compiling contract failed, exit ...");
                return;
            }

            //contract20.abi = compiledAcg20.contracts[]
            contract20.abi = compiledAcg20.interface;
            contract20.bytecode = '0x' + compiledAcg20.bytecode;
            //let gasEstimate = web3.eth.estimateGas({data: bytecode});
            //let LMS = web3.eth.contract(JSON.parse(abi));
            contract721.abi = compiledAcg721.interface;
            contract721.bytecode = '0x' + compiledAcg721.bytecode;
        }
    
    }

    // module.exports = solc.compile(source, 1).contracts[':ACG20'];   //name of the contract defined inside the sol file
    return;
    // ----------------------------------------------------------------------------
    // Deploy contract
    // ----------------------------------------------------------------------------
    console.log("******** Deploy contract ********");
    const result = await new web3.eth.Contract(JSON.parse(contract20.abi))
    .deploy({ 
        data: contract20.bytecode,      //keep in mind to put '0x' as prefix of the bytecode
        // arguments: ['initial-message-1'],
    })
    .send({
        from: admin,
        gas: '1000000',
    });
    console.log('contract deployed to ', result.options.address);

    /*
        //let LMS = web3.eth.contract(JSON.parse(abi));
    const acg20Inst = await new web3.eth.Contract(JSON.parse(contract20.abi))
    .deploy({
        data: contract20.bytecode
    })
    .send({
        from: admin,
    });
    console.log("ACG20 contract deployed at address: ", acg20Inst.options.address);
    */

    function testContract(address) {
        // Reference to the deployed contract
        const token = contract.at(address);
        // Destination account for test
        const dest_account = '0x002D61B362ead60A632c0e6B43fCff4A7a259285';

        // Assert initial account balance, should be 100000
        const balance1 = token.balances.call(web3.eth.coinbase);
        console.log(balance1 == 1000000);

        // Call the transfer function
        token.transfer(dest_account, 100, {from: web3.eth.coinbase}, (err, res) => {
            // Log transaction, in case you want to explore
            console.log('tx: ' + res);
            // Assert destination account balance, should be 100 
            const balance2 = token.balances.call(dest_account);
            console.log(balance2 == 100);
        });
    }
};

CTRL_CONNECT_NETWORK = false;
CTRL_COMPILE_CONTRACT = true;
CTRL_CREATE_NEW_USER = false;

console.log("Test start here");
contract_compile_deploy().then(()=>{
    console.log("Test ended here");
});

