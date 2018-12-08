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


// Instatiaze Blockchain and Block constructors
let Blockchain = new BlockchainClass();   // This will create Genesis Block
let Block = new BlockClass(1,Date.now(),"New Block 1","0");  // adding new Block
let Router = new RouterClass();

var Block2 = new BlockClass(0,Date.now(),"New Block 2","0");
Blockchain.addBlock(Block);
Blockchain.addBlock(Block2);

//jkChainObjext.addBlock(new blockObject.block("12/16/2018",{amount:67}));

console.log(JSON.stringify(Blockchain,null,4));
console.log("Is blockchain valid?" + Blockchain.checkValid());

/***** Router Functions  */

Router.router.use(function(req,res,next) {
    console.log("/" + req.method);
    next();
  });

 // Home End-Point
Router.app.get('/', function (req, res) {
    res.send('Kings Land Blockchain Project!')
})

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
    res.send('This is Test Info API')

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
    res.send(JSON.stringify(Blockchain,null,4))
  })

//Router.app.use("/api",Router.router);

// Default Port 5550, application listening on 5550
Router.app.listen(5550,function(){
    console.log("Living at Port http://localhost:5550");
});


