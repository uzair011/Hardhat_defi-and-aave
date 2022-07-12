const { getWeth } = require("../scripts/getWeth")
const getNamedAccounts = require("hardhat")

async function main() {
    // this protocol treats like erc20
    await getWeth()
    const { deployer } = await getNamedAccounts()
    // abi, address

    // lending pool address provider : 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
}

async function getLendingPoolAddress() {}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
