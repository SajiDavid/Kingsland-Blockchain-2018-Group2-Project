/****************************************************/
/* Main Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/

// Load Blockchain and Block Classes
const fs = require("fs");
let socketListener = require("./app/components/socketlistener");
let BlockClass = require("./app/components/block");
let BlockchainClass = require("./app/components/blockchain");
let walletClass = require("./app/components/wallet");
var multer = require("multer");
var debug = require("debug")("main");
const web3 = require("web3");
const errorlog = require('./app/util/logger').errorlog;
const successlog = require('./app/util/logger').successlog;
const args = require('minimist')(process.argv.slice(2))
const EthCrypto = require("eth-crypto");
const ethers = require("ethers");




const cport = args['port'];
const cnode_flag = args['node'];
const chelp = args['help'];
const cmining_flag = args['mining'];
const cwallet_flag = args['wallet'];
console.log("test" + cport);
if (cport == undefined || cport == "") {

  console.log("port is mandatory,Please provide");
  console.log("Syntax: node main.js --port=3000");
  return;
}



let RouterClass = require("./app/routes/routes");
let socketActions = require("./app/util/constants");
let bodyParser = require("body-parser");
let axios = require("axios");
let portscanner = require("portscanner");
let socket_global;
// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

//const MongoClient = require("mongodb").MongoClient;
//const assert = require("assert");
const express = require("express");
const session = require("express-session");

let Router = new RouterClass();
let Blockchain = new BlockchainClass(
  Router.io,
  socketActions.BLOCKSIZE_TRANSACTIONS
); // This will create Genesis Block


//let Block = new BlockClass(1, Date.now(), "New Block 1", "0000000000"); // adding new Block
var path = require("path");
let Wallet = new walletClass();
const filename = "Wallet_keystore_upload.txt";
const upload = multer({
  dest: "./app/util/"
});


var messageVar = "";
var messageStatus = (messageStatus0 = messageStatus1 = messageStatus2 = messageStatus3 = false);
var addressFlag = (uploadKeyFlag = privateKeyFlag = messageRedirect = false);
var balanceAddress = 0;
var defaultHost = "";
var defaultPort = "";
var port2;
var port_status;
var block_data = "";
var blocklast = false;
var blockfirst = false;
var blockblank = false;
var previous_block_data = ""; // Store previous block data during transaction

var messagetype = true;

var sendervalue = "";
var receivervalue = "";
var amountvalue = "";
var descriptionvalue = "";
var blocknumber = "";
var transactionFlag = false;
var transactionid = "";

// function intervalFunc() {
//   /* Share all nodes */
//   for (let i = 0; i < Blockchain.nodes.length; i++) {
//     var valid_host = Blockchain.validateNode(Blockchain.nodes[i]);

//     if (!valid_host) {
//       const new_node = `http:\\${Blockchain.nodes[i]}`;

//       (async () => {

//         Blockchain.io.emit(
//           socketActions.ADD_NEW_NODE,
//           new_node,
//           Blockchain.nodes[i]
//         );

//         //console.log("Nodes sync "+ Blockchain.nodes[i]);
//       })();
//     }
//   }

// }
// setInterval(intervalFunc, 120000);
// Socket IO conncetion

Blockchain.io.on("connection", function (socket) {
  var hostname = socket.handshake.headers.host;
  var valid_host = Blockchain.validateNodeHost(hostname);
  successLog(cport, "Socket connected, ID " + socket.id);

  //console.log("Socket connected, ID", socket.id, " URL 2" + hostname);
  /*console.log('socket.client.conn.remoteAddress', socket.client.conn.remoteAddress);
    console.log('socket.request.connection.remoteAddress', socket.request.connection.remoteAddress);
    console.log('socket.handshake.address', socket.handshake.address);
    console.log('socket.request.connection.localAddress', socket.request.connection.localAddress);
    console.log('socket.request.connection.localPort', socket.request.connection.localPort);
    console.log('socket.request.connection.remotePort', socket.request.connection.remotePort);
*/

  socket.on("disconnect", function () {
    successLog(cport, "user disconnected, ID " + socket.id);

    //Blockchain.removeNode(hostname)  
  });
  socket.on("connect", function () {
    if (valid) {
      //Blockchain.addNodeHost(hostname);
    }
    console.log("user connected, ID", socket.id, " URL 2" + hostname);
  });
  socket.on("reconnect", function () {
    console.log("user reconnected, ID", socket.id, " URL 2" + hostname);
  });
});

/*
Blockchain.io.on(socketActions.MY_ADDRESS, function(address) {
  console.log("New node address", address);
});
*/


Router.app.set("view engine", "pug");
Router.app.set("views", path.join(__dirname, "views"));
//Router.app.use(express.cookieParser('keyboard cat'));
Router.app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true
    }
  })
);

Router.app.use(bodyParser.json());
Router.app.use(express.static(__dirname + "/public"));
/***** Router Functions  */

/* End Pointt 
    /               ->  Home
    /info           ->  Blockchain Information  
    /debug          ->  Debug Chain
    /reset-chain    ->  Reset Block chain to initial state
    /blocks         ->  List Blocks
*/

Router.router.use(function (req, res, next) {
  //console.log("/" + req.method);
  next();
});

/*Test comment added */

Router.app.post("/nodes", urlencodedParser, function (req, res) {
  const {
    hostname,
    port,
    chain,
    walletAddress,
    currentTransactions,
    id,
    walletMain,
    privatekey,
    datenow,
    timeStamp,
    nonce,
    blocksize,
    difficulty
  } = req.body;
  // console.log("Print body ", req.body);
  const {
    callback
  } = req.query;
  if (hostname == undefined || hostname == "" ||
    port == undefined || port == "") {

    messageVar = `Host:${hostname} or Port:${port} is invalid, Please verify and add`;
    messageStatus1 = true;
    messagetype = false;
    res.redirect("/home");

  } else {
    const node = `http://${hostname}:${port}`;
    const valid = Blockchain.validateNode(hostname, port);
    if (valid) {
      const host = `${hostname}:${port}`;
      /* Sending New Peer to connected Nodes */

      (async () => {

        Blockchain.io.emit(
          socketActions.ADD_NEW_NODE,
          node,
          host
        );

      })();
      const new_client = require('socket.io-client');
      const socketNode = socketListener(new_client(node), Blockchain);
      Blockchain.addNode(socketNode, hostname, port);
      //successlog.info("New Node: "+hostname+" Port: " + port+" added");
      if (callback === "true") {
        //console.info(`Added node ${node} back`);
        var length = chain.length;
        Blockchain.chain = [];
        for (var i = 0; i < length; i++) {
          var blocknew = chain[i];
          if (blocknew == null)
            break;
          let nodeblock = new BlockClass();
          // index, timeStamp,datenow,previousBlockHash, data, proof,proofHex, nonce,confirmations)
          nodeblock.nodeSyncedBlock(blocknew.index,
            blocknew.timeStamp, blocknew.datenow,
            blocknew.previousBlockHash, blocknew.hash,
            blocknew.data,
            blocknew.proof, blocknew.proofHex,
            blocknew.nonce, blocknew.confirmations);
          Blockchain.chain.push(nodeblock);
          //Blockchain.addBlock(block,true);
        }
        //Blockchain.chain = chain;
        //Blockchain.addressWallet = walletAddress;
        //console.log("Wallet address" + walletAddress);
        Blockchain.currentTransactions = currentTransactions;
        //Blockchain.nodes = [];
        Blockchain.id = id;
        (async () => {
          Blockchain.addressWallet = await Blockchain.createWalletAddress(privatekey); //Wallet.createFromPrivateKey(privatekey);
        })();
        Blockchain.privatekey = privatekey;

        Blockchain.datenow = datenow;
        Blockchain.timeStamp = timeStamp; // TimeStamp
        Blockchain.nonce = nonce;
        Blockchain.blocksize = blocksize;
        Blockchain.difficulty = difficulty;
        successLog(cport, `${node} successfully added`);

        res.json({
          status: "Added node Back"
        }).end();
      } else {
        axios.post(`${node}/nodes?callback=true`, {
          hostname: hostname,
          port: port2,
          chain: Blockchain.chain,
          id: Blockchain.id,
          walletAddress: Blockchain.addressWallet,
          currentTransactions: Blockchain.currentTransactions,
          //Blockchain.nodes = [];
          walletMain: Blockchain.walletMain,
          privatekey: Blockchain.privatekey,
          datenow: Blockchain.datenow,
          timeStamp: Blockchain.timeStamp, // TimeStamp
          nonce: Blockchain.nonce,
          blocksize: Blockchain.blocksize,
          difficulty: Blockchain.difficulty
        });
        successLog(cport, `${node} successfully added`);
        messageVar = `${node} successfully added`;
        messageStatus1 = true;
        messagetype = true;

        res.redirect("/home");
      }
    } else {
      messageVar = `${node} already added`;
      messageStatus1 = true;
      messagetype = false;
      res.redirect("/home");
    }

  }

});

Router.app.post("/newpeer", urlencodedParser, function (req, res) {
  const {
    hostname,
    port,
  } = req.body;
  // console.log("Print body ", req.body);
  const {
    callback
  } = req.query;

  const node = `http://${hostname}:${port}`;
  const valid = Blockchain.validateNode(hostname, port);
  if (valid) {
    const host = `${hostname}:${port}`;
    const new_client = require('socket.io-client');
    const socketNode = socketListener(new_client(node), Blockchain);
    Blockchain.addNode(socketNode, hostname, port);
    //successlog.info("New Node: "+hostname+" Port: " + port+" added");
    if (callback === "true") {

      successLog(cport, `${node} successfully added`);


    } else {
      axios.post(`${node}/newpeer?callback=true`, {
        hostname: hostname,
        port: cport,
      });
      successLog(cport, `${node} successfully added`);
    }

    res.end();

  }
  else{
    res.end();

  }
});


// Home End-Point
Router.app.get("/home", function (req, res) {
  debug("Home get function");
  res.render("index", {
    chainId: Blockchain.id,
    nodeId: Blockchain.nodeid,
    chainLength: Blockchain.getLength(),
    startedOn: Blockchain.getTimeStamp(),
    connectedNodes: Blockchain.getNodeCount(),
    pendingTransactionsCount: Blockchain.getPendingTransactionLength(),
    browser_url:process.env.BROWSER_REFRESH_URL,
    nonce: Blockchain.nonce,
    difficulty: Blockchain.difficulty,
    defaultHost: defaultHost,
    defaultPort: defaultPort,
    messagetype: messagetype,
    displayMessageChain: messageStatus0,
    displayMessageNode: messageStatus1,
    message: messageVar
  });

  clearMessageVar();
});

Router.app.get("/addNewPeer", function (req, res) {


})

// Home End-Point
Router.app.get("/", function (req, res) {
  res.render("index", {
    chainId: Blockchain.id,
    nodeId: Blockchain.nodeid,
    chainLength: Blockchain.getLength(),
    startedOn: Blockchain.getTimeStamp(),
    connectedNodes: Blockchain.getNodeCount(),
    pendingTransactionsCount: Blockchain.getPendingTransactionLength(),
    nonce: Blockchain.nonce,
    difficulty: Blockchain.difficulty,
    browser_url:process.env.BROWSER_REFRESH_URL,
    defaultHost: defaultHost,
    defaultPort: defaultPort,
    displayMessage: messageStatus,
    message: messageVar
  });
});

Router.app.get("/src/arrow.png", function (req, res, next) {
  res.sendFile(__dirname + "/src/arrow.png");
});

Router.app.get("/src/background.jpg", function (req, res, next) {
  res.sendFile(__dirname + "/src/background.jpg");
});

Router.app.get("/src/Block.gif", function (req, res, next) {
  res.sendFile(__dirname + "/src/Block.gif");
});

// To get Blockchain Information
Router.app.get("/info", function (req, res) {
  let chaininfo = {
    Chain: Blockchain.Chain,
    Nodes: Blockchain.nodes
  };
  res.send(
    "Chain Detail :\n " +
    JSON.stringify(Blockchain.chain, null, 4) +
    "Nodes: " +
    JSON.stringify(Blockchain.node)
  );

  /*************************************************
 * Output Needed
        "about" : "KingslandChain/0.9-csharp" ,
        "nodeId" : "1a22d3…9b2f" ,
        "chainId" : "c6da93eb…c47f" ,
        "nodeUrl" : "http://chain-node-03.herokuapp.com" ,
        "peers" : 2 ,
        "currentDifficulty" : 5 ,
        "blocksCount" : 25 ,
        "cumulativeDifficulty" : 127 ,
        "confirmedTransactions" : 208 ,
        "pendingTransactions" : 7
        }
*************************************************/
});


// To Debug Blockchain
Router.app.get("/debug", function (req, res) {
  res.send("This is Test Debug api");

  /*************************************************
 * Output Needed
 * 
 
    { "selfUrl" : "http://localhost:5555" , "peers" : { … },
    "chain" : {
    "blocks" : [{ "index" : 0 , "transactions" :[…], "difficulty" : 0 ,
    "prevBlockHash" : "d9…9c" , "minedBy" : "af … b2" , "nonce" : 0 ,
    "blockDataHash" : "af25…d9" , "dateCreated" : "2018-01-…" },
    "blockHash" : "c962…a8" }, {…}, {…}],
    "pendingTransactions" : [{…}, …], "currentDifficulty" : 5 ,
    "miningJobs" : { "e3d8…5f" : {…}, "25c1…a8" : {…}, }
    }, "confirmedBalances" : { "2a7e…cf" : 500020 , … }
    }

*************************************************/
});

Router.app.get("/connectednodes", function (req, res) {

  res.render("connected_nodes", {
    blockcontent: Blockchain.nodes,
    displayMessage: messageStatus,
    message: messageVar
  });

});

Router.app.get("/pendingtransactions", function (req, res) {

  res.render("pending_transactions", {
    pendingTransactions: Blockchain.currentTransactions,
    displayMessage: messageStatus,
    message: messageVar
  });

});

// To Reset Whole Chain
Router.app.get("/reset-chain", function (req, res) {
  Blockchain = new BlockchainClass(
    Router.io,
    socketActions.BLOCKSIZE_TRANSACTIONS
  ); // This will create Genesis Block
  messageStatus0 = true;
  messageRedirect = true;
  messageVar = "Chain has been successfully reset.";
  Blockchain.addNode(
    socket_global, "localhost", port2
  );
  res.redirect("/home");
});

// Goes to Faucet to pour coin
Router.app.get("/faucet", function (req, res) {
  res.render("faucet", {
    addressWallet: Blockchain.addressWallet,
    balance: Blockchain.getAddressBalance(Blockchain.addressWallet),
    sendervalue: sendervalue,
    displayMessage: messageStatus,
    messagetype: messagetype,
    message: messageVar
  });
  clearMessageVar();
});

// Goes to Faucet to pour coin
Router.app.get("/wallet", function (req, res) {
  //res.send('This is Wallet Page..coming up')
  //res.sendFile(__dirname + "/wallet.html");
  // res.render("wallet");
  var balance = "";
  if (!messageRedirect) {
    privateKeyFlag = messageStatus = false;

    if (addressFlag) {
      balance = Blockchain.getAddressBalance(Wallet.address);
      if (balance === "" || balance === "0") balance = "0";
    }
  } else {
    balance = Blockchain.getAddressBalance(balanceAddress);
    if (balance === "" || balance === "0") balance = "0";
    messageRedirect = false;
  }
  res.render("wallet", {
    privateKey: Wallet.privateKey,
    publicKey: Wallet.publicKey,
    address: Wallet.address,
    seed: Wallet.getSeed(),
    privateKey: Wallet.privateKey,
    uploadKeyFlag: uploadKeyFlag,
    privateKeyFlag: privateKeyFlag,
    addressFlag: addressFlag,
    balance: balance,
    sendervalue: sendervalue,
    receivervalue: receivervalue,
    amountvalue: amountvalue,
    descriptionvalue: descriptionvalue,
    displayMessageUploadKey: messageStatus0,
    displayMessagePrivateKey: messageStatus1,
    displayMessageAddress: messageStatus2,
    displayMessageTransaction: messageStatus3,
    messagetype: messagetype,
    message: messageVar
  });

  messageStatus0 = messageStatus1 = messageStatus2 = messageStatus3 = false;
  messagetype = true;
});

// Goes to Faucet to pour coin
Router.app.get("/test", function (req, res) {
  res.send("This is test Page..coming up");
});




Router.app.post("/transactionsend", urlencodedParser, function (req, res) {
  const {
    sender,
    receiver,
    amount,
    description
  } = req.body;
  var valid = true;
  receivervalue = receiver;
  sendervalue = sender;
  amountvalue = amount;
  descriptionvalue = description;
  if (Wallet.address == undefined || Wallet.address == "") {
    messageVar = `No Wallet found, Please upload or Create one.`;

    valid = false;
  }

  // Validation
  if (valid) {
    if (sender != Wallet.address) {
      messageVar = `Sender address "${sender}" not belong to you!!`;
      valid = false;
    } else {
      if (!web3.utils.isAddress(sender)) {
        receivervalue = receiver;
        // sendervalue = sender;
        // amountvalue = amount;
        messageVar = `Sender address "${sender}" is invalid!!`;
        valid = false;
      } else {
        if (!web3.utils.isAddress(receiver)) {
          // sendervalue = sender;
          // amountvalue = amount;
          messageVar = `Receiver address "${receiver}" is invalid!!`;
          valid = false;
        } else {
          if (amount <= 0 ) {
            // sendervalue = sender;
            // receivervalue = receiver;
            messageVar = `Amount cannot be "0" or lesser!!`;
            valid = false;
          } else {
            var balanceSender = Blockchain.getAddressBalance(sender);
            if (balanceSender < amount) {
              // sendervalue = sender;
              // receivervalue = receiver;
              messageVar = `Insufficent balance, you have only "${balanceSender}" Coins !!`;
              valid = false;
            }
          }
        }
      }
    }
  }

  if (!valid) {
    messageStatus3 = true;
    messagetype = false;
  } else {
    const transaction_id = Blockchain.generateRandomTransactionID();

    (async () => {

      let signedTransaction = await signTransaction(
        sender,
        receiver,
        amount, // Amount
        Blockchain.nonce,
        Blockchain.chainId,
        Wallet.wallet
      );
      //console.log("Signed Transaction: \n" + signedTransaction);
      Blockchain.io.emit(
        socketActions.ADD_TRANSACTION,
        transaction_id,
        sender,
        receiver,
        amount,
        description,
        signedTransaction
      );
      successLog(cport, "Transaction ID" + transaction_id + " and broadcasted")
    })();

    messageVar = `Transaction successfully sent`;
    messageStatus3 = true;
    sendervalue = receivervalue = amountvalue = descriptionvalue = "";
    if (Wallet.address != "") addressFlag = true;

    privateKeyFlag = false;
    messageRedirect = true;
    balanceAddress = sender;
  }
  res.redirect("/wallet");

  messageRedirect = false;
});

Router.app.post("/receiveform", urlencodedParser, function (req, res) {
  const address = req.body.address;
  var valid = true;
  if (address == undefined || address == "") {
    messageVar = `Please enter address to send coins!!`;
    messagetype = false;
    valid = false;
    messageStatus = true;
  } else if (!web3.utils.isAddress(address)) {
    sendervalue = address;
    messageVar = `Address "${address}" is invalid!!`;
    messagetype = false;
    valid = false;
    messageStatus = true;
  } else {
    valid = Blockchain.validateCoinGreediness(address);
    if (!valid) {
      sendervalue = address;
      messageVar = `Please wait for an hour to get your next coins..Freee..!!`;
      messagetype = false;
      messageStatus = true;
    }
  }
  if (valid) {
    Blockchain.giveAwayFaucetCoin(address, Blockchain);
    messageVar = `${
      socketActions.FREE_COINS
    } Free Coins Sent Successfully to ${address}`;
    messagetype = true;
    messageStatus = true;
    successLog(cport, "Free Coin sent to " + address);

  }

  res.redirect("/faucet");
});

// Creating New Wallet
Router.app.get("/createwallet", function (req, res, next) {
  Wallet.createNewWallet();
  messageVar = `New Wallet successfully created, Please note down and store the seeds for recovery: `;
  messageStatus2 = true;
  if (Wallet.address != "") addressFlag = true;
  messageRedirect = true;
  balanceAddress = Wallet.address;

  res.redirect("/wallet");

  // res.render("wallet", {
  //   privateKey: Wallet.privateKey,
  //   publicKey: Wallet.publicKey,
  //   address: Wallet.address,
  //   seed: Wallet.getSeed(),
  //   privateKeyFlag: privateKeyFlag,
  //   addressFlag: addressFlag,
  //   displayMessagePrivateKey: messageStatus1,
  //   displayMessageTransaction: messageStatus2,
  //   displayMessageAddress: messageStatus3,
  //   message: messageVar
  // });
});

// Creating New Wallet
Router.app.get("/privatekeywallet", function (req, res, next) {
  //messageVar = `New Wallet created from private key successfully`;

  messageStatus2 = true;
  addressFlag = false;
  privateKeyFlag = true;
  messageRedirect = true;
  balanceAddress = Wallet.address;

  res.redirect("/wallet");
  // res.render("wallet", {
  //   privateKey: Wallet.privateKey,
  //   publicKey: Wallet.publicKey,
  //   address : Wallet.address,
  //   seed : "",
  //   privateKeyFlag:privateKeyFlag,
  //   addressFlag:addressFlag,
  //   displayMessage: messageStatus,
  //   message: messageVar
  // });
});

// Creating New Wallet from privateKey
Router.app.post("/createfromprivatekey", urlencodedParser, function (req, res) {
  const privateKey = req.body.privatekey;
  Wallet.initializeWallet();
  Wallet.createFromPrivateKey(privateKey);
  messageVar = `New Wallet created from Private key provided`;
  messageStatus2 = true;
  if (Wallet.address != "") addressFlag = true;

  privateKeyFlag = false;
  messageRedirect = true;
  balanceAddress = Wallet.address;
  res.redirect("/wallet");

  // res.render("wallet", {
  //   privateKey: Wallet.privateKey,
  //   publicKey: Wallet.publicKey,
  //   address : Wallet.address,
  //   seed :"",
  //   privateKeyFlag:privateKeyFlag,
  //   addressFlag:addressFlag,
  //   displayMessage: messageStatus,
  //   message: messageVar
  // });
});

// Goes to Faucet to pour coin
Router.app.get("/downloadkeyfile", function (req, res) {
  const filename = Wallet.getWalletFileName();
  res.download(filename);
  //res.send("This is test Page..coming up");
});

// Goes to Faucet to pour coin
Router.app.get("/importjson", function (req, res) {
  uploadKeyFlag = true;
  messageStatus0 = false;
  addressFlag = false;
  privateKeyFlag = false;
  messageRedirect = true;

  res.redirect("/wallet");
  //res.send("This is test Page..coming up");
});

// Goes to Faucet to pour coin
Router.app.post("/uploadkeyfile", upload.single("file"), (req, res) => {
  if (req.file) {
    //console.log("Uploading file...");
    var filename = req.file.filename;
    messageVar = `File has been uploaded successfully`;
  } else {
    //("No File Uploaded");
    messageVar = `File having issue uploading`;
  }
  uploadKeyFlag = true;
  messageStatus0 = true;
  addressFlag = true;
  privateKeyFlag = false;
  messageRedirect = true;

  res.redirect("/wallet");
  //res.send("This is test Page..coming up");
});

// Returns All Blocks  Information
Router.app.get("/blocks", function (req, res) {
  //res.send(JSON.stringify(Blockchain.chain, null, 4));
  if (messageRedirect) {} else {
    transactionFlag = false;
  }
  if (block_data == null || block_data == "" || block_data == undefined) {
    blockblank = true;
  } else {
    blockblank = false;
  }
  if (blocknumber >= Blockchain.getLength() - 1) {
    blocklast = true;
  } else {
    blocklast = false;
  }

  if (blocknumber == 0 || blocknumber == "0") {
    blockfirst = true;
  } else {
    blockfirst = false;
  }
  res.render("explorer", {
    searchBoxFlag: true,
    transactionFlag: transactionFlag,
    transactionid: transactionid,
    blocknumber: blocknumber,
    blockcontent: block_data,
    blockblank: blockblank,
    blocklast: blocklast,
    blockfirst: blockfirst,
    timestamp: block_data.timestamp,
    displayMessage: messageStatus,
    messagetype: messagetype,
    message: messageVar
  });

  transactionFlag = false;
  messageStatus = false;
  block_data = "";
  messageRedirect = false;
});

// Returns All Blocks  Information
Router.app.get("/getblock/:number", function (req, res) {
  //res.send(JSON.stringify(Blockchain.chain, null, 4));
  blocknumber = req.params.number;
  block_data = Blockchain.getBlockData(blocknumber);
  if (block_data == undefined || block_data == "") {
    transactionFlag = false;
    messageStatus = true;
    messagetype = false;
    messageVar = "No valid Block found!!";
  }
  transactionFlag = false;
  messageRedirect = true;
  res.redirect("/blocks");
});

// Goes to Blockdata to display
Router.app.post("/searchblock", urlencodedParser, function (req, res) {
  blocknumber = req.body.searchblockvalue;

  messageRedirect = true;
  if (blocknumber == undefined || blocknumber == "") {
    transactionFlag = false;
    messageStatus = true;
    messagetype = false;
    messageVar = "Invalid Block Number";
  } else {
    block_data = Blockchain.getBlockData(blocknumber);
    if (block_data == undefined || block_data == "") {
      transactionFlag = false;
      messageStatus = true;
      messagetype = false;
      messageVar = "No valid Block found!!";
    }
  }
  messageRedirect = true;
  res.redirect("/blocks");

  //block_data = block_data.replace(/\"([^(\")"]+)\":/g,"$1:");
  //block_data=JSON.stringify(block_data, null, '\t')

  //res.send("This is test Page..coming up");
});

Router.app.get("/transaction/:id", function (req, res) {
  transactionid = req.params.id;
  if (transactionid == undefined || transactionid == "") {
    messageStatus = true;
    messagetype = false;
    messageVar = "Transaction ID is empty!!";
    transactionFlag = false;
  } else {
    //previous_block_data = block_data;
    block_data = Blockchain.getTransactionBlock(transactionid);
    transactionFlag = true;
  }
  messageRedirect = true;
  res.redirect("/blocks");
  //res.send('user' + req.params.id);
});


if (process.argv[2] == undefined) {
  port2 = cport;
} else {
  port2 = cport;
}

// Checks the status of a single port
portscanner.checkPortStatus(port2, "localhost", function (error, status) {
  // Status is 'open' if currently in use or 'closed' if available

  port_status = status;

  if (port_status == "closed") {
    //console.log(port2 + " is available");
    //successLog(cport, "Port is available");
    ListenPort(port2);
  } else if (port_status == "open") {
    console.log(
      port2 + " is already opened, Please use node main.js <differtport>"
    );
    successLog(cport, port2 + " is already opened, Please use node main.js <differtport>");

  }
});

//console.log(JSON.stringify(Blockchain.chain, null, 4));
console.log("Is blockchain valid?" + Blockchain.checkValidity());

function clearMessageVar() {
  messageStatus = false;
  messageVar = "";
  messageStatus0 = messageStatus1 = messageStatus2 = messageStatus3 = false;
  sendervalue = receivervalue = amountvalue = descriptionvalue = "";
  messagetype = true;
  blocknumber = "";
}

function ListenPort(PORT) {
  Blockchain.port = PORT; // Assign port to Blockchain
  Router.http.listen(PORT, function () {
    console.log(`Living at URL http://localhost:${PORT}`);
    //successlog.info(`Chain Living at URL http://localhost:${PORT}`);
    successLog(cport, `Chain Living at URL http://localhost:${PORT}`);
    if (process.send) {
      process.send('online');
    }
  });

  var valid = Blockchain.validateNode('localhost', PORT)
  if (valid) {
    //let client = Router.client(`http://localhost:${PORT}`);
    const new_client = require('socket.io-client');
    socket_global = socketListener(new_client(`http://localhost:${PORT}`), Blockchain);
    Blockchain.addNode(
      // socketListener(Router.client(`http://localhost:${PORT}`), Blockchain)
      socket_global, "localhost", PORT
    );
  } else {
    console.log(`http://localhost:${PORT}` + " already a Peer :)")
  }
  // Blockchain.address("test");
}


async function signTransaction(
  sender,
  receiver,
  amount,
  nonce,
  chainid,
  walletfrom
) {
  let transaction = {
    to: receiver,
    value: ethers.utils.parseEther(amount.toString() || "0"),
    nonce: nonce,
    chainId: chainid,
    data: "0x"
  };
  let messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(transaction)));
  let sign = EthCrypto.sign(walletfrom.privateKey, messageHash);
  return sign;
}

function successLog(port, message) {
  successlog.info(` ${port}: ${message}`);
}
function errorLog(port, message) {
  successlog.error(`${port}: ${message}`);
}

process.on("unhandledRejection", (reason, promise) => {
  errorlog.error("Exception occured:", reason.stack || reason);

  //console.log("Unhandled Rejection at(main):", reason.stack || reason);
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});