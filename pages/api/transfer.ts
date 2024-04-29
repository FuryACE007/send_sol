import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Parse the request body to get the recipient's wallet address, the amount of SOL to be transferred, and the gas sponsor's private key
      const { recipient, amount, gasSponsorPrivateKey, senderPublicKey } = req.body;
      if (!recipient || !amount || typeof amount !== 'number' || !gasSponsorPrivateKey || !senderPublicKey) {
        return res.status(400).json({ error: 'Recipient, amount, gas sponsor private key, and sender public key are required. Amount must be a number.' });
      }

      // Convert the base58-encoded gas sponsor private key to a Uint8Array
      const secretKeyUint8Array = bs58.decode(gasSponsorPrivateKey);

      // Check if the secret key is of the correct size (64 bytes)
      if (secretKeyUint8Array.length !== 64) {
        return res.status(400).json({ error: 'Invalid gas sponsor private key size. It must be 64 bytes long.' });
      }

      const gasSponsorKeypair = Keypair.fromSecretKey(secretKeyUint8Array);

      // Create a new connection to the Solana devnet
      const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://devnet.helius-rpc.com/?api-key=7514a7bd-79b3-44f0-b42b-8db3c48038a7';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      // Fetch the recent blockhash
      const { blockhash } = await connection.getRecentBlockhash();

      // Validate that senderPublicKey and recipient are base58 strings
      if (!bs58.decodeUnsafe(senderPublicKey.trim()) || !bs58.decodeUnsafe(recipient.trim())) {
        return res.status(400).json({ error: 'Invalid senderPublicKey or recipient. They must be base58 strings.' });
      }

      // Create a transaction
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: gasSponsorKeypair.publicKey, // Set the feePayer to the gas sponsor's wallet
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(senderPublicKey.trim()), // Use the connected user's wallet public key as the sender
          toPubkey: new PublicKey(recipient.trim()),
          lamports: LAMPORTS_PER_SOL * amount
        })
      );

      // Serialize the transaction and send it to the frontend
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false // Do not require the gas sponsor's signature yet
      });

      // Respond with the serialized transaction for the frontend to sign
      res.status(200).json({ serializedTransaction: bs58.encode(serializedTransaction) });
    } catch (error: any) {
      console.error('Error processing transfer:', error);
      console.error('Full stack:', error.stack); // Added detailed error stack logging
      res.status(500).json({ error: 'Error processing transfer', errorMessage: error.message, errorStack: error.stack });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
