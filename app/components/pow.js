/****************************************************/
/* Proof of Work                                    */
/* Date Create : December 06,2018                   */
/* Team : Thulaja,Calvin,Jey                         */
/* Developed by : Jey                               */
/****************************************************/
const crypto = require('crypto');


const generateProof = (previousProof) => new Promise((resolve) => {
  setImmediate(async () => {
    let proof = Math.random() * 10000000001;
    let proofHex;
    const dontMine = process.env.BREAK;
    if (isProofValid(previousProof, proof,proofHex) || dontMine === 'true') {
      resolve({ proof, proofHex,dontMine });
    } else  {
      resolve(await generateProof2(previousProof));
    }
  });
});

const isProofValid = (previousProof, currentProof,proofHex) => {
  const difference = currentProof - previousProof;
  const proofString = `difference-${difference}`;
  const hashFunction = crypto.createHash('sha256');
  hashFunction.update(proofString);
  proofHex = hashFunction.digest('hex');
  //console.log("ProofHex :"+proofHex);
  if (proofHex.includes('00')) {
    return true;
  }
  return false;
};

const generateProof2 = (previousProof) => new Promise((resolve) => {
  setImmediate(async () => {
    let proof = Math.random() * 10000000001;
    let proofHex;
    const dontMine = process.env.BREAK;
    if (isProofValid(previousProof, proof,proofHex) || dontMine === 'true') {
      resolve({ proof, proofHex,dontMine });
    } else  {
      resolve(await generateProof(previousProof));
    }
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});
exports.generateProof = generateProof;
exports.isProofValid = isProofValid;