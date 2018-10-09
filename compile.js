// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

// create a path to the solidity file
const testTokenPath = path.resolve(__dirname, 'contracts', 'ArtChainToken.sol');
const source = fs.readFileSync(testTokenPath, 'utf8');

// compile the solidity source code
// console.log(solc.compile(source, 1).contracts[':Inbox']);
module.exports = solc.compile(source, 1).contracts[':ACG20'];   //name of the contract defined inside the sol file
