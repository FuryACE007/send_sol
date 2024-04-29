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
      const gasSponsorKeypair = Keypair.fromSecretKey(secretKeyUint8Array);

      // Create a new connection to the Solana devnet
      const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://devnet.helius-rpc.com/?api-key=7514a7bd-79b3-44f0-b42b-8db3c48038a7';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      // Fetch the recent blockhash
      const { blockhash } = await connection.getRecentBlockhash();

      // Create a transaction
      const transaction = new Transaction({
        recentBlockhash: blockhash
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(senderPublicKey), // Use the connected user's wallet public key as the sender
          toPubkey: new PublicKey(recipient),
          lamports: LAMPORTS_PER_SOL * amount
        })
      );

      // Sign the transaction with the gas sponsor's keypair
      transaction.sign(gasSponsorKeypair);

      // Send the transaction to the Solana blockchain
      const signature = await connection.sendRawTransaction(transaction.serialize());

      // Confirm the transaction
      const confirmResult = await connection.confirmTransaction(signature, 'confirmed');

      // Respond with the result of the transaction submission
      res.status(200).json({ signature, confirmResult });
    } catch (error: any) {
      console.error('Error processing transfer:', error);
      res.status(500).json({ error: 'Error processing transfer', errorMessage: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
