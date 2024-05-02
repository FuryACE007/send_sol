const { Keypair } = require('@solana/web3.js');

// This function will convert a private key string to a Keypair object.
// It is crucial to keep the private key secure and not expose it in the code.
// The actual private key should be provided as an environment variable or through a secure channel.
function generateSigner(privateKeyString) {
  // Convert the private key string to a Uint8Array
  const privateKeyBytes = Uint8Array.from(privateKeyString.split(',').map(num => parseInt(num, 10)));

  // Generate a Keypair from the private key bytes
  const signer = Keypair.fromSeed(privateKeyBytes);

  return signer;
}

module.exports = { generateSigner };
