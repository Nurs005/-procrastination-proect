require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require('dotenv').config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks:{
    testnet:{
      url: "https://bsc-testnet.publicnode.com",
      chainId: 97,
      gasPrice: "auto",
      accounts: [process.env.SECRET],
    },
  },
  etherscan:{
    apiKey: process.env.BSC
  }
};
