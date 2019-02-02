/****************************************************/
/* Transaction                                      */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Thulaja                            */
/****************************************************/
const crypto = require("crypto");
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
var dateFormat = require('dateformat');

class Wallet {
  constructor() {
    this.id = this.generateRandomID();
    this.privateKey = "";
    this.publicKey = "";
    this.address = "";
    this.seed = [];
    this.timestamp = dateFormat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT");  ;
    this.wallet = "";
  }

  initializeWallet() {
    this.privateKey = "";
    this.publicKey = "";
    this.address = "";
    this.seed = [];
  }
  getAddress() {
    return this.address;
  }
  getPublicKey() {
    return this.publicKey;
  }
  getPrivateKey() {
    return this.privateKey;
  }

  getSeed() {
    return this.seed;
  }

  generateRandomID() {
    return crypto.randomBytes(32).toString("hex");
  }

  async createNewWallet() {
    const newWallet = createRandomWallet();
    const { signingKey } = newWallet;
    this.seed = signingKey.mnemonic;
    this.privateKey = signingKey.privateKey;
    this.publicKey = signingKey.publicKey;
    this.address = signingKey.address;
    this.data = ""
    await saveWallet(newWallet);
    this.wallet = newWallet;

  }

  async createFromPrivateKey(privateKey) {
    let newWallet;
    try {
      newWallet = new ethers.Wallet(privateKey);
      this.address = newWallet.address;
      this.privateKey = newWallet.privateKey;
      this.publicKey = newWallet.publicKey;
      await saveWallet(newWallet);
      this.wallet = newWallet;
    } catch (err) {
      console.log("Error : " + err);
    }
  }

  getWalletFileName() {
    return path.join(__dirname, "../util/Wallet_keystore.txt");
  }

   async getSignTransation(sender,receiver,amount,description){

      const signed = await signTransaction(sender,receiver,amount,description,this.Wallet);
    
    //let signedTransaction =  signTransaction(sender,receiver,amount,description,this.Wallet);

    return  signed;
  }
}
 async function signTransaction(sender,receiver,amount,description,walletfrom){
  let transaction = {
    sender:sender,
    receiver:receiver,
    amount:amount,
    description:description
  };
  return walletfrom.sign(transaction);

}
async function saveWalletToJSON(wallet, password) {
  //console.log("Wallet: "+JSON.stringify(wallet));

  return await wallet.encrypt(password).then(this.data);
}
function createRandomWallet() {
  return new ethers.Wallet.createRandom();
}

async function streamfile(filepath,data){
    var stream = fs.createWriteStream(filepath);
    stream.once('open', function () {
        stream.write(data);
        stream.end();
    });
}

async function saveWallet(Wallet) {
  const filepath = path.join(__dirname, "../util/Wallet_keystore.txt");
  const data = await saveWalletToJSON(Wallet, "test");

  await streamfile(filepath,data);
 

  /*await fs.write(filepath, data, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });*/
  
//  const writeFile = promisify(fs.writeFile);
//  mainFile().catch(error => console.error(error));

//  async function mainFile() {
//     await writeFile(filepath,
//        data);

//     console.info("file created successfully with promisify and async/await!");
// }

}





module.exports = Wallet;
