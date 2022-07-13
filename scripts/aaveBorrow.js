const { getWeth, DEPOSIT_AMOUNT } = require("../scripts/getWeth")
const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    //* 1. Deposit collateral: ETH or WETH
    // this protocol treats like erc20
    await getWeth()
    const { deployer } = await getNamedAccounts()
    // abi, address
    // lending pool address provider : 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    const lendingPool = await getLendingPool(deployer)
    console.log(`Lending pool address: ${lendingPool.address}`)
    // deposit
    const wethTokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    // approve
    await approveERC20(wethTokenAddress, lendingPool.address, DEPOSIT_AMOUNT, deployer)
    console.log("Depositing...")
    await lendingPool.deposit(wethTokenAddress, DEPOSIT_AMOUNT, deployer, 0)
    console.log("Deposited!")

    // Borrow another asset - get user's data
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)

    // available borrwing eth-- conversion rate for dai
    const daiPrice = await getDAIPrice()
    const amountDAIToBorrow =
        (await availableBorrowsETH.toString()) * 0.95 * (1 / daiPrice.toNumber())
    console.log(`You can borrow ${amountDAIToBorrow} DAI`)

    //* 2. Borrowing asset
}

async function getDAIPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    const DAIprice = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`DAI price: ${DAIprice}`)
    return DAIprice
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)

    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
    console.log(`You have borrowed ${totalDebtETH} worth of ETH. `)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`)
    return { totalDebtETH, availableBorrowsETH }
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

async function approveERC20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const transaction = await erc20Token.approve(spenderAddress, amountToSpend)
    transaction.wait(1)
    console.log(`Approved....!!!!`)
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
