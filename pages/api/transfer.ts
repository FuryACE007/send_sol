import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Parse the request body to get the recipient's wallet address and the amount of SOL to be transferred
      const { recipient, amount } = req.body;
      if (!recipient || !amount || typeof amount !== 'number') {
        return res.status(400).json({ error: 'Recipient and amount are required and amount must be a number.' });
      }

      // Check if the GAS_SPONSOR_SECRET_KEY is defined
      if (!process.env.GAS_SPONSOR_SECRET_KEY) {
        console.error('GAS_SPONSOR_SECRET_KEY is not defined in the environment variables.');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      // Convert the secret key from environment variable to Uint8Array
      const secretKeyUint8Array = Uint8Array.from(process.env.GAS_SPONSOR_SECRET_KEY.split(',').map(num => parseInt(num, 10)));
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
          fromPubkey: gasSponsorKeypair.publicKey,
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
