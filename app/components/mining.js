/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/

/* Block Declaration */

// SHA256 Declaration
let Block = require("./block");
let axios = require("axios");
const SHA256 = require("crypto-js/sha256");
let socketActions = require("../util/constants");
const crypto = require('crypto');
const errorlog = require('../util/logger').errorlog;
const successlog = require('../util/logger').successlog;
var dateFormat = require("dateformat");

class Mining {
  // Block Constructor
  constructor(index,previousblock,pendingtransactions, difficulty, address,nonce) {
    this.index = index; // Block Index
    this.previousblock = previousblock;
    this.pendingtransactions = pendingtransactions || [];
    this.difficulty = difficulty;
    this.reward = this.calculateReward();
    this.nonce = nonce; // Initial Nonce
    this.address = address; // Current Block Hash
    this.blockdatahash = this.getBlockDataHash();
    this.transactioncount = this.getTransactionCount();; 

  }

  getBlockDataHash() {
    // Retrun new calculate SHA256 Hash
    return SHA256(
      (this.pendingtransactions).toString()
    ).toString();
  }

  getTransactionCount() {
    return this.pendingtransactions.length;
  }

  getCurrentMiningCandidate(){

    // returning Job Candidate
    return {index:this.index,
            transactionIncluded:this.transactioncount,
            expectedReward:this.reward,
            rewardAddress:this.address,
            blockDataHash:this.blockdatahash,
            nonce:this.nonce
           }

  }

  calculateReward(){
   var length = this.pendingtransactions.length || 0;
   var rewardAmount = 0 + socketActions.MINING_REWARD;
   for(var i = 0; i<length;i++ ){
       var transaction = this.pendingtransactions[i];
       if(transaction.txreward.substring)
         transaction.txreward = parseFloat(transaction.txreward);
       rewardAmount = rewardAmount + transaction.txreward + ( transaction.amount * 5 /100 )
   }
    return rewardAmount;
  }
  
  async startmining(port,url,nonce,blockDataHash,difficulty){
    const zeros = new Array(difficulty + 1).join("0");
    process.env.BREAK = false;

    const { nonce_increment,
            created_date,
            proofHex,
            dontMine} = await generateProof(nonce,blockDataHash,difficulty,zeros);
    if(dontMine  === 'true')
    {
        successLog(port,"End Mining Endcounterred, Skipping mining");
    }
    else{
    console.log(""+ nonce_increment + " "+proofHex+" Date "+created_date);
    var block = new Block(
        this.previousblock.index + 1,
        created_date,
        this.previousblock.hashValue,
        this.pendingtransactions,
        this.previousblock.proof,
        nonce
      );
      block.setProof(nonce_increment, proofHex);
      axios.post(`${url}/submit-mined-block`, {
        block: block,
        minedby: this.address,
      });
    }
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

const generateProof = (nonce,blockdatahash,difficulty,zeros) => new Promise((resolve) => {
    setImmediate(async () => {
      const created_date = Date.now();//dateFormat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT");
      var nonce_increment = nonce;
      let candidateProof = {nonce:nonce_increment,
                           blockdatahash:blockdatahash,
                           date:created_date};
      const dontMine = process.env.BREAK;
      const {
        validFlag,
        proofHex
      } = isProofValid(candidateProof,difficulty,zeros);
  
      if (validFlag == true || dontMine === 'true') {
        resolve({
          nonce_increment,
          created_date,
          proofHex,
          dontMine
        });
      } else {
        nonce_increment++;
        resolve(await generateProof2(nonce_increment,blockdatahash,difficulty,zeros));
      }
    });
  });
  
  const isProofValid = (candidateProof,difficulty,zeros) => {
    let proofHex;
    const hashFunction = crypto.createHash('sha256');
    hashFunction.update(JSON.stringify(candidateProof));
    proofHex = hashFunction.digest('hex');
    //console.log("ProofHex :"+proofHex);
    //if (proofHex.includes('00')) {
    //  console.log("String:  "+proofHex.substring(0,2)+" Zeros: "+zeros);
    if (proofHex.substring(0, difficulty) === zeros) {
      return {
        validFlag: true,
        proofHex: proofHex
      };
    }
    return false;
  };

  const generateProof2 = (nonce,blockdatahash,difficulty,zeros) => new Promise((resolve) => {
    setImmediate(async () => {
      const created_date = Date.now();//dateFormat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT");
      var nonce_increment = nonce;
      let candidateProof = {nonce:nonce_increment,
                           blockdatahash:blockdatahash,
                           date:created_date};
      const dontMine = process.env.BREAK;
      const {
        validFlag,
        proofHex
      } = isProofValid(candidateProof,difficulty,zeros);
  
      if (validFlag == true || dontMine === 'true') {
        resolve({
          nonce_increment,
          created_date,
          proofHex,
          dontMine
        });
      } else {
        nonce_increment++;
        resolve(await generateProof(nonce_increment,blockdatahash,difficulty,zeros));
       
      }
    });
  });


  function successLog(port, message) {
    successlog.info(` ${port}: ${message}`);
  }
  
  function errorLog(port, message) {
    successlog.error(`${port}: ${message}`);
  }
  process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason)
    errorlog.error("Exception occured:", reason.stack || reason);

    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
  });
module.exports = Mining;