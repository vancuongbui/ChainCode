const fs = require('fs');

let blockChainConf = {
    RPC_SERVER: "http://127.0.0.1:31000",
    //RPC_SERVER: "http://47.74.70.159:8545",
    CTRL_COMPILE_NEW_CONTRACT_AND_DEPLOY: false,
    CTRL_CREATE_NEW_ACCOUTNS_FOR_TEST: false,
    CONTRACT_20_ADDRESS: "0x44aDB117BCb88C417975add47E8F91c237f1f2aE",
    CONTRACT_721_ADDRESS: "0x6e62DdE4Eb0F31aFE49B5fB655dc851F92B06ACB"
};

const confString = JSON.stringify(blockChainConf);
fs.writeFileSync("chainConf.json", confString);