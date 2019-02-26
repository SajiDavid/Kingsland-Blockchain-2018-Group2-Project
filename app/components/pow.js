/****************************************************/
/* Proof of Work                                    */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/
const crypto = require('crypto');
let constants = require("../util/constants");

const generateProof = (previousProof) => new Promise((resolve) => {
  setImmediate(async () => {
    let proof = Math.random() * 10000000001;
    const dontMine = process.env.BREAK;
    const {
      validFlag,
      proofHex
    } = isProofValid(previousProof, proof);

    if (validFlag == true || dontMine === 'true') {
      resolve({
        proof,
        proofHex,
        dontMine
      });
    } else {
      resolve(await generateProof2(previousProof));
    }
  });
});

const isProofValid = (previousProof, currentProof) => {
  let proofHex;
  const difference = currentProof - previousProof;
  const proofString = `difference-${difference}`;
  const hashFunction = crypto.createHash('sha256');
  hashFunction.update(proofString);
  proofHex = hashFunction.digest('hex');
  //console.log("ProofHex :"+proofHex);
  const zeros = new Array(constants.CURRENT_DIFFICULTY + 1).join("0");
  //if (proofHex.includes('00')) {
  //  console.log("String:  "+proofHex.substring(0,2)+" Zeros: "+zeros);
  if (proofHex.substring(0, constants.CURRENT_DIFFICULTY) === zeros) {
    return {
      validFlag: true,
      proofHex: proofHex
    };
  }
  return false;
};

const generateProof2 = (previousProof) => new Promise((resolve) => {
  setImmediate(async () => {
    let proof = Math.random() * 10000000001;

    const dontMine = process.env.BREAK;
    const {
      validFlag,
      proofHex
    } = isProofValid(previousProof, proof);

    if (validFlag == true || dontMine === 'true') {
      resolve({
        proof,
        proofHex,
        dontMine
      });
    } else {
      resolve(await generateProof(previousProof));
    }
  });
});

process.on('unhandledRejection', (reason, promise) => {
  //console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});
exports.generateProof = generateProof;
exports.isProofValid = isProofValid;