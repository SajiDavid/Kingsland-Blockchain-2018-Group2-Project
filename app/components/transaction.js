/****************************************************/
/* Transaction                                      */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/
const crypto = require("crypto");
var dateFormat = require('dateformat');

class Transaction{

    constructor(sender,receiver,amount,description,signature) {
        this.id = this.generateRandomID();
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.description = description;
        this.timestamp = dateFormat(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT");  
        this.datenow  = Date.now();
        this.signature = signature;
        
    }
    generateRandomID(){
        return crypto.randomBytes(32).toString("hex");
      }
    getDetails(){
        return this;
    }

}

module.exports = Transaction;