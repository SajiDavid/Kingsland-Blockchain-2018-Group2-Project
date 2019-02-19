/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/

/* Block Chain Class Declaration */

// Load Block Constructor
let Block = require("./block");
let TransactionClass = require("./transaction");
let socketListener = require("./socketlistener");
const ethers = require("ethers");
//let generateProof = require("./pow");
let socketActions = require("../util/constants");
var dateFormat = require("dateformat");
const crypto = require("crypto");
const initialHash = ethers.constants.AddressZero; // "00000000000000000000";
const {
  generateProof,
  isProofValid
} = require("./pow");

class BlockChain {
  constructor(io, blocksize) {
    this.id = this.generateRandomID();
    this.currentTransactions = [];
    this.nodes = [];
    this.io = io;
    this.privatekey = "";
    this.walletMain = "";
    this.addressWallet = this.getWalletAddress();
    this.datenow = Date.now();
    this.timeStamp = dateFormat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT"); // TimeStamp
    this.nonce = 10000;
    this.blocksize = blocksize;
    this.difficulty = socketActions.CURRENT_DIFFICULTY;
    // Create Genesis Block

    this.chain = [this.createGenesisBlock()];
    this.incrementNonce();
  }

  getTimeStamp() {
    return this.timeStamp;
  }

  getPendingTransactionLength() {
    return this.currentTransactions.length;
  }

  generateRandomID() {
    return crypto.randomBytes(16).toString("hex");
  }

  incrementNonce() {
    this.nonce++;
  }
  generateRandomID(){
    return crypto.randomBytes(32).toString("hex");
  }
  // Creation of Genesis Block
  createGenesisBlock() {
    const transaction = new TransactionClass(
      this.generateRandomID(),
      initialHash,
      this.addressWallet,
      40000000,
      "Kings Genesis Block"
    );
    const currentTransactions = [transaction];
    return new Block(0, Date.now(), initialHash, currentTransactions, "0", this.nonce);
  }

  giveAwayFaucetCoin(address, blockchain) {
    /*const transaction = new TransactionClass(
      this.addressWallet,
      address,
      1,
      "Giving Away Coin"
    );
    this.newTransaction(transaction);*/
    //const socketNode = socketListener(this.nodes[0], blockchain);
    (async () => {
      // let privateKey = "0x495d5c34c912291807c25d5e8300d20b749f6be44a178d5c50f167d495f3315a";
      //let wallet = createWalletFromPrivateKey(Wallet.privateKey);
      // let toAddress = "0x7725f560672A512e0d6aDFE7a761F0DbD8336aA7";
      // let etherValue = "1";
      var sender = this.addressWallet;
      let signedTransaction = await signTransaction1(
        sender,
        address,
        socketActions.FREE_COINS,
        "Giving Away Coin",
        this.walletMain
      );

      try {
        //console.log("Signed Transaction: \n" + signedTransaction);
        this.io.emit(
          socketActions.ADD_TRANSACTION,
          this.generateRandomID(),
          this.addressWallet,
          address,
          socketActions.FREE_COINS,
          "Giving Away Coin",
          signedTransaction
        );
      } catch (exp) {
        console.log("Exception " + exp);
      }
    })();
  }

  //Check Faucet coin request greedyness
  validateCoinGreediness(receiver) {
    var valid = true;
    var transaction;
    //Checking in pending transactions
    const pendingLength = this.currentTransactions.length;
    if (pendingLength > 0) {
      for (let i = 0; i < pendingLength; i++) {
        transaction = this.currentTransactions[i];
        var oneHourBefore = new Date();
        var compareDate = new Date(transaction.datenow);
        oneHourBefore.setHours(oneHourBefore.getHours() - 1);
        if (
          transaction.sender == this.addressWallet &&
          transaction.receiver == receiver &&
          compareDate >= oneHourBefore
        ) {
          valid = false;
        }
      }
    }
    return valid;
  }
  // Block Length
  getLength() {
    return this.chain.length;
  }

  getNodeCount() {
    return this.nodes.length;
  }

  checkValidity() {
    for (let i = 1; i < this.chain.length; i++) {
      var j = i - 1; // Previous Block Index
      let currentBlock = new Block();
      currentBlock.nodeSyncedBlock(this.chain[i].index, this.chain[i].timeStamp, this.chain[i].datenow, this.chain[i].previousBlockHash, this.chain[i].hash, this.chain[i].data, this.chain[i].proof, this.chain[i].proofHex, this.chain[i].nonce, this.chain[i].confirmations);
      //currentBlock = this.chain[i];
      let previousBlock = new Block();
      currentBlock.nodeSyncedBlock(this.chain[j].index, this.chain[j].timeStamp, this.chain[j].datenow, this.chain[j].previousBlockHash, this.chain[j].hash, this.chain[j].data, this.chain[j].proof, this.chain[j].proofHex, this.chain[j].nonce, this.chain[j].confirmations);
      //this.chain[i - 1];
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (j != 0) {
        if (currentBlock.previousBlockHash !== previousBlock.hash) {
          return false;
        }
      }
    }
    return true;
  }

  getWalletAddress() {
    this.walletMain = ethers.Wallet.createRandom();
    this.privatekey = this.walletMain.privateKey;

    const {
      address
    } = this.walletMain;
    return address;
  }

  async createWalletAddress(privateKey) {
    this.walletMain = await new ethers.Wallet(privateKey);
    this.privatekey = this.walletMain.privateKey;
    const {
      address
    } = this.walletMain;
    console.log("New address " + address);
    return address;
  }

  // Adding Node to Chain
  addNode(socketnode) {
    this.nodes.push(socketnode); // Adding to list

    //this.io.emit("myaddress", node);

    console.log("Nodes:" + this.nodes);
  }

  address() {
    this.io.emit("myaddress", "test");
  }

  // Latest Block()
  lastBlock() {
    return this.chain[this.chain.length - 1]; // First Block is considered 0th postion so we use
  }

  // Adding New Block to Chain
  addBlock(newBlock) {
    newBlock.index = this.lastBlock().index + 1;
    newBlock.previousBlockHash = this.lastBlock().hash;
    newBlock.hash = newBlock.calculateHash();

    this.chain.push(newBlock);
  }

  mineBlock(block, chain) {
    this.addBlock(block);
    console.log("Mined Successfully");
    this.incrementNonce();
    const socket = this.nodes[0];
    // socketListener(chain.io,chain);
    (async () => {
      try {
        this.io.emit(socketActions.END_MINING, chain.chain);
      } catch (exp) {
        console.log("Exception at Mining Emit " + exp);
      }
    })();
  }
  async newTransaction(transaction, chain) {
    var valid = true;

    if (valid) {
      this.currentTransactions.push(transaction);
      if (this.currentTransactions.length >= this.blocksize) {
        console.info("Starting mining block...");
        var previousBlock = this.lastBlock();
        process.env.BREAK = false;
        // index, previousBlockHash, data, proof, nonce)
        let block = new Block(
          previousBlock.index + 1,
          previousBlock.datenow,
          previousBlock.hashValue,
          this.currentTransactions,
          previousBlock.proof,
          this.nonce
        );
        //var block;
        if (previousBlock.index == 0) {
          // this.mineBlock(block);

          //  newBlock.index = this.lastBlock().index + 1;
          //  newBlock.previousBlockHash = this.lastBlock().hash;
          //  newBlock.hash = newBlock.calculateHash();
          const {
            proof,
            proofHex,
            dontMine
          } = await generateProof(
            block.proof
          );
          block.setProof(proof, proofHex);
          this.currentTransactions = [];
          if (dontMine !== "true") {
            this.mineBlock(block, chain);
          }
          // this.chain.push(block);
          // this.incrementNonce();
          // this.io.emit(socketActions.END_MINING, this);
          //this.chain.push(newBlock);
        } else {
          block = new Block(
            previousBlock.index + 1,
          previousBlock.datenow,
          previousBlock.hashValue,
          this.currentTransactions,
          previousBlock.proof,
          this.nonce
          );

          const {
            proof,
            proofHex,
            dontMine
          } = await generateProof(
            previousBlock.proof
          );
          block.setProof(proof, proofHex);
          this.currentTransactions = [];
          if (dontMine !== "true") {
            this.mineBlock(block, chain);
          }
        }
      }
    }
  }

  getAddressBalance(address) {
    var balance = 0;
    if (address != "") {
      for (let i = 0; i < this.chain.length; i++) {
        const block = this.chain[i];
        if (block == undefined) continue;
        const length = block.data.length;
        for (let j = 0; j < length; j++) {
          var transaction = block.data[j];
          //console.log("Transaction : " +JSON.stringify(transaction));
          if (block.data[j].sender.match(address))
            balance = balance - block.data[j].amount;

          if (block.data[j].receiver.match(address))
            balance = balance + block.data[j].amount;
        }
      }
    }
    return balance;
  }

  getBlockData(number) {
    var block;
    var findFlag = false;
    for (let i = 0; i < this.chain.length; i++) {
      block = this.chain[i];
      const length = block.data.length;
      if (block.index == number) {
        findFlag = true;
        break;
      }
      // for (let j = 0; j < length; j++) {
      //   var transaction = block.data[j];
      //   //console.log("Transaction : " +JSON.stringify(transaction));
      //   if (block.data[j].sender.match(address))
      //       balance = balance - block.data[j].amount;

      //   if (block.data[j].receiver.match(address))
      //     balance = balance + block.data[j].amount;
      // }
    }

    if (!findFlag) {
      block = "";
    }

    return block;
  }

  getTransactionBlock(id) {
    var block;
    var transaction;
    var findFlag = false;
    for (let i = 0; i < this.chain.length; i++) {
      block = this.chain[i];
      const length = block.data.length;
      for (let j = 0; j < length; j++) {
        transaction = block.data[j];
        if (transaction.id == id) {
          findFlag = true;
          break;
        }
      }
    }

    if (!findFlag) {
      transaction = "";
    }

    return transaction;
  }
}

async function signTransaction1(
  sender,
  receiver,
  amount,
  description,
  walletfrom
) {
  let transaction = {
    from: sender,
    to: receiver,
    amount: amount,
    description: description
  };
  return true; //walletfrom.sign(transaction);
}
process.on("unhandledRejection", (reason, promise) => {
  //console.log("Unhandled Rejection at(blockchain):", reason.stack || reason);
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});

module.exports = BlockChain;