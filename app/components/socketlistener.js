/****************************************************/
/* Socket Listener Class                            */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/
const Transaction = require('./transaction');
const Blockchain = require('./blockchain');
const socketActions = require('../util/constants');

const socketListeners = (socket, chain) => {
  socket.on(socketActions.END_MINING, (newChain) => {
    console.log('End Mining encountered');
    process.env.BREAK = true;
    const blockChain = new Blockchain();
    blockChain.parseChain(newChain);
    if (blockChain.checkValidity() && blockChain.getLength() >= chain.getLength()) {
      chain.blocks = blockChain.blocks;
    }
  });
  
  socket.on(socketActions.ADD_TRANSACTION, (sender, receiver, amount,description,signature) => {
    const transaction = new Transaction(sender, receiver, amount,description,signature);
    chain.newTransaction(transaction,chain);
    //console.info(`Added transaction: ${JSON.stringify(transaction.getDetails(), null, '\t')}`);
  });
  socket.on(socketActions.MY_ADDRESS, (address) => {
    
    console.info(`My address ${address}`);
  });
  

  return socket;
};

module.exports = socketListeners;