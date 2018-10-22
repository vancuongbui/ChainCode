https://github.com/StephenGrider/EthereumCasts
http://web.archive.org/web/20131228111141/http://vbuterin.com/ethereum.html
blockchain with anders: https://anders.com/blockchain/blockchain.html
remix.ethereum.org
https://github.com/settings/tokens
https://iancoleman.io/bip39/    //to restore the account
https://infura.io   //access to ethereum network
https://ethereum.stackexchange.com/a/47654.
https://rinkeby.etherscan.io/   //where you want to see you contract deploy on rinkeby


ERROR:
    - The contract code couldn't be stored, please check your gas limit.
        Solution: //keep in mind to put '0x' as prefix of the bytecode
            .deploy({ 
                data: '0x' + bytecode,      
                arguments: ['initial-message-1'],
            })




1. Ethereum Network

2. Node:
    Ethereum of too many nodes
    each node contains a full copy of the blockchain

3. Web3.js
    - a library:
        store contract
        transact moneny

4. Metamask/ Mist Browser extention:
    - allow users non-develpor to use ethereum.
    - install:
        browse web store/ search for metamask, add extention
    - Create new account
        + account address: 
        + public key:
        + private key:
        //one account can work with all other networks, including the main network
    - http://rinkeby-faucet.com/:
        //to receive token

5. Rinkeby Test network

6. How transction works:
    step 1: submit
    Step 2: account address sent to the backend server
    Step 3: Backend server used web3 library to create a transaction object (see 7)
    Step 4: Backen server sent transaction object to the Rinkeby test network (or main network)
    Step 5: Backen server wait for transaction to be confirmed
    Step 6: Backen server sent seccuss message back to the browser (user)
7. Transaction:
    - nonce: number of times the sender has sent a transaction
    - to: address of the ongoing receiver
    - value: the amount of ethereum the sender going to send
    - gasPrice: amount of ethereum the sender is going to pay per unit gas
    - startGas/gasLimit: Units of gas that this transaction can consume
    - v, r, s: cryptographic picies of data that can be used to generate the sender's account address
        //these number were generated from sender's private key (one way generated)

8. Blockchain:
    - block number: it is a number of a chain of block
    - nonce: nonce + data -> hash = a hex value that < a target
    - target: or difficulty: a number predefined. the smaler, the target, the harder the finding
        + target block time: 
    - block time: time to run all the hash posibilities to get the target.

9. smart contract
    - concept:
    - contract account:
        + balance: ethereum currently in the account
        + starage: Data storage for this contract
        + code: Raw machine code for this contract
        
10. Solidity.
    - Strong typed
    - file extention: .sol
    - gotchas.
    - Solidity compiler:
        + byte code ready for deployment
        + application binrary interface (ABI)
    - Remix:
        //first pecies of code
            pragma solidity ^0.4.17;
            contract Inbox {
                string public message;
                
                constructor (string initialMessage) public {
                    message = initialMessage;
                }
                
                // function Inbox(string initialMessage) public {
                //     message = initialMessage;
                // }
                
                function setMessage(string newMessage) public {
                    message  = newMessage;
                }
                
                function getMessage() public view returns (string) {
                    return message;
                }
            }
    - function type:
        + public: any one can access 
        + private: only the class itself can call the function
        + view: this type of function used to return data, does not monify contract's data
        + constant: means the same as view
        + pure: not really usefull
        + payable: send ethereum.
    - Run:
        - environment: javascript VM
        - account
        - Gas limit
        - Value
    - Deploy:
        //Create an instance of the contract
    - submit the transaction:
        //when we want to change anything on blockchain.

11. Get more Ether
    - https://faucet.rinkeby.io/
    - plus.google.com
        //create new port with content = your ether account
        //copy the post link and paste on https://faucet.rinkeby.io/
        //request ether amount

12. Truffle
    - troulbe expecting: not runing, not stable since it is rapid developing
    - contract creation
    - local Testing
    - Development
        //

13. solidity compileter
    - install
        npm install --save solc

14. Visual Studio C++
    - install:
        npm install --global --production windows-build-tools

15. Test library
    - install
        npm install --save mocha ganache-cli web3
    - Mocha: 
        //general purpose for testing javascript whether front-end or backend.
        - it: run a test and make an assertion.
        - describe: groups together "it" functions
        - beforeEach: execute some general setup code.
    - scripts for using mocha to test:
        "scripts": {
            "test": "mocha"
        },
    - run the test:
        npm run test

16. Truffle
    - install
        npm install --save truffle-hdwallet-provider
        
17. Balance of contract:
    - using:
        const balance = await web3.eth.getBalance(accounts[0]);
