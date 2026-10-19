/**
 * Administrator wallet loader.
 *
 * SECURITY: credentials are NEVER read from files tracked by git.
 * They must come from the process environment:
 *
 *   AGENT_PRIVATE_KEY    32-byte hex private key (takes precedence)
 *   AGENT_MNEMONIC       BIP39 mnemonic (12/24 words)
 *   AGENT_MNEMONIC_PATH  HD derivation path (default m/44'/60'/0'/0/0)
 *
 * The wallet is created lazily and only once, so requiring this module has no
 * side effect and never throws during startup.
 */
const ethers = require('ethers');

const DEFAULT_HD_PATH = "m/44'/60'/0'/0/0";

let cachedWallet = null;

function getLogger() {
    return global.appLogger || console;
}

function loadWallet() {
    const privateKey = (process.env.AGENT_PRIVATE_KEY || '').trim();
    if (privateKey) {
        // throws if the key is malformed -> fail closed
        return new ethers.Wallet(privateKey);
    }

    const mnemonic = (process.env.AGENT_MNEMONIC || '').trim();
    if (!mnemonic) {
        throw new Error(
            'No administrator credential configured. ' +
            'Set AGENT_PRIVATE_KEY or AGENT_MNEMONIC in the process environment. ' +
            'Never put credentials into config/*.js or commit them to git.'
        );
    }

    const path = (process.env.AGENT_MNEMONIC_PATH || DEFAULT_HD_PATH).trim();
    return ethers.Wallet.fromMnemonic(mnemonic, path);
}

function getAdminWallet() {
    if (cachedWallet) {
        return cachedWallet;
    }
    cachedWallet = loadWallet();
    getLogger().info('admin wallet loaded, address: %s', cachedWallet.address);
    return cachedWallet;
}

function getAdminAddress() {
    return getAdminWallet().address;
}

/**
 * Fail-fast startup check. Call this once from the entry point so a missing or
 * malformed credential stops the process loudly instead of surfacing later as a
 * silent signing failure.
 */
function assertAdminWallet() {
    try {
        return getAdminWallet();
    } catch (e) {
        getLogger().error('admin wallet check failed: ', e.message);
        process.exit(1);
    }
}

module.exports = {
    getAdminWallet,
    getAdminAddress,
    assertAdminWallet,
};
