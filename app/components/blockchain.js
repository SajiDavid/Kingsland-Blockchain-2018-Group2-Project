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
const { generateProof, isProofValid } = require("./pow");

class BlockChain {
  constructor(io, blocksize) {
    this.id = this.generateRandomID();
    this.currentTransactions = [];
    this.nodes = [];
    this.io = io;
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

  generateRandomID() {
    return crypto.randomBytes(16).toString("hex");
  }

  incrementNonce() {
    this.nonce++;
  }

  // Creation of Genesis Block
  createGenesisBlock() {
    const transaction = new TransactionClass(
      initialHash,
      this.addressWallet,
      40000000,
      "Kings Genesis Block"
    );
    const currentTransactions = [transaction];
    return new Block(0, initialHash, currentTransactions, "0", this.nonce);
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

    this.io.emit(
      socketActions.ADD_TRANSACTION,
      this.addressWallet,
      address,
      socketActions.FREE_COINS,
      "Giving Away Coin"
    );
  }

  //Check Faucet coin request greedyness
  validateCoinGreediness(receiver)
  {

    var valid = true;
    var transaction;
    //Checking in pending transactions
    const pendingLength = this.currentTransactions.length;
    if(pendingLength>0)
    {
      for (let i = 0; i < pendingLength; i++) {
       transaction = this.currentTransactions[i];
        var oneHourBefore = new Date();
        var compareDate = new Date(transaction.datenow);
        oneHourBefore.setHours(oneHourBefore.getHours() - 1);
         if (transaction.sender == this.addressWallet && 
             transaction.receiver == receiver && 
             compareDate >= oneHourBefore) {
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

  checkValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousBlockHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getWalletAddress() {
    var wallet = ethers.Wallet.createRandom();

    const { address } = wallet;
    return address;
  }

  // Adding Node to Chain
  addNode(socketnode, chain) {
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

  mineBlock(block) {
    this.addBlock(block);
    console.log("Mined Successfully");
    this.incrementNonce();
    this.io.emit(socketActions.END_MINING, this);
  }
  async newTransaction(transaction) {
    this.currentTransactions.push(transaction);
    if (this.currentTransactions.length === this.blocksize) {
      console.info("Starting mining block...");
      const previousBlock = this.lastBlock();
      process.env.BREAK = false;
      //const block = new Block(previousBlock.getIndex() + 1, previousBlock.hashValue(), previousBlock.getProof(), this.currentTransactions);
      const block = new Block(
        previousBlock.getIndex() + 1,
        previousBlock.hashValue(),
        this.currentTransactions,
        previousBlock.getProof(),
        this.nonce
      );
      const { proof, proofHex, dontMine } = await generateProof(
        previousBlock.getProof()
      );
      block.setProof(proof, proofHex);
      this.currentTransactions = [];
      if (dontMine !== "true") {
        this.mineBlock(block);
      }
    }
  }

  getAddressBalance(address) {
    var balance = 0;
    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];
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

module.exports = BlockChain;
