const { ethers } = require('ethers')

class BaseTxParseObj {
    constructor(scAddr, nodeUrl, abi){
        this.scAddr = scAddr;
        this.provider = new ethers.providers.JsonRpcProvider(nodeUrl);
        this.scInst = new ethers.Contract(this.scAddr, abi, this.provider);
    }
    async setDependsContractAddr( wallet, _crossCheckAddr,  _crossLendRepayAddr,  _crossLendMintAddr){
        let singer = wallet.connect(this.provider);
        let signedWallet = this.scInst.connect(singer);
        let tx = await signedWallet.setDependsContractAddr(_crossCheckAddr,  _crossLendRepayAddr,  _crossLendMintAddr);
        let ret = await tx.wait();
        return ret;
    }
    async setDependCrossCheckAddr(wallet,  _crossCheckAddr)  {
        let singer = wallet.connect(this.provider);
        let signedWallet = this.scInst.connect(singer);
        let tx = await signedWallet.setDependCrossCheckAddr(_crossCheckAddr );
        let ret = await tx.wait();
        return ret;
    }
    async setDependLendRepayAddr(wallet,  _crossLendRepayAddr){
        let singer = wallet.connect(this.provider);
        let signedWallet = this.scInst.connect(singer);
        let tx = await signedWallet.setDependLendRepayAddr(  _crossLendRepayAddr);
        let ret = await tx.wait();
        return ret;
    }
    async setDependLendMintAddr(wallet,  _crossLendMintAddr)  {
        let singer = wallet.connect(this.provider);
        let signedWallet = this.scInst.connect(singer);
        let tx = await signedWallet.setDependLendMintAddr( _crossLendMintAddr);
        let ret = await tx.wait();
        return ret;
    }
    async crossCheckAddr(){
        let ret = await this.scInst.crossCheckAddr();
        return ret;
    }
    async crossLendRepayAddr(){
        let ret = await this.scInst.crossLendRepayAddr();
        return ret;
    }
    async crossLendMintAddr(){
        let ret = await this.scInst.crossLendMintAddr();
        return ret;
    }
    async userLock_decodeInput(data){
        let ret = await this.scInst.userLock_decodeInput(data);
        return ret;
    }

    async userBurn_decodeInput(data){
        let ret = await this.scInst.userBurn_decodeInput(data);
        return ret;
    }
    async bytesToAddress(crossLendToken){
        let ret = await this.scInst.bytesToAddress(crossLendToken);
        return ret;
    }
    async getCTokenAddr(tokenPairID){
        let ret = await this.scInst.getCTokenAddr(tokenPairID);
        return ret;
    }
}
module.exports = BaseTxParseObj;