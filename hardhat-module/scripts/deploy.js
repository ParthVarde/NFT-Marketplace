const hre = require("hardhat");

const main = async () => {
  // Get contract factory
  const NFTMarketplaceFactory = await hre.ethers.getContractFactory("NFTMarketplace");
  // Deploy the contract
  const nftMarketplace = await NFTMarketplaceFactory.deploy();
  
  await nftMarketplace.deployed();

  console.log("Contract deployed to address : ", nftMarketplace.address);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch(error) {
    console.log(error);
    process.exit(1);
  }
}

runMain();