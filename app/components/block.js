/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/


/* Block Declaration */

// SHA256 Declaration
const SHA256 = require('crypto-js/sha256');
const Transaction = require('./transaction');

class Block{

    // Block Constructor 
    constructor(index, timestamp, data, previousHash) 
    {
        this.index = index;                     // Block Index
        this.timeStamp = timestamp;         // TimeStamp
        this.previousHash = previousHash;            // Intital Previous Hash is Zero  
        this.data = data;                   // Data
        this.hash = this.calculateHash();   // Current Block Hash
        this.nonce = 100000;                     // Initial Nonce
    }

    calculateHash()
    {
        // Retrun new calculate SHA256 Hash
        return  SHA256(this.index+this.previousHash+this.timeStamp+this.data+this.nonce).toString();
    }

    setProof(proof) {
        this.proof = proof;
      }
    
      getProof() {
        return this.proof;
      }
    
      getIndex() {
        return this.index;
      }
    
      getPreviousBlockHash() {
        return this.previousBlockHash;
      }

}

/*
function Tiger() {
    function roar(terrian){
        console.log('Hey i am in ' +  terrian + ' and i am roaing');
    };
    return roar;
}
*/
module.exports  = Block ;