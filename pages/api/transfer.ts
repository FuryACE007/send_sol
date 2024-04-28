import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { sendAndConfirmTransaction } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';

// This is a mock private key; replace with the actual private key of the gas sponsor wallet
const GAS_SPONSOR_SECRET_KEY = new Uint8Array([
  // The private key for the gas sponsor wallet should be securely retrieved from an environment variable or secret manager
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Parse the request body to get the recipient's wallet address and the amount of SOL to be transferred
      const { recipient, amount } = req.body;
      if (!recipient || !amount) {
        return res.status(400).json({ error: 'Recipient and amount are required.' });
      }

      // Create a new connection to the Solana devnet
      const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://devnet.helius-rpc.com/?api-key=7514a7bd-79b3-44f0-b42b-8db3c48038a7';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      // Create a transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: Keypair.fromSecretKey(GAS_SPONSOR_SECRET_KEY).publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: LAMPORTS_PER_SOL * amount,
        })
      );

      // Sign the transaction with the gas sponsor's wallet
      const gasSponsorKeypair = Keypair.fromSecretKey(GAS_SPONSOR_SECRET_KEY);
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
