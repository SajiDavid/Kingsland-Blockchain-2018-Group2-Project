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
const successlog = require('../util/logger').successlog;
const ethers = require("ethers");
 
const socketListeners = (socket, ownchain) => {
  socket.on(socketActions.END_MINING, (newChain) => {
    //successLog(ownchain.port, `End mining encountered`);
    process.env.BREAK = true;
    let blockChain;

    try {
      blockChain = new BlockchainClass(Router.io, "2");
    } catch (exp) {
      successLog(ownchain.port, `Exception in End-mining ${exp}`);

    }

    blockChain.chain = newChain;
    var newLength = blockChain.getLength();
    var ownLength = ownchain.getLength();
    let block = blockChain.chain[newLength - 1];
    if (blockChain.checkValidity() && newLength >= ownLength) {
      ownchain.chain = blockChain.chain;
     
      var tx_length = block.data.length;
      for (var i = 0; i < tx_length; i++) {
        const tx_id = block.data[i].id;
        ownchain.confirmedTransactions.push(tx_id);

        //block.data[i].minedBlock = block.index;
        // Removing Pending Transaction which is confirmed
        ownchain.removePendingTransaction(ownchain.port, ownchain.currentTransactions, tx_id);
        /*if (this.currentTransactions[i].id == block.data[i].id);
        this.currentTransactions.splice(i, 1);
        */
      }

      ownchain.incrementNonce();
      successLog(ownchain.port, `New Block added ID: ` + block.index);

    } else {
      errorLog(ownchain.port, `Invalid Block` + blockChain.chain[newLength - 1]);
    }
  
  });

  socket.on(socketActions.ADD_TRANSACTION, (id, sender, receiver, amount, txreward, description, signature) => {
    const transaction = new Transaction(id, sender, receiver, amount, txreward, description, signature);
    (async () => {
      const signed_address = await ownchain.verifyTransaction(sender, receiver, amount, ownchain.nonce, ownchain.chainid, signature)
      if (signed_address == sender) {
        ownchain.newTransaction(transaction, ownchain);
        successLog(ownchain.port, `Transaction Id ${id} signature ${signed_address} validated`);
      } else {
        errorLog(ownchain.port, `Transaction ${id} signature not matched`);
        errorLog(ownchain.port, "" + transaction.toString());
      }
    })();

  });
  socket.on(socketActions.MY_ADDRESS, (address) => {

    console.info(`My address ${address}`);
  });



  socket.on(socketActions.ADD_NEW_NODE, (node, hostname) => {
    const valid = ownchain.validateNodeHost(hostname);
    if (valid) {

      ownchain.addPeerNode(hostname);
      successLog(ownchain.port, `Added new peer ${hostname}`);

      console.info(`New Node added ${hostname}`);
    }
  });

  return socket;
};

function successLog(port, message) {
  successlog.info(` ${port}: ${message}`);
}

function errorLog(port, message) {
  successlog.error(`${port}: ${message}`);
}
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at(Socket):", reason.stack || reason);

});

module.exports = socketListeners;