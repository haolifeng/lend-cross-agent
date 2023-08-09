const ethers  = require('ethers');
const words = ""


let admin = ethers.Wallet.fromMnemonic(words);


console.log('admin.address', admin.address)

module.exports = admin;

