let contract_compile_deploy = require('../scripts/web3_solc_contract_compile_deploy.js');

console.log("Test start here");
contract_compile_deploy().then((result) => {
    console.log("Test ended here");
    console.log(result[0].deployed.address);
    console.log(result[1].deployed.address);
});