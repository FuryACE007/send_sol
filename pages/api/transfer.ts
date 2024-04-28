import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { sendAndConfirmTransaction } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';

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

      // Create a new connection to the Solana devnet
      const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://devnet.helius-rpc.com/?api-key=7514a7bd-79b3-44f0-b42b-8db3c48038a7';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      // Create a transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: Keypair.fromSecretKey(secretKeyUint8Array).publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: LAMPORTS_PER_SOL * amount,
        })
      );

      // Sign the transaction with the gas sponsor's wallet
      const gasSponsorKeypair = Keypair.fromSecretKey(secretKeyUint8Array);
      transaction.sign(gasSponsorKeypair);

      // Send the transaction to the Solana blockchain
      const signature = await sendAndConfirmTransaction(connection, transaction, [gasSponsorKeypair]);

      // Respond with the result of the transaction submission
      res.status(200).json({ signature });
    } catch (error) {
      console.error('Error processing transfer:', error);
      res.status(500).json({ error: 'Error processing transfer' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
