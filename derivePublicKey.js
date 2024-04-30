const fs = require('fs');
const solanaWeb3 = require('@solana/web3.js');

// Read the environment variables from the .env.local file
require('dotenv').config({ path: './.env.local' });

// Convert the private key from a byte array to a Uint8Array
const secretKeyUint8Array = new Uint8Array(Object.values(JSON.parse(process.env.GAS_SPONSOR_PRIVATE_KEY)));

// Create a keypair from the secret key
const keypair = solanaWeb3.Keypair.fromSecretKey(secretKeyUint8Array);

// Log the public key in base58 format
console.log(keypair.publicKey.toBase58());
