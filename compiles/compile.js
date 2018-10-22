// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

// create a path to the solidity file
const testTokenPath = path.resolve(__dirname, '..', 'contracts', 'acg20.sol');
const testLibPath = path.resolve(__dirname, '..', 'helpers', 'SafeMath.sol');
const input = {
    'acg20.sol': fs.readFileSync(testTokenPath, 'utf8'),
    'SafeMath.sol': fs.readFileSync(testLibPath, 'utf8')
};

compilingResult = solc.compile({sources: input}, 1, (path) => {
    // Solc doesn't support importing from other folders
    // so resolve the missing files here
    if (path == "helpers/SafeMath.sol") {
        return {contents: fs.readFileSync('../helpers/SafeMath.sol', 'utf8') };
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
if (!compiledAcg20) {
    console.log("Compiling contract failed, exit ...");
    return;
}

module.exports = compiledAcg20;   //name of the contract defined inside the sol file
