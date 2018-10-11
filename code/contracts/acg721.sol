pragma solidity ^0.4.22;

import "helpers/SafeMath.sol";

/**
 * @title StandardERC721
 *
 * A crude, simple single file implementation of ERC721 standard
 * @dev See https://github.com/ethereum/eips/issues/721
 *
 */
contract StandardERC721 {
    // SafeMath methods will be avaiable for the type "uint256"
    using SafeMath for uint256;

    mapping(uint => address) internal tokenIdToOwner;
    mapping(address => uint[]) internal listOfOwnerTokens;
    mapping(uint => uint) internal tokenIndexInOwnerArray;
    // Approval mapping
    mapping(uint => address) internal approvedAddressToTransferTokenId;

    event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    modifier onlyExtantToken(uint _tokenId) {
        require(ownerOf(_tokenId) != address(0), "Token doesn't exist");
        _;
    }

    function balanceOf(address _owner) public view returns (uint _balance) {
        return listOfOwnerTokens[_owner].length;
    }
    // @dev Returns the address currently marked as the owner of _tokenID. 
    function ownerOf(uint256 _tokenId) public view returns (address _owner)
    {
        return tokenIdToOwner[_tokenId];
    }
    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT. 
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function transferFrom(address _from, address _to, uint256 _tokenId) public onlyExtantToken(_tokenId) {
        require(approvedAddressToTransferTokenId[_tokenId] == msg.sender, "Only approved address is able of transfering the token");
        require(ownerOf(_tokenId) == _from, "Sender must be the owner of the token");
        require(_to != address(0), "Receiver address should not be zero");

        _clearApprovalAndTransfer(_from, _to, _tokenId);

        emit Approval(_from, 0, _tokenId);
        emit Transfer(_from, _to, _tokenId);
    }

    // @dev Grants approval for address _to to take possession of the NFT with ID _tokenId.
    function approve(address _to, uint _tokenId) public onlyExtantToken(_tokenId)
    {
        require(msg.sender == ownerOf(_tokenId), "Sender must be the owner of the token");
        require(msg.sender != _to, "Sender and receiver should be different");

        if (approvedAddressToTransferTokenId[_tokenId] != address(0) || _to != address(0)) {
            approvedAddressToTransferTokenId[_tokenId] = _to;
            emit Approval(msg.sender, _to, _tokenId);
        }
    }

    function _clearApprovalAndTransfer(address _from, address _to, uint _tokenId) internal
    {
        _clearTokenApproval(_tokenId);
        _removeTokenFromOwnersList(_from, _tokenId);
        _setTokenOwner(_tokenId, _to);
        _addTokenToOwnersList(_to, _tokenId);
    }

    function _clearTokenApproval(uint _tokenId) internal
    {
        approvedAddressToTransferTokenId[_tokenId] = address(0);
    }

    function _removeTokenFromOwnersList(address _owner, uint _tokenId) internal
    {
        uint length = listOfOwnerTokens[_owner].length; // length of owner tokens
        uint index = tokenIndexInOwnerArray[_tokenId]; // index of token in owner array
        uint swapToken = listOfOwnerTokens[_owner][length - 1]; // last token in array

        listOfOwnerTokens[_owner][index] = swapToken; // last token pushed to the place of the one that was transfered
        tokenIndexInOwnerArray[swapToken] = index; // update the index of the token we moved

        delete listOfOwnerTokens[_owner][length - 1]; // remove the case we emptied
        listOfOwnerTokens[_owner].length--; // shorten the array's length
    }

    function _setTokenOwner(uint _tokenId, address _owner) internal
    {
        tokenIdToOwner[_tokenId] = _owner;
    }

    function _addTokenToOwnersList(address _owner, uint _tokenId) internal
    {
        listOfOwnerTokens[_owner].push(_tokenId);
        tokenIndexInOwnerArray[_tokenId] = listOfOwnerTokens[_owner].length - 1;
    }
}

/**
 * @title ACG 721 Token
 * @dev ERC721 to support ArtChainGlobal system
 *
 */
contract ACG721 is StandardERC721 {

    uint256 public totalSupply;
    
    // Metadata infos
    mapping(uint => string) public referencedMetadata;

    event Minted(address indexed _to, uint256 indexed _tokenId);

    constructor() public {
    }

    modifier onlyNonexistentToken(uint _tokenId) {
        require(tokenIdToOwner[_tokenId] == address(0), "Token must be not extant");
        _;
    }

    // @dev Anybody can create a token and give it to an owner
    function mint(address _owner, uint256 _tokenId) public onlyNonexistentToken (_tokenId)
    {
        _setTokenOwner(_tokenId, _owner);
        _addTokenToOwnersList(_owner, _tokenId);

        totalSupply = totalSupply.add(1);
        emit Minted(_owner, _tokenId);
    }

    // @dev Anybody can create a token and give it to an owner
    // @notice only one of these functions(Mint, mintWithMetadata) should be used depending on the use case
    function mintWithMetadata(address _owner, uint256 _tokenId, string _metadata) public onlyNonexistentToken (_tokenId)
    {
        _setTokenOwner(_tokenId, _owner);
        _addTokenToOwnersList(_owner, _tokenId);

        totalSupply = totalSupply.add(1);

        _insertTokenMetadata(_tokenId, _metadata);
        emit Minted(_owner, _tokenId);
    }

	// @dev Assigns the ownership of the NFT with ID _tokenId to _to
    function transfer(address _to, uint _tokenId) public onlyExtantToken (_tokenId)
    {
        require(ownerOf(_tokenId) == msg.sender, "Sender should be the owner of the token");
        require(_to != address(0), "Receiver address should not be zero"); 

        _clearApprovalAndTransfer(msg.sender, _to, _tokenId);

        emit Transfer(msg.sender, _to, _tokenId);
    }

    function _insertTokenMetadata(uint _tokenId, string _metadata) internal
    {
        referencedMetadata[_tokenId] = _metadata;
    }
}