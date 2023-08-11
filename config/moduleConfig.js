const testnet = global.testnet;
const mainModuleConfig = require('./moduleConfig_main');
const testModuleConfig = require('./moduleConfig_test');

module.exports = testnet? testModuleConfig: mainModuleConfig

