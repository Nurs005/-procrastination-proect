// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "./check.sol";

 contract Todoapp2 is Initializable, ERC20Upgradeable{
    IERC20 public tbnb;
    address public owner;
    
    using Check for uint[];
    using Check for uint;

    modifier onlyOwner(){
        require(msg.sender == owner, "You are not owner");
        _;
    }

    // function initialize( address token) initializer public{
    //     tbnb = IERC20(token);
    //     owner = msg.sender;
    //     __ERC20_init("Anti Procrastination", "ANTI");
    // }

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
     tbnb.transferFrom(msg.sender, address(this), ammount);
     _mint(msg.sender, ammount);
     balance[msg.sender] += ammount;
     emit Exchanged(msg.sender, ammount);
    }
    function withdraw() external{
        uint amount = balance[msg.sender];
        require(amount > 0, "Yor balance is zero");
        _burn(msg.sender, amount);
        tbnb.transfer(msg.sender, amount -= feeForWithdraw(amount));
        tbnb.transfer(owner, feeForWithdraw(amount));
        balance[msg.sender] = 0;
        emit Withdraw(msg.sender, amount);
    }

    function feeForWithdraw(uint ammount) public pure returns(uint){
        return (ammount * 30 / 100);
    }
    function addTaskInMap(uint id, uint award) public {
        require(balance[msg.sender] > 0, "You doesn't have deposit tokens");
        require(balanceOf(msg.sender) >= award, "You doesn't have that much tokens");
        Task storage newTask = listTask[msg.sender];
        require(award <= balance[msg.sender] /2, "You can't set awart above than half your balance");
        //добавить проверку ид
        id.checked(newTask.id);
        newTask.id.push(id); 
        newTask.award.push(award);
        newTask.trueOrnot.push(false);
        newTask.checkTime = block.timestamp + 1 days;
        listTask[msg.sender] = newTask;
        _burn(msg.sender, award);
    }
    function awarded(uint id) public {
        Task storage newTask = listTask[msg.sender];
        require(!newTask.trueOrnot[id], "This task alredy done");
        _burn(msg.sender, newTask.award[id]);
        tbnb.transfer(msg.sender, newTask.award[id] -= feeForAward(newTask.award[id]));
        tbnb.transfer(owner, feeForAward(newTask.award[id]));
        newTask.trueOrnot[id] = true;
        listTask[msg.sender] = newTask;
    }

    function feeForAward(uint amount) public pure returns(uint){
        return amount / 10000;
    }
    function checkTask (uint id) public returns(bool){
        Task storage newTask = listTask[msg.sender];
        if(newTask.checkTime < block.timestamp){
            newTask.trueOrnot[id] = true;
            _burn(msg.sender, newTask.award[id]);
            tbnb.transfer(msg.sender, newTask.award[id] -= feeForWithdraw(newTask.award[id]));
            tbnb.transfer(owner, feeForWithdraw(newTask.award[id]));
            return true;
        }else{
            return false;
        }
    }

    function setToken(address token) external onlyOwner{
        tbnb = IERC20(token);
    }
}