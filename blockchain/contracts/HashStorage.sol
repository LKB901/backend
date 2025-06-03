// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";

contract HashStorage is Ownable {
    mapping(bytes32=>bool) private hashes;
    uint private hashNum=0;
    constructor() Ownable(msg.sender) {
        // your constructor code
    }
    function addHashes(bytes32[] calldata _hashes) public onlyOwner {
        for(uint i=0; i< _hashes.length; i++){
            hashes[_hashes[i]] = true;
            hashNum++;
        }
    }

    function getHashCount() public view returns (uint){
        return hashNum;
    }

    function getHashExist(bytes32[] calldata _hashes)  public view returns (bool[] memory){
        bool[] memory result = new bool[](_hashes.length);
        for(uint i=0; i < _hashes.length; i++){
            result[i] = hashes[_hashes[i]];
        }
        return result;
    }
}
