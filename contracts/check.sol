// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Check {
    error userCanNotUseSameId(uint);
    function checked(uint id, uint[] memory ids) internal pure{
        for (uint256 i = 0; i < ids.length; i++) {
            if(ids[i] == id){
                revert userCanNotUseSameId(id);
            }
        }
    }
}