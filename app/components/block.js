/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/


/* Block Declaration */

// SHA256 Declaration
const SHA256 = require('crypto-js/sha256');


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

module.exports = Block;