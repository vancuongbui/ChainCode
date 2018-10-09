pragma solidity ^0.4.25;
contract Lottery {
    address public manager;
    // address[] public players;
    // uint lottoryBalance;
    constructor () public payable {
        manager = msg.sender;   //msg is global variable of the sender who create the contract
        // lottoryBalance = 0;
    }
    // any one enter here, will pay an amount of ether, and we need to register his address
    // function enter() public payable {
    //     // require() used for validation
    //     require(msg.value > 0.01 ether);
    //     players.push(msg.sender);
    //     lottoryBalance = lottoryBalance + msg.value / 1000000000000000;
    // }
    
    // // create a function to create a very true random number
    // function random() public returns (uint) {
    //     // call sha3 algorithm
    //     return uint(keccak256(abi.encodePacked(block.difficulty, now, players))); //get hash value, and convert into uint
    // }
    
    // function picwinner() public managerPermission returns (address) {
    //     uint index = random() % players.length;
    //     address winner = players[index];
    //     winner.transfer(lottoryBalance);
        
    //     players = new address[](0); //new array of 0 item inside
    //     return winner;
    // }
    // modifier managerPermission() {
    //     require(msg.sender == manager);
    //     _;  //when called, it will replace the "_" by all lines of code of the calling function
    // }
    // function getPlayers() public view returns (address[]) {
    //     return players;
    // }
    function setManager() public {
        manager = msg.sender;
    }
    function getManager() public view returns (address) {
        return manager;
    }
    // function getBalance() public view returns (uint) {
    //     return lottoryBalance;
    // }
}