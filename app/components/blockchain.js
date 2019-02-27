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
const EthCrypto = require("eth-crypto");
let socketActions = require("../util/constants");
const successlog = require('../util/logger').successlog;
var dateFormat = require("dateformat");
const crypto = require("crypto");
const initialHash = ethers.constants.AddressZero; // "00000000000000000000";
const {
  generateProof,
  isProofValid
} = require("./pow");
let axios = require("axios");

class BlockChain {
  constructor(io, blocksize) {
    this.id = this.generateRandomChainID();
    this.nodeid = this.generateRandomChainID();
    this.port = "";
    this.url = "";
    this.currentTransactions = []
    this.confirmedTransactions = [];
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

  getConfirmedTransactionLength() {
    return this.confirmedTransactions.length;
  }
  getPendingTransactionLength() {
    return this.currentTransactions.length;
  }
  /*
    generateRandomID() {
      return crypto.randomBytes(16);//.toString("hex");
    }
  */
  incrementNonce() {
    this.nonce++;
  }
  generateRandomChainID() {
    return crypto.randomBytes(8).toString("hex");
  }
  generateRandomTransactionID() {
    return crypto.randomBytes(16).toString("hex");
  }
  // Creation of Genesis Block
  createGenesisBlock() {
    const transaction = new TransactionClass(
      this.generateRandomTransactionID(),
      initialHash,
      this.addressWallet,
      40000000,
      "0",
      "Kings Genesis Block"
    );
    const currentTransactions = [transaction];
    return new Block(0, Date.now(), initialHash, currentTransactions, "0", this.nonce);
  }

  giveAwayFaucetCoin(address, blockchain) {

    (async () => {

      var sender = this.addressWallet;
      let signedTransaction = await signTransaction(
        sender,
        address,
        socketActions.FREE_COINS, // Amount
        this.nonce,
        this.chainId,
        this.walletMain
      );
      successLog(this.port, "Signed GiveAway Transaction Coins: " + socketActions.FREE_COINS);

      try {

        //console.log("Signed Transaction: \n" + signedTransaction);
        this.io.emit(
          socketActions.ADD_TRANSACTION,
          this.generateRandomTransactionID(),
          this.addressWallet,
          address,
          socketActions.FREE_COINS,
          "0",
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
      let previousBlock = new Block();
      previousBlock.nodeSyncedBlock(this.chain[j].index, this.chain[j].timeStamp, this.chain[j].datenow, this.chain[j].previousBlockHash, this.chain[j].hash, this.chain[j].data, this.chain[j].proof, this.chain[j].proofHex, this.chain[j].nonce, this.chain[j].confirmations);
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
  addPeerNode(node) {

    const hostname = node.split(":");
    const own_hostname = `http://localhost:${this.port}`;
    axios.post(`${own_hostname}/newpeer`, {
      hostname: hostname[0],
      port: hostname[1]
    });

  }
  // Adding Node to Chain
  addNode(socketnode, host, port) {
    const address = host + ":" + port;
    this.nodes.push(address); // Adding to list
    console.log(`${address} is added`);

  }

  addNodeHost(hostname) {

    this.nodes.push(hostname); // Adding to list
    console.log(`${hostname} is added`);

  }
  // Adding Node to Chain
  removeNode(hostname) {

    var index = this.nodes.indexOf(hostname); // Adding to list
    if (index !== -1) {
      this.nodes.splice(index, 1);
    }
    console.log(`${hostname} is removed`);
  }
  // Validating Node already added
  validateNode(host, port) {
    var valid = true;
    const address = host + ":" + port;

    valid = this.nodes.includes(address);

    if (valid)
      valid = false;
    else
      valid = true;

    return valid;
  }

  validateNodeHost(hostname) {
    var valid = true;


    valid = this.nodes.includes(hostname);

    if (valid)
      valid = false;
    else
      valid = true;

    return valid;
  }
  address() {
    this.io.emit("myaddress", "test");
  }

  // Latest Block()
  lastBlock() {
    return this.chain[this.chain.length - 1]; // First Block is considered 0th postion so we use
  }

  // Adding New Block to Chain
  addBlock(inBlock) {
    var newBlock = new Block(inBlock.index, inBlock.datenow, inBlock.previousBlockHash, inBlock.data, inBlock.proof, inBlock.nonce);
    newBlock.setProof(inBlock.proof, inBlock.proofHex);
    newBlock.index = this.lastBlock().index + 1;
    newBlock.previousBlockHash = this.lastBlock().hash;
    newBlock.hash = newBlock.calculateHash();

    this.chain.push(newBlock);
  }

  mineBlock(block, chain) {
    successLog(this.port, "Mined Successfully");

    // // Update Confirmed Transactions
    // var tx_length = block.data.length;
    // for (var i = 0; i < tx_length; i++) {
    //   const tx_id = block.data[i].id;
    //   this.confirmedTransactions.push(tx_id);

    //   block.data[i].minedBlock = block.index;
    //   // Removing Pending Transaction which is confirmed
    //    this.removePendingTransaction(this.port,this.currentTransactions,tx_id);
    //   /*if (this.currentTransactions[i].id == block.data[i].id);
    //   this.currentTransactions.splice(i, 1);
    //   */
    // }

  // Adding Block to chain
  this.addBlock(block);

  (async () => {
    try {
      this.io.emit(socketActions.END_MINING, this.chain);
    } catch (exp) {
      errorLog(this.port, "Exception at Mining Emit " + exp);
    }
  })();
}
removePendingTransaction(port,currentTransactions,tx_id){

  try {
    if (currentTransactions != undefined) {
      var val = tx_id;
      var index = currentTransactions.findIndex(function (item, i) {
        return item.id === val
      });
      currentTransactions.splice(index, 1);
    }
  } catch (exp) {
    errorLog(port, "Error deleting pending transaction count")
  }
}
async newTransaction(transaction, chain) {
  var valid = true;

  if (valid) {
    this.currentTransactions.push(transaction);
    if (this.currentTransactions.length >= this.blocksize) {
      successLog(this.port, "Starting mining block...");
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
        const {
          proof,
          proofHex,
          dontMine
        } = await generateProof(
          block.proof
        );
        block.setProof(proof, proofHex);
        successLog(this.port, `Puzzle solved with Proof${proof} and ${proofHex}`);

        this.currentTransactions = [];
        if (dontMine !== "true") {
          this.mineBlock(block, chain);
        }

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
        successLog(this.port, `Puzzle solved with Proof${proof} and ${proofHex}`);
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

  }

  if (!findFlag) {
    block = "";
  }

  return block;
}

getBlockByTransaction(blocksearch) {
  var block;
  var transaction;
  var blocknumber = "";
  for (let i = 0; i < this.chain.length; i++) {
    block = this.chain[i];
    const length = block.data.length;
    for (let j = 0; j < length; j++) {
      transaction = block.data[j];
      if (transaction.id == blocksearch) {
        blocknumber = transaction.minedBlock;
        break;
      }
    }
  }

  return blocknumber;
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

async verifyTransaction(
  sender,
  receiver,
  amount,
  nonce,
  chainid,
  signature
) {


  let transaction_verify = {
    to: receiver,
    value: ethers.utils.parseEther(amount.toString() || "0"),
    nonce: nonce,
    chainId: chainid,
    data: "0x"
  };

  let messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(transaction_verify)));
  let messageHashBytes = ethers.utils.arrayify(messageHash)
  const signed_address = ethers.utils.recoverAddress(messageHashBytes, signature);
  return signed_address;
}

}

async function signTransaction(
  sender,
  receiver,
  amount,
  nonce,
  chainid,
  walletfrom
) {
  let transaction = {
    to: receiver,
    value: ethers.utils.parseEther(amount.toString() || "0"),
    nonce: nonce,
    chainId: chainid,
    data: "0x"
  };
  let messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(transaction)));
  let sign = EthCrypto.sign(walletfrom.privateKey, messageHash);
  return sign;
}




function successLog(port, message) {
  successlog.info(` ${port}: ${message}`);
}

function errorLog(port, message) {
  successlog.error(`${port}: ${message}`);
}
process.on("unhandledRejection", (reason, promise) => {

});

module.exports = BlockChain;