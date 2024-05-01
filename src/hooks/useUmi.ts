import { Connection, Keypair } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsRpc } from '@metaplex-foundation/umi-rpc-web3js';

// Check if the environment variables are defined
const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
const gasSponsorPrivateKey = process.env.GAS_SPONSOR_PRIVATE_KEY;

if (!rpcEndpoint || !gasSponsorPrivateKey) {
  throw new Error('Environment variables for RPC endpoint or gas sponsor private key are not defined.');
}

// Convert the private key string to a Uint8Array
const privateKeyBytes = Uint8Array.from(gasSponsorPrivateKey.split(',').map(s => parseInt(s, 10)));

// Generate a Keypair from the private key bytes
const signer = Keypair.fromSecretKey(privateKeyBytes);

// Create the Umi instance
const umi = createUmi(rpcEndpoint);

// Use the web3JsRpc plugin to set the RPC implementation to use the @solana/web3.js library
umi.use(web3JsRpc(new Connection(rpcEndpoint)));

// Export the useUmi hook
export const useUmi = () => {
  return umi;
};
