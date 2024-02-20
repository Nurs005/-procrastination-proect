
const {ethers, upgrades} = require("hardhat");


async function main() {

  const app = await ethers.getContractFactory("Todoapp3");
  const apUP = await upgrades.upgradeProxy('0x84acdAfff7c2C4105A4ee1632303CDf1da1d8e2F', app)
  await apUP.waitForDeployment();

  console.log(
    `ToDo-list deployed to: ${apUP.target}`,
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
