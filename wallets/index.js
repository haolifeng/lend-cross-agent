const config = require('../config/moduleConfig');
const ethers  = require('ethers');
const words = config.wallet.words;


let admin = ethers.Wallet.fromMnemonic(words);


console.log('admin.address', admin.address)

module.exports = admin;

