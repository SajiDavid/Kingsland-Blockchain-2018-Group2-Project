/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/

/* Block Chain Class Declaration */
'use strict';



// SHA256 Declaration
const SHA256 = require('crypto-js/sha256');

const block = require('./block')

class Block{

    // Block Constructor 
    constructor(index, timestamp, data, previousHash = "") 
    {
        this.index = index;                     // Block Index
        this.timeStamp = timestamp;         // TimeStamp
        this.previousHash = previousHash;            // Intital Previous Hash is Zero  
        this.data = data;                   // Data
        this.hash = this.calculateHash();   // Current Block Hash
        this.nonce = 0;                     // Initial Nonce
    }

    calculateHash()
    {
        // Retrun new calculate SHA256 Hash
        return  SHA256(this.index+this.previousHash+this.timeStamp+this.data+this.nonce).toString()
    }

    mineBlock(difficulty)
    {

    }

}

class BlockChain{

    constructor() {
        this.chain = [this.createGenesisBlock()];
        
    }

    // Creation of Genesis Block
    createGenesisBlock(){
        
        return new Block(0,Date.now(),"KingsLand Genesis Block","0");
    }

    // Latest Block()
    latestBlock(){
        
        return this.chain[this.chain.length - 1]; // First Block is considered 0th postion so we use 
    }

    // Adding New Block to Chain
    addBlock(newBlock)
    {
        newBlock.previousHash = this.latestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);

    }

    checkValid(){
        for(let i=1;i<this.chain.length;i++)
        {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(currentBlock.hash !== currentBlock.calculateHash())
            {
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash)
            {
                return false;
            }
            
        }
        return true;
    }
}


let BlockChainnew = new BlockChain();
//let BlockChain2 = BlockChain();
let Blocknew = new Block(2,Date.now(),"New Block 1","0");
//var Block2 = new Block("12/15/2018", {amount:20});
BlockChainnew.addBlock(Blocknew);
//jkChainObjext.addBlock(new blockObject.block("12/16/2018",{amount:67}));

console.log(JSON.stringify(BlockChainnew,null,4));
console.log("Is blockchain valid?" + BlockChainnew.checkValid());


