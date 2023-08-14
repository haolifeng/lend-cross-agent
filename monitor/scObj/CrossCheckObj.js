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
    async checkUniqeID(uniqueID){
        try{
            console.log('in chrossCheckObj --- uniqueID', uniqueID);
            let ret = await this.scInst.checkUniqeID(uniqueID);
            console.log('in chrossCheckObj --- , ret: ', ret);
            return ret;
        }catch (e) {
            console.log('e: ',e);
        }

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