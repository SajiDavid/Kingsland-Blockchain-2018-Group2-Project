/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/

/* Block Declaration */

// SHA256 Declaration
const SHA256 = require("crypto-js/sha256");
const Transaction = require("./transaction");
var dateFormat = require("dateformat");

class Block {
  // Block Constructor
  constructor(index, previousBlockHash, data, proof, nonce) {
    this.index = index; // Block Index
    this.timeStamp = dateFormat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT"); // TimeStamp
    this.datenow  = Date.now();
    this.previousBlockHash = previousBlockHash; // Intital Previous Hash is Zero
    this.data = data; // Data
    this.hash = this.calculateHash(); // Current Block Hash
    this.proof = proof;
    this.proofHex = "";
    this.nonce = nonce; // Initial Nonce
    this.confirmations = 1;
  }

  nodeSyncedBlock(index, timeStamp,datenow,previousBlockHash, data, proof,proofHex, nonce,confirmations) {
    this.index = index; // Block Index
    this.timeStamp = timeStamp; // TimeStamp
    this.datenow  = datenow;
    this.previousBlockHash = previousBlockHash; // Intital Previous Hash is Zero
    this.data = data; // Data
    this.proof = proof;
    this.proofHex = proofHex;
    this.nonce = nonce; // Initial Nonce
    this.confirmations = confirmations;
    this.hash = this.calculateHash(); // Current Block Hash

  }

  calculateHash() {
    // Retrun new calculate SHA256 Hash
    return SHA256(
      this.index +
        this.previousBlockHash +
        this.timeStamp +
        this.data +
        this.nonce
    ).toString();
  }

  setProof(proof, proofHex) {
    this.proof = proof;
    this.proofHex = proofHex;
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
  hashValue() {
    return this.hash;
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
module.exports = Block;
