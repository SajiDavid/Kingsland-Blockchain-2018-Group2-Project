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
    (async () => {
      // let privateKey = "0x495d5c34c912291807c25d5e8300d20b749f6be44a178d5c50f167d495f3315a";
      //let wallet = createWalletFromPrivateKey(Wallet.privateKey);
      // let toAddress = "0x7725f560672A512e0d6aDFE7a761F0DbD8336aA7";
      // let etherValue = "1";

      let signedTransaction = await signTransaction(
        this.addressWallet,
        address,
        socketActions.FREE_COINS,
        "Giving Away Coin",
        this.walletMain
      );
      console.log("Signed Transaction: \n" + signedTransaction);
      this.io.emit(
        socketActions.ADD_TRANSACTION,
        this.addressWallet,
        address,
        socketActions.FREE_COINS,
        "Giving Away Coin",
        signedTransaction
      );
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
    this.walletMain = ethers.Wallet.createRandom();
    this.privatekey = this.walletMain.privateKey;

    const { address } = this.walletMain;
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
  async newTransaction(transaction, nodeSync) {
    var valid = true;

    if (valid) {
      this.currentTransactions.push(transaction);
      if (this.currentTransactions.length >= this.blocksize) {
        console.info("Starting mining block...");
        const previousBlock = this.lastBlock();
        process.env.BREAK = false;
        //const block = new Block(previousBlock.getIndex() + 1, previousBlock.hashValue(), previousBlock.getProof(), this.currentTransactions);
        var block;
        if (previousBlock.index == 0) {
          // this.mineBlock(block);
          
          //  newBlock.index = this.lastBlock().index + 1;
          //  newBlock.previousBlockHash = this.lastBlock().hash;
          //  newBlock.hash = newBlock.calculateHash();
          this.chain.push(block);
          this.incrementNonce();
          this.io.emit(socketActions.END_MINING, this);


    
    this.chain.push(newBlock);
        } else {
          block = new Block(
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

async function signTransaction(
  sender,
  receiver,
  amount,
  description,
  walletfrom
) {
  let transaction = {
    sender: sender,
    receiver: receiver,
    amount: amount,
    description: description
  };
  return walletfrom.sign(transaction);
}
process.on("unhandledRejection", (reason, promise) => {
  // console.log("Unhandled Rejection at(main):", reason.stack || reason);
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});

module.exports = BlockChain;
