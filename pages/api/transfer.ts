import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Parse the request body to get the signed transaction
      const { signedTransaction } = req.body;
      if (!signedTransaction) {
        return res.status(400).json({ error: 'Signed transaction is required.' });
      }

      // Create a new connection to the Solana devnet
      const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://devnet.helius-rpc.com/?api-key=7514a7bd-79b3-44f0-b42b-8db3c48038a7';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      // Send the signed transaction to the Solana blockchain
      const signature = await connection.sendRawTransaction(signedTransaction);

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
