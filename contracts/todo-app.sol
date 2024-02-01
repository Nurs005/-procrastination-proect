// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

 contract Todoapp is Initializable{
    IERC20 anti;
    IERC20 tbnb;
    address owner;
    function initialize(address token1, address token2) initializer public{
        anti = IERC20(token1);
        tbnb = IERC20(token2);
        owner = msg.sender;
    }

    struct Task{
        uint [] id;
        uint [] award;
        bool[] trueOrnot;
        uint checkTime;
    }

    mapping (address => Task) listTask;
    mapping(address=> uint) public balance;

    event Exchanged(address indexed initiator, uint indexed amount);
    event Withdraw(address indexed initiator, uint indexed amount);

    function exchange(uint ammount) external{
     require(ammount > 0, "You can't send zero tokens");
     tbnb.transferFrom(msg.sender, address(this), ammount - feeForWithdraw(ammount));
    //  anti.mint(msg.sender, ammount);
     balance[msg.sender] += ammount;
     emit Exchanged(msg.sender, ammount);
    }
    function withdraw() external{
        uint amount = balance[msg.sender];
        require(amount > 0, "Yor balance is zero");
        tbnb.transfer(msg.sender, amount - feeForWithdraw(amount));
        tbnb.transfer(msg.sender, feeForAward(amount));
        // anti.burn(msg.sender, amount);
        balance[msg.sender] = 0;
        emit Withdraw(msg.sender, amount);
    }

    function feeForWithdraw(uint ammount) internal pure returns(uint){
        return (ammount * 30 / 100);
    }
    function addTaskInMap(uint id, uint award) public {
        Task storage newTask = listTask[msg.sender];
        require(award <= balance[msg.sender] /2);
        newTask.id.push(id); 
        newTask.award.push(award);
        newTask.trueOrnot.push(false);
        newTask.checkTime = block.timestamp + 1 days;
        listTask[msg.sender] = newTask;
    }
    function awarded(uint id) public {
        Task storage newTask = listTask[msg.sender];
        require(!newTask.trueOrnot[id], "This task is done");
        tbnb.transfer(msg.sender, newTask.award[id] - feeForAward(newTask.award[id]));
        // anti.burn(msg.sender, newTask.award[id]);
        tbnb.transfer(owner, feeForAward(newTask.award[id]));
        newTask.trueOrnot[id] = true;
        listTask[msg.sender] = newTask;
    }

    function feeForAward(uint amount) internal pure returns(uint){
        return amount / 10000;
    }
    function checkTask (uint id) public returns(bool){
        Task storage newTask = listTask[msg.sender];
        if(newTask.checkTime < block.timestamp){
            newTask.trueOrnot[id] = true;
            tbnb.transfer(msg.sender, newTask.award[id] - feeForWithdraw(newTask.award[id]));
            // anti.burn(msg.sender, newTask.award[id]);
            tbnb.transfer(owner, feeForWithdraw(newTask.award[id]));
            return true;
        }else{
            return false;
        }
    }
}