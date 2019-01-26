/****************************************************/
/* Transaction                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/
const crypto = require("crypto");

class Transaction{

    constructor(sender,receiver,amount,description) {
        this.id = this.generateRandomID();
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.description = description;
        this.timestamp = Date.now();
        
    }
    generateRandomID(){
        return crypto.randomBytes(32).toString("hex");
      }
    getDetails(){
        return this;
    }

}

module.exports = Transaction;