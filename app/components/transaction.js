/****************************************************/
/* Transaction                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/

class Transaction{

    constructor(sender,receiver,amount) {
        this.id = "id";
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.timestamp = Date.now();
        
    }

    getDetails(){
        return this;
    }

}

module.exports = Transaction;