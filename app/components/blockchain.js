/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/

/* Block Chain Class Declaration */

// Load Block Constructor
let Block = require('./block');

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
        newBlock.index = this.latestBlock().index + 1;
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

module.exports  = BlockChain ;