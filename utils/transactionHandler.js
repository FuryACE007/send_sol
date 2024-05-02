const { Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// This function will handle the creation and signing of a SOL transfer transaction.
// It takes the sender's public key, the recipient's address, the amount in lamports, and the signTransaction function from the wallet.
async function transferSOL(senderPublicKey, recipientAddress, amount, signTransaction) {
  // Create a new transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: recipientAddress,
      lamports: amount,
    })
  );

  // Sign the transaction using the wallet's signTransaction function
  const signedTransaction = await signTransaction(transaction);

  // Return the signed transaction
  return signedTransaction;
}

module.exports = {
  transferSOL,
};
