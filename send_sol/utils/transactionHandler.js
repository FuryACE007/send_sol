const { Keypair, SystemProgram, Transaction } = require('@solana/web3.js');
const { createWeb3JsTransactionFactory } = require('@metaplex-foundation/umi-transaction-factory-web3js');

// This function will handle the creation and sending of a SOL transfer transaction.
// It takes the sender's signer, the recipient's public key, and the amount of SOL to send.
async function transferSOL(signer, recipientPublicKeyString, amount) {
  // Convert the recipient public key string to a PublicKey object
  const recipientPublicKey = new PublicKey(recipientPublicKeyString);

  // Create a transaction factory using the signer
  const transactionFactory = createWeb3JsTransactionFactory(signer);

  // Define the transfer instruction using SystemProgram.transfer
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: signer.publicKey,
    toPubkey: recipientPublicKey,
    lamports: amount * LAMPORTS_PER_SOL // Convert SOL to lamports
  });

  // Create a transaction
  const transaction = new Transaction().add(transferInstruction);

  // Sign the transaction
  const signedTransaction = await transactionFactory.signTransaction(transaction);

  // Send the transaction to the Solana blockchain
  // This part will require a connection to the Solana cluster and should be handled accordingly
  // The connection and sending logic will be implemented here

  return signedTransaction;
}

module.exports = { transferSOL };
