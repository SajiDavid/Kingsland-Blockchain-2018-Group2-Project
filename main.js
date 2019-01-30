/****************************************************/
/* Main Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/

// Load Blockchain and Block Classes
const ethers = require("ethers");
const fs = require("fs");
let BlockClass = require("./app/components/block");
let BlockchainClass = require("./app/components/blockchain");
let TransactionClass = require("./app/components/transaction");
let walletClass = require("./app/components/wallet");

let RouterClass = require("./app/routes/routes");
let socketListener = require("./app/components/socketlistener");
let socketActions = require("./app/util/constants");
let bodyParser = require("body-parser");
let axios = require("axios");
let portscanner = require("portscanner");
// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const express = require("express");
const session = require("express-session");

let Router = new RouterClass();
let Blockchain = new BlockchainClass(Router.io); // This will create Genesis Block
let Block = new BlockClass(1, Date.now(), "New Block 1", "0000000000"); // adding new Block
var path = require("path");
let Wallet = new walletClass();

var messageVar = "";
var messageStatus = false;
var defaultHost = "";
var defaultPort = "";
var port2;
var port_status;

Router.app.set("view engine", "pug");
Router.app.set("views", path.join(__dirname, "views"));

/*
// Making DB Connection for Persistance data store

// Connection URL
const url = "mongodb://localhost:27017";
// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true });

// Database Name
const dbName = "blockchain";

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to Mongo server");

  const db = client.db(dbName);

  const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection("Testme");
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      callback(docs);
    });
  };

  client.close();
});
*/

//Router.app.use(express.cookieParser('keyboard cat'));
Router.app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
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

Router.router.use(function(req, res, next) {
  console.log("/" + req.method);
  next();
});

// Home End-Point
Router.app.get("/home", function(req, res) {
  res.render("index", {
    chainId: Blockchain.id,
    chainLength: Blockchain.getLength(),
    startedOn: Blockchain.timestamp,
    connectedNodes: Blockchain.getNodeCount(),
    defaultHost: defaultHost,
    defaultPort: defaultPort,
    displayMessage: messageStatus,
    message: messageVar
  });
  clearMessageVar();
});

// Home End-Point
Router.app.get("/", function(req, res) {
  res.render("index", {
    chainId: Blockchain.id,
    chainLength: Blockchain.getLength(),
    startedOn: Blockchain.timestamp,
    connectedNodes: Blockchain.getNodeCount(),
    defaultHost: defaultHost,
    defaultPort: defaultPort,
    displayMessage: messageStatus,
    message: messageVar
  });
});

Router.app.get("/src/arrow.png", function(req, res, next) {
  res.sendFile(__dirname + "/src/arrow.png");
});

Router.app.get("/src/background.jpg", function(req, res, next) {
  res.sendFile(__dirname + "/src/background.jpg");
});

Router.app.get("/src/Block.gif", function(req, res, next) {
  res.sendFile(__dirname + "/src/Block.gif");
});

// To get Blockchain Information
Router.app.get("/info", function(req, res) {
  let chaininfo = { Chain: Blockchain.Chain, Nodes: Blockchain.nodes };
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

/*************************************************
 * Output Needed
 *
 *************************************************/

// To Debug Blockchain
Router.app.get("/debug", function(req, res) {
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

// To Reset Whole Chain
Router.app.get("/reset-chain", function(req, res) {
  var message = {
    message: "The chain was reset to its genesis block"
  };

  res.send(message);
});

// Returns All Blocks  Information in JSON format
Router.app.get("/blocks", function(req, res) {
  res.send(JSON.stringify(Blockchain.chain, null, 4));
});

// Goes to Faucet to pour coin
Router.app.get("/faucet", function(req, res) {
  res.render("faucet", {
    addressWallet: Blockchain.addressWallet,
    balance: Blockchain.getAddressBallance(Blockchain.addressWallet),
    displayMessage: messageStatus,
    message: messageVar
  });
  clearMessageVar();
});

// Goes to Faucet to pour coin
Router.app.get("/wallet", function(req, res) {
  //res.send('This is Wallet Page..coming up')
  //res.sendFile(__dirname + "/wallet.html");
  res.render("wallet");
});

// Goes to Faucet to pour coin
Router.app.get("/test", function(req, res) {
  res.send("This is test Page..coming up");
});



// Socket IO conncetion

Blockchain.io.on("connection", function(socket) {
  console.log("Socket connected, ID", socket.id);
  socket.on("disconnect", function() {
    console.log("user disconnected, ID", socket.id);
  });
});

/*
Blockchain.io.on(socketActions.MY_ADDRESS, function(address) {
  console.log("New node address", address);
});
*/
/*Test comment added */

Router.app.post("/nodes", urlencodedParser, function(req, res) {
  const { hostname, port, chain, walletAddress } = req.body;
  console.log("Print body ", req.body);
  const { callback } = req.query;
  const node = `http://${hostname}:${port}`;
  const socketNode = socketListener(Router.client(node), Blockchain);
  Blockchain.addNode(socketNode, Blockchain);
  if (callback === "true") {
    console.info(`Added node ${node} back`);
    Blockchain.chain = chain;
    Blockchain.addressWallet = walletAddress;
    res.json({ status: "Added node Back" }).end();
  } else {
    axios.post(`${node}/nodes?callback=true`, {
      hostname: hostname,
      port: port2,
      chain: Blockchain.chain,
      walletAddress: Blockchain.addressWallet
    });
    messageVar = `${node} successfully added`;
    messageStatus = true;
    res.redirect("/home");
  }
});

Router.app.post("/transaction", (req, res) => {
  const { sender, receiver, amount, description } = req.body;
  Blockchain.io.emit(
    socketActions.ADD_TRANSACTION,
    sender,
    receiver,
    amount,
    description
  );
  res.json({ message: "transaction success" }).end();
});

Router.app.post("/receiveform", urlencodedParser, function(req, res) {
  const address = req.body.address;
  if (address != undefined && address != "") {
    Blockchain.giveAwayFaucetCoin(address, Blockchain);

    messageVar = `Free Coin Sent Successfully to ${address}`;
    messageStatus = true;
    res.redirect("/faucet");
  }
});

// Creating New Wallet
Router.app.get("/createwallet", function(req, res, next) {
  Wallet.createNewWallet();
  messageVar = `New Wallet successfully created, Please note down and store the seeds for recovery: `;
  messageStatus = true;
  res.render("wallet", {
    privateKey: Wallet.privateKey,
    publicKey: Wallet.publicKey,
    address : Wallet.address,
    seed : Wallet.getSeed(),
    displayMessage: messageStatus,
    message: messageVar
  });

});


/*var Block2 = new BlockClass(0,Date.now(),"New Block 2","0");
Blockchain.addBlock(Block);
Blockchain.addBlock(Block2);*/

//jkChainObjext.addBlock(new blockObject.block("12/16/2018",{amount:67}));

// blockChain.addNode(socketListeners(client(`http://localhost:${PORT}`), blockChain));

// httpServer.listen(PORT, () => console.info(`Express server running on ${PORT}...`));

// Default Port 5550, application listening on 5550

if (process.argv[2] == undefined) {
  port2 = 5550;
} else {
  port2 = process.argv[2];
}

// Checks the status of a single port
portscanner.checkPortStatus(port2, "localhost", function(error, status) {
  // Status is 'open' if currently in use or 'closed' if available
  //console.log(port2 +" "+ status);
  port_status = status;

  if (port_status == "closed") {
    console.log(port2 + " is available");

    ListenPort(port2);
  } else if (port_status == "open") {
    console.log(
      port2 + " is already opened, Please use node main.js <differtport>"
    );
  }
});

console.log(JSON.stringify(Blockchain.chain, null, 4));
console.log("Is blockchain valid?" + Blockchain.checkValid());

function clearMessageVar() {
  messageStatus = false;
  messageVar = "";
}

function ListenPort(PORT) {
  Router.http.listen(PORT, function() {
    console.log(`Living at URL http://localhost:${PORT}`);
  });

  //let client = Router.client(`http://localhost:${PORT}`);
  Blockchain.addNode(
    socketListener(Router.client(`http://localhost:${PORT}`), Blockchain)
  );
  // Blockchain.address("test");
}
