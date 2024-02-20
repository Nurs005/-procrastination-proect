// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TestTBNB is ERC20 {
    constructor()ERC20("TBNB", "TBNB"){

    }
    function mint(address account, uint value) public{
      _mint(account, value);  
    }
}