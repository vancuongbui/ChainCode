pragma solidity ^0.4.21;
/**
 * Overflow aware uint math functions.
 *
 * Inspired by https://github.com/MakerDAO/maker-otc/blob/master/contracts/simple_market.sol
 */
contract SafeMath {
    //internals

    function safeMul(uint a, uint b) internal pure returns (uint) {
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function safeSub(uint a, uint b) internal pure returns (uint) {
        assert(b <= a);
        return a - b;
    }

    function safeAdd(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        assert(c>=a && c>=b);
        return c;
    }

    // When they are called, they cause the arguments to be stored in the transaction’s log
    // to call these events, use emit 
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Burn(address indexed _from, uint256 _value);
}




/**
 * ERC 20 token
 *
 * https://github.com/ethereum/EIPs/issues/20
 */
contract StandardToken is SafeMath {

    /**
     * Reviewed:
     * - Interger overflow = OK, checked
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {

        require(_to != 0X0);

        // If there are not as many tokens in the from address, stop trading
        // If the transfer amount is negative, stop trading
        if (balances[msg.sender] >= _value && balances[msg.sender] - _value < balances[msg.sender]) {

            // Sender's account minus the number of corresponding tokens, using safemath transactions
            balances[msg.sender] = super.safeSub(balances[msg.sender], _value);
            // Receiver account increase the number of corresponding tokens, use safemath transaction
            balances[_to] = super.safeAdd(balances[_to], _value);

            emit Transfer(msg.sender, _to, _value);//Call event to log addresses of sender, receiver and value
            return true;
        } else { return false; }
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

        require(_to != 0X0);

        
        // If there are not as many tokens in the from address, stop trading
        // If the owner of the from address, give this msg.sender permissions without so many tokens, stop trading
        // If the transfer amount is negative, stop trading
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_from] - _value < balances[_from]) {

            // The transaction sender's available access to the from account is reduced by the corresponding amount, using the safemath transaction
            allowed[_from][msg.sender] = super.safeSub(allowed[_from][msg.sender], _value);
            // From the account minus the number of corresponding tokens, use safemath transaction
            balances[_from] = super.safeSub(balances[_from], _value);
            // To account increase the number of corresponding tokens, use safemath transaction
            balances[_to] = super.safeAdd(balances[_to], _value);

            emit Transfer(_from, _to, _value);//Call event
            return true;
        } else { return false; }
    }

    function balanceOf(address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {        
        // msg.sender of the transaction can set other sender address permissions
        // Allow the sender address to use a certain number of tokens under the msg.sender address
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {    
    // Check how many owners can control the token under the owner account
      return allowed[_owner][_spender];
    }

    mapping(address => uint256) balances;

    mapping (address => mapping (address => uint256)) allowed;

    uint256 public totalSupply;
}










/*******************************************************************************
 *
 * Artchain Token Smart contract.
 *
 * version 15, 2018-05-28
 *
 ******************************************************************************/
contract ArtChainToken is StandardToken {
    
    // The name of our token cannot be changed after deployment
    string public constant name = "Artchain Global Token";
    
    // The code of our token cannot be changed after deployment
    string public constant symbol = "ACG";
    
    // How many blocks have been in the contract before our contract was deployed?
    uint public startBlock;
    
    //Support 8 transactions after the decimal point. E.g. Minimum volume 0.00000001 tokens
    uint public constant decimals = 8;
    
    // The total number of our tokens (don't care *10**uint(decimals))
    uint256 public totalSupply = 3500000000*10**uint(decimals); // 35 billion


   // founder account - address can be changed
    address public founder = 0xaae269dc6d6b137fe506104cd08e48e6cb6e282b;
    
    // founder_token = founder when deploying the contract
    // The corresponding token is stored (and locked according to the rules) in this account
    // Change the founder address, the token will remain in the founder_token address and will not be transferred
    // The address of the founder_token cannot be changed after the contract is deployed. 
    // The token under this address can only be released according to the established rules.
    address public constant founder_token = 0xaae269dc6d6b137fe506104cd08e48e6cb6e282b;// founder_token=founder;

    
    // Incentive team poi account - address can be changed
    address public poi = 0x0bf6ba570ba2cf60359c8e4115150be5c8f91c17;
  
    // when deploying the contract, poi_token = poi
    // The corresponding token is stored (and locked according to the rules) in this account
    // Change the poi address, the token will remain in the poi_token address and will not be transferred
    // The address of the poi_token cannot be changed after the contract is deployed. 
    // The token under this address can only be released according to the established rules.
    address public constant poi_token = 0x0bf6ba570ba2cf60359c8e4115150be5c8f91c17; // poi_token=poi
    
    // The account used for private placement, the contract cannot be changed after deployment, 
    // but the token can be transferred at will.
    address public constant privateSale = 0xba9ef61841cdb838f6145b2e202576db001447bb;
    
    // for frozen account transfer/transaction
    // Generate a block every 14 seconds, and determine the freezing time based on the number of blocks.
    // It takes about a month to generate 185143 blocks
    uint public constant one_month = 185143;// ----   Time standard
    uint public poiLockup = super.safeMul(uint(one_month), 7);  // Poi account freeze time 7 months
    
    // used to pause the transaction, only the founder account can change this status
    bool public halted = false;



    /*******************************************************************
     *
     *  The body of the deployment contract
     *
     *******************************************************************/
    constructor() public {
    //constructor() public {

        // When the contract is deployed, startBlock is equal to the latest block number.
        startBlock = block.number;

        // Give founder 20% token, 35 billion 20% is 700 million (don't care *10**uint(decimals))
        balances[founder] = 700000000*10**uint(decimals); // 7 billion
        
        // 40% of the token for the poi account, 40% of the 3.5 billion is 1.4 billion
        balances[poi] = 1400000000*10**uint(decimals);   // 14 billion

        // 40% of the token for the private equity account, 40% of the 3.5 billion is 1.4 billion
        balances[privateSale] = 1400000000*10**uint(decimals); // 14 billion
    }


    /*******************************************************************
     *
     *  Stop all transactions urgently, only the founder account can run
     *
     *******************************************************************/
    function halt() public returns (bool success) {
        if (msg.sender!=founder) return false;
        halted = true;
        return true;
    }
    function unhalt() public returns (bool success) {
        if (msg.sender!=founder) return false;
        halted = false;
        return true;
    }


    /*******************************************************************
     *
     * Modify the address of founder/poi, only "now founder" can be modified
     *
     * But token still exists under founder_token and poi_token
     *
     *******************************************************************/
    function changeFounder(address newFounder) public returns (bool success){        
    // Only "now founder" can change the address of the Founder
        if (msg.sender!=founder) return false;
        founder = newFounder;
        return true;
    }
    function changePOI(address newPOI) public returns (bool success){
        // Only "now founder" can change the address of poi
        if (msg.sender!=founder) return false;
        poi = newPOI;
        return true;
    }




    /********************************************************
     *
     *  Transfer tokens in your account (requires the freezing rules to be met)
     *
     ********************************************************/
    function transfer(address _to, uint256 _value) public returns (bool success) {

        // If the status is now "suspended", reject the transaction
        if (halted==true) return false;

        
            // token in poi_token, determine whether the freeze time is one year in the freeze time, 
            // that is, the time of poiLockup blocks
        if (msg.sender==poi_token && block.number <= startBlock + poiLockup)  return false;

      
        // The token in the founder_token is released according to the rules for 48 months (initial state is 700 million)
        if (msg.sender==founder_token){
            
            // The first 6 months can't move the balance of the founder_token account to maintain 100% (100% of 700 million = 700 million)
            if (block.number <= startBlock + super.safeMul(uint(one_month), 6)  && super.safeSub(balanceOf(msg.sender), _value)<700000000*10**uint(decimals)) return false;            
            // 6 months to 12 months The balance of the founder_token account is at least 85% (85% of 700 million = 595 million)
            if (block.number <= startBlock + super.safeMul(uint(one_month), 12) && super.safeSub(balanceOf(msg.sender), _value)<595000000*10**uint(decimals)) return false;            
            // 12 months to 18 months The balance of the founder_token account is at least 70% (70% of 700 million = 490 million)
            if (block.number <= startBlock + super.safeMul(uint(one_month), 18) && super.safeSub(balanceOf(msg.sender), _value)<490000000*10**uint(decimals)) return false;            
            // 18 months to 24 months The balance of the founder_token account is at least 57.5% (57.5% of 700 million = 402.5 million)
            if (block.number <= startBlock + super.safeMul(uint(one_month), 24) && super.safeSub(balanceOf(msg.sender), _value)<402500000*10**uint(decimals)) return false;            
            // 24 months to 30 months The balance of the founder_token account is at least 45% (45% of 700 million = 315 million)
            if (block.number <= startBlock + super.safeMul(uint(one_month), 30) && super.safeSub(balanceOf(msg.sender), _value)<315000000*10**uint(decimals)) return false;
            // 30 months to 36 months The balance of the founder_token account is at least 32.5% (32.5% of 700 million = 227.5 million)
            if (block.number <= startBlock + super.safeMul(uint(one_month), 36) && super.safeSub(balanceOf(msg.sender), _value)<227500000*10**uint(decimals)) return false;            
            // 36 months to 42 months. The balance of the founder_token account is at least 20% (20% of the 700 million = 140 million)
            if (block.number <= startBlock + super.safeMul(uint(one_month), 42) && super.safeSub(balanceOf(msg.sender), _value)<140000000*10**uint(decimals)) return false;            
            // 42 months to 48 months The balance of the founder_token account is at least 10% (10% of 700 million = 70 million)
            if (block.number <= startBlock + super.safeMul(uint(one_month), 48) && super.safeSub(balanceOf(msg.sender), _value)< 70000000*10**uint(decimals)) return false;
            // 48 months later, no limit
        }
        
        //Other cases, normal trading
        return super.transfer(_to, _value);
    }

    /********************************************************
     *
     *  Transfer tokens from other people's accounts (subject to the freezing rules)
     *
     ********************************************************/
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // If the status is now "suspended", reject the transaction
        if (halted==true) return false;

        // token in poi_token, determine whether the freeze time is one year in the freeze time, that is, the time of poiLockup blocks
        if (_from==poi_token && block.number <= startBlock + poiLockup) return false;

        // The token in the founder_token is released according to the rules for 48 months (initial state is 700 million)
        if (_from==founder_token){
          // The first 6 months can't move the balance of the founder_token account to maintain 100% (100% of 700 million = 700 million)
          if (block.number <= startBlock + super.safeMul(uint(one_month), 6)  && super.safeSub(balanceOf(_from), _value)<700000000*10**uint(decimals)) return false;
          // 6 months to 12 months The balance of the founder_token account is at least 85% (85% of 700 million = 595 million)
          if (block.number <= startBlock + super.safeMul(uint(one_month), 12) && super.safeSub(balanceOf(_from), _value)<595000000*10**uint(decimals)) return false;
          // 12 months to 18 months The balance of the founder_token account is at least 70% (70% of 700 million = 490 million)
          if (block.number <= startBlock + super.safeMul(uint(one_month), 18) && super.safeSub(balanceOf(_from), _value)<490000000*10**uint(decimals)) return false;
          // 18 months to 24 months The balance of the founder_token account is at least 57.5% (57.5% of 700 million = 402.5 million)
          if (block.number <= startBlock + super.safeMul(uint(one_month), 24) && super.safeSub(balanceOf(_from), _value)<402500000*10**uint(decimals)) return false;
          // 24 months to 30 months The balance of the founder_token account is at least 45% (45% of 700 million = 315 million)
          if (block.number <= startBlock + super.safeMul(uint(one_month), 30) && super.safeSub(balanceOf(_from), _value)<315000000*10**uint(decimals)) return false;
          // 30 months to 36 months The balance of the founder_token account is at least 32.5% (32.5% of 700 million = 227.5 million)
          if (block.number <= startBlock + super.safeMul(uint(one_month), 36) && super.safeSub(balanceOf(_from), _value)<227500000*10**uint(decimals)) return false;
          // 36 months to 42 months. The balance of the founder_token account is at least 20% (20% of the 700 million = 140 million)
          if (block.number <= startBlock + super.safeMul(uint(one_month), 42) && super.safeSub(balanceOf(_from), _value)<140000000*10**uint(decimals)) return false;
          // 42 months to 48 months The balance of the founder_token account is at least 10% (10% of 700 million = 70 million)
          if (block.number <= startBlock + super.safeMul(uint(one_month), 48) && super.safeSub(balanceOf(_from), _value)< 70000000*10**uint(decimals)) return false;
          // 48 months later, no limit
        }

        //Other cases, normal trading
        return super.transferFrom(_from, _to, _value);
    }









    /***********************************************************、、
     *
     * Destroy tokens in your account
     *
     ***********************************************************/
    function burn(uint256 _value) public returns (bool success) {

        // If the status is now "suspended", reject the transaction
        if (halted==true) return false;
        
        // token in poi_token, determine whether the freeze time is poiLockup block time during freeze time
        if (msg.sender==poi_token && block.number <= startBlock + poiLockup) return false;

        // founder_token In the token, can not be destroyed
        if (msg.sender==founder_token) return false;

        
        // If the account is insufficient, enter the number of tokens, terminate the transaction
        if (balances[msg.sender] < _value) return false;
        // If the _value to be destroyed is negative, terminate the transaction
        if (balances[msg.sender] - _value > balances[msg.sender]) return false;


        // In addition to the above, the destruction process is carried out below.

        // The number of account tokens is reduced, use safemath
        balances[msg.sender] = super.safeSub(balances[msg.sender], _value);
        // Since the number of account tokens is destroyed, the total number of tokens will also be reduced, using safemath
        totalSupply = super.safeSub(totalSupply, _value);

        emit Burn(msg.sender, _value); //Call event

        return true;

    }




    /***********************************************************、、
     *
     * Destroy tokens in someone else's account
     *
     ***********************************************************/
    function burnFrom(address _from, uint256 _value) public returns (bool success) {

        // If the status is now "suspended", reject the transaction
        if (halted==true) return false;

        
        // If you want to destroy the token in poi_token,
        // Need to determine if it is within the freeze time (the freeze time is poiLockup block time)
        if (_from==poi_token && block.number <= startBlock + poiLockup) return false;

        // If you want to destroy the token under founder_token, stop trading
        // token in founder_token, cannot be destroyed
        if (_from==founder_token) return false;


        // If the account is insufficient, enter the number of tokens, terminate the transaction
        if (balances[_from] < _value) return false;
        //If the account has insufficient permissions for this msg.sender to enter the number of tokens, terminate the transaction
        if (allowed[_from][msg.sender] < _value) return false;
        // If the _value to be destroyed is negative, terminate the transaction
        if (balances[_from] - _value > balances[_from]) return false;


        // In addition to the above, the destruction process is carried out below.

        // From the account, the number of tokens that msg.sender can control is also reduced, using safemath
        allowed[_from][msg.sender] = super.safeSub(allowed[_from][msg.sender], _value);
        // The number of account tokens is reduced, use safemath
        balances[_from] = super.safeSub(balances[_from], _value);
        // Since the number of account tokens is destroyed, the total number of tokens will also be reduced, using safemath
        totalSupply = super.safeSub(totalSupply, _value);

        emit Burn(_from, _value); //Call event

        return true;
  }
}