/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/




// Load Blockchain and Block Classes
let BlockClass = require('./app/components/block');
let BlockchainClass = require('./app/components/blockchain');

// Instatiaze Blockchain and Block constructors
let Blockchain = new BlockchainClass();   // This will create Genesis Block
let Block = new BlockClass(2,Date.now(),"New Block 1","0");  // adding new Block


//var Block2 = new Block("12/15/2018", {amount:20});
Blockchain.addBlock(Block);
//jkChainObjext.addBlock(new blockObject.block("12/16/2018",{amount:67}));

console.log(JSON.stringify(Blockchain,null,4));
console.log("Is blockchain valid?" + Blockchain.checkValid());
