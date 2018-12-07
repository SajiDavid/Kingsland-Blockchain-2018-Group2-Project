/****************************************************/
/* BLOCK Class                                      */
/* Date Create : December 06,2018                   */
/* Team : Tulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/




 require('./app/components/blockchain');
 require('./app/components/block');

 import BlockChain from './app/components/blockchain';

//let BlockChain2 = BlockChain();
let Block = new Block();
//var Block2 = new Block("12/15/2018", {amount:20});
BlockChain.addBlock(Block);
//jkChainObjext.addBlock(new blockObject.block("12/16/2018",{amount:67}));

console.log(JSON.stringify(BlockChain,null,4));
console.log("Is blockchain valid?" + BlockChain.checkValid());
