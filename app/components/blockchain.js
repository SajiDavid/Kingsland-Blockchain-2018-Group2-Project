/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/

/* Block Chain Class Declaration */

// Load Block Constructor
let Block = require("./block");
let generateProof = require("./pow");
let socketActions = require('../util/constants');

class BlockChain {
  constructor(io) {
    this.chain = [this.createGenesisBlock()];
    this.currentTransactions = [];
    this.nodes = [];
    this.io = io;
  }

  // Creation of Genesis Block
  createGenesisBlock() {
    return new Block(0, Date.now(), "KingsLand Genesis Block", "0");
  }

  // Latest Block()
  lastBlock() {
    return this.chain[this.chain.length - 1]; // First Block is considered 0th postion so we use
  }

  // Block Length
  getLength(){
      return this.chain.length;
  }

  // Adding New Block to Chain
  addBlock(newBlock) {
    newBlock.index = this.lastBlock().index + 1;
    newBlock.previousHash = this.lastBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  mineBlock(block)
  {
    this.chain.push(block);
    console.log('Mined Successfully');
    this.io.emit(socketActions.END_MINING, this.toArray());
  }
  

  checkValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  // Adding Node to Chain
  addNode(node) {
    this.nodes.push(node); // Adding to list
  }

  async newTransaction(transaction) {
    this.currentTransactions.push(transaction);
    if (this.currentTransactions.length === 2) {
      console.info('Starting mining block...');
      const previousBlock = this.lastBlock();
      process.env.BREAK = false;
      const block = new Block(previousBlock.getIndex() + 1, previousBlock.hashValue(), previousBlock.getProof(), this.currentTransactions);
      const { proof, dontMine } = await generateProof(previousBlock.getProof());
      block.setProof(proof);
      this.currentTransactions = [];
      if (dontMine !== 'true') {
        this.mineBlock(block);
      }
    }
  }
}

module.exports = BlockChain;
