/****************************************************/
/* Socket Listener Class                            */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/
const Transaction = require('./transaction');
let BlockchainClass = require('./blockchain');
const socketActions = require('../util/constants');
let RouterClass = require("../../app/routes/routes");
let Router = new RouterClass();




const socketListeners = (socket, ownchain) => {
  socket.on(socketActions.END_MINING, (newChain) => {
    console.log('End Mining encountered');
    process.env.BREAK = true;
    let blockChain;

    try{
      blockChain = new BlockchainClass(Router.io,"2");
    }
    catch(exp){
      console.log("Excep : "+exp)
    }
    //let blockChain = new BlockChain(ownchain.io,ownchain.blocksize);
    //blockChain.parseChain(newBlock);
    blockChain.chain = newChain;
    var newLength = blockChain.getLength();
    var ownLength = ownchain.getLength();
    if (blockChain.checkValidity() &&  newLength >= ownLength) {
      ownchain.chain = blockChain.chain;
      console.log('New Block added');
    }
    else{
      console.log('Invalid Block ');
    }
  });
  
  socket.on(socketActions.ADD_TRANSACTION, (id,sender, receiver, amount,description,signature) => {
    const transaction = new Transaction(id,sender, receiver, amount,description,signature);
    ownchain.newTransaction(transaction,ownchain);
    console.info(`Added transaction: ${JSON.stringify(transaction.getDetails(), null, '\t')}`);
  });
  socket.on(socketActions.MY_ADDRESS, (address) => {
    
    console.info(`My address ${address}`);
  });
  

  return socket;
};

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at(main):", reason.stack || reason);
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});

module.exports = socketListeners;