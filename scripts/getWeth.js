const { ethers, getNamedAccounts } = require("hardhat")

const DEPOSIT_AMOUNT = ethers.utils.parseEther("0.02")

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    // call the 'deposit()' on the weth contract
    // we need:  abi, contract address
    // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 <- contract address - mainnet

    const iWeth = await ethers.getContractAt(
        "IWeth",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        deployer
    )
    // fix the bug
    const transaction = await iWeth.deposit({ value: DEPOSIT_AMOUNT })
    await transaction.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`The balance is: ${wethBalance.toString()} WETH`)
}

module.exports = { getWeth, DEPOSIT_AMOUNT }
