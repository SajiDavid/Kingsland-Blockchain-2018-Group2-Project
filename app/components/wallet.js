/****************************************************/
/* Transaction                                      */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Thulaja                            */
/****************************************************/
const crypto = require("crypto");
const ethers = require("ethers");
const fs = require("fs");
path = require('path');

class Wallet{

    constructor() {
        this.id = this.generateRandomID();
        this.privateKey = "";
        this.publicKey = "";
        this.address = "";
        this.seed = [];
        this.timestamp = Date.now();
        
    }
    getAddress(){
        return this.address;
      }
    getPublicKey(){
        return this.publicKey;
    }
    getPrivateKey(){
        return this.privateKey;
    }

    getSeed(){
        return this.seed;
    }

    generateRandomID(){
        return crypto.randomBytes(32).toString("hex");
      }

    createNewWallet(){
       const newWallet =  createRandomWallet();
       const {signingKey} = newWallet;
       this.seed = signingKey.mnemonic;
       this.privateKey = signingKey.privateKey;
       this.publicKey = signingKey.publicKey;
       this.address = signingKey.address;
       saveWallet(newWallet);
    }

  
}

function saveWalletToJSON(wallet,password){
    //console.log("Wallet: "+JSON.stringify(wallet));

    return wallet.encrypt(password).then(console.log);
}
function createRandomWallet(){
    return new ethers.Wallet.createRandom();
}

function   saveWallet(Wallet){
    const filepath = path.join(__dirname, "../util/keystore.key");
    const data = saveWalletToJSON(Wallet,"test");
    
    fs.writeFile(filepath, data, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}
module.exports = Wallet;