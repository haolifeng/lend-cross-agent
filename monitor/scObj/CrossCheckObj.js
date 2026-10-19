const { ethers } = require('ethers');
class CrossCheckObj {
    constructor(scAddr, nodeUrl, abi){
        this.scAddr = scAddr;
        this.provider = new ethers.providers.JsonRpcProvider(nodeUrl);
        this.scInst = new ethers.Contract(this.scAddr, abi, this.provider);
    }
    async setTokenPairs(wallet, TokenAddrPair){
        let singer = wallet.connect(this.provider);
        let signedWallet = this.scInst.connect(singer);
        let tx = await signedWallet.setTokenPairs(TokenAddrPair);
        let ret = await tx.wait();
        return ret;
    }
    async setTokenManager(wallet, tokenManagerScAddr) {
        let singer = wallet.connect(this.provider);
        let signedWallet = this.scInst.connect(singer);
        let tx = await signedWallet.setTokenManager(tokenManagerScAddr);
        let ret = await tx.wait();
        return ret;
    }

    async getTokenManger(){
        let ret = await this.scInst.TokenManagerAddr();
        return ret;
    }
    async getwanChainID(){
        let wanchainID = await this.scInst.wanChainID();
        return wanchainID.toString();
    }
    async setTokenAddrPairs(wallet, tokenAddrPairs){
        let singer = wallet.connect(this.provider);
        let signedWallet = this.scInst.connect(singer);
        let tx = await signedWallet.setTokenAddrPairs(tokenAddrPairs);
        let ret = await tx.wait();
        return ret;
    }
    async checkTokenAddrPair(underlyingTokenAddr){
        let ctokenAddr = await this.scInst.UnderlyingTokenToCTokenMap(underlyingTokenAddr);
        return ctokenAddr.toString();
    }
    async getUnderlyingToken( tokenPairID){
        let underlyingTokenAddr = await this.scInst.getUnderlyingToken(tokenPairID);
        return underlyingTokenAddr.toString();
    }
    async getCTokenAddrByTokenPair(tokenPairID){
        let ret = await this.scInst.getCTokenAddr(tokenPairID);
        return  ret
    }
    /**
     * Replay guard. FAIL CLOSED: every failure (bad input, RPC error, contract
     * revert) rethrows so the caller must abort the record. Never return
     * undefined here — the caller treats falsy as "not finished yet" and would
     * execute the cross transaction again.
     */
    async checkUniqeID(uniqueID){
        if (typeof uniqueID !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(uniqueID)) {
            throw new Error(`checkUniqeID: invalid uniqueID "${uniqueID}"`);
        }

        let ret;
        try{
            ret = await this.scInst.checkUniqeID(uniqueID);
        }catch (e) {
            const reason = (e && e.message) ? e.message : e;
            throw new Error(`checkUniqeID(${uniqueID}) failed, aborting: ${reason}`);
        }

        if (typeof ret !== 'boolean') {
            throw new Error(`checkUniqeID(${uniqueID}) returned unexpected value: ${ret}`);
        }
        return ret;
    }
    async setUniqueIDFinished(wallet, uniqueID){
        let singer = wallet.connect(this.provider);
        let signedWallet = this.scInst.connect(singer);
        let tx = await signedWallet.setUniqueIDFinished(uniqueID);
        let ret = await tx.wait();
        return ret;
    }
}

module.exports = CrossCheckObj;