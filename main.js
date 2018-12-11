/****************************************************/
/* Main Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/




// Load Blockchain and Block Classes
let BlockClass = require('./app/components/block');
let BlockchainClass = require('./app/components/blockchain');
let RouterClass = require('./app/routes/routes');
let socketListener = require('./app/components/socketlistener');
let socketActions = require('./app/util/constants');
let bodyParser = require('body-parser');
let axios = require('axios');


// Instatiaze Blockchain and Block constructors
let Router = new RouterClass();
let Blockchain = new BlockchainClass(Router.io);   // This will create Genesis Block
let Block = new BlockClass(1,Date.now(),"New Block 1","0");  // adding new Block

Router.app.use(bodyParser.json());

const  PORT  = process.argv[2];

/***** Router Functions  */


/* End Pointt 
    /               ->  Home
    /info           ->  Blockchain Information  
    /debug          ->  Debug Chain
    /reset-chain    ->  Reset Block chain to initial state
    /blocks         ->  List Blocks
*/ 


/*Router.app.configure(function() {
    Router.app.use(Router.express.static(__dirname + '/public'));
    Router.app.use(Router.express.errorHandler({ dumpExceptions: true, showStack: true }));
});*/

//Router.router.use(Router.express.static(path.join(__dirname, 'bower_components')));

Router.router.use(function(req,res,next) {
    console.log("/" + req.method);
    next();
  });

 // Home End-Point
Router.app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    //res.send('Kings Land Blockchain Project!')
});

Router.app.get('/src/arrow.png', function (req, res, next) {
    res.sendFile(__dirname+'/src/arrow.png');
});

Router.app.get('/src/background.jpg', function (req, res, next) {
    res.sendFile(__dirname+'/src/background.jpg');
});

Router.app.get('/src/Block.gif', function (req, res, next) {
    res.sendFile(__dirname+'/src/Block.gif');
});

// To get Blockchain Information
Router.app.get('/info', function (req, res) {
    res.send('This is Test Info API')

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
})

/*************************************************
 * Output Needed
 * 
 *************************************************/

// To Debug Blockchain
Router.app.get('/debug', function (req, res) {
    res.send('This is Test Debug api')

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

})

// To Reset Whole Chain
Router.app.get('/reset-chain', function (req, res) {
    var message = {
        "message" : "The chain was reset to its genesis block"
        };

    res.send(message)

/*************************************************
 * Output Needed
 * 
 * {
"message" : "The chain was reset to its genesis block"
}
*************************************************/

});

// Returns All Blocks  Information in JSON format
  Router.app.get('/blocks', function (req, res) {
    res.send(JSON.stringify(Blockchain.chain,null,4))
  });

// Socket IO conncetion

Router.io.on('connection',function(socket){
    console.log('Socket connected, ID', socket.id);
    socket.on('disconnect',function(){
        console.log('user disconnected, ID', socket.id);
    });

});

/*Test comment added */

/*
 // Returns Socket.io runtime object
Router.app.get('/socket.io/socket.io.js', function (req, res) {
      res.sendFile(__dirname+'/node_modules/socket.io-client/dist/socket.io.js');
});*/



Router.app.post('/nodes', (req, res) => {
    const { host, port } = req.body;
    console.log("Print body ",req.body);
    const { callback } = req.query;
    const node = `http://${host}:${port}`;
    const socketNode = socketListener(Router.client(node), Blockchain);
    Blockchain.addNode(socketNode, Blockchain);
    if (callback === 'true') {
      console.info(`Added node ${node} back`);
      res.json({ status: 'Added node Back' }).end();
    } else {
      axios.post(`${node}/nodes?callback=true`, {
        host: req.hostname,
        port: PORT,
      });
      console.info(`Added node ${node}`);
      res.json({ status: 'Added node' }).end();
    }
  });

  Router.app.post('/transaction', (req, res) => {
    const { sender, receiver, amount } = req.body;
    Router.io.emit(socketActions.ADD_TRANSACTION, sender, receiver, amount);
    res.json({ message: 'transaction success' }).end();
  });
  
/*var Block2 = new BlockClass(0,Date.now(),"New Block 2","0");
Blockchain.addBlock(Block);
Blockchain.addBlock(Block2);*/

//jkChainObjext.addBlock(new blockObject.block("12/16/2018",{amount:67}));
Blockchain.addNode(socketListener(Router.client(`http://localhost:${PORT}`), Blockchain));

// blockChain.addNode(socketListeners(client(`http://localhost:${PORT}`), blockChain));

// httpServer.listen(PORT, () => console.info(`Express server running on ${PORT}...`));

// Default Port 5550, application listening on 5550
Router.http.listen(PORT,function(){
    console.log(`Living at URL http://localhost:${PORT}`);
});

console.log(JSON.stringify(Blockchain.chain,null,4));
console.log("Is blockchain valid?" + Blockchain.checkValid());

