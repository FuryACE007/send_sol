import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, Transaction, Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Parse the request body to get the recipient address and amount
      const { recipientAddress, amount } = req.body;
      if (!recipientAddress || !amount) {
        return res.status(400).json({ error: 'Recipient address and amount are required.' });
      }

      // Retrieve the gas sponsor's private key from the environment variable
      const gasSponsorPrivateKey = process.env.NEXT_PUBLIC_GAS_SPONSOR_PRIVATE_KEY;
      if (!gasSponsorPrivateKey) {
        return res.status(500).json({ error: 'Gas sponsor private key not found.' });
      }

      // Convert the private key string to a Uint8Array
      const privateKeyBytes = new Uint8Array(gasSponsorPrivateKey.split(',').map(s => parseInt(s, 10)));

      // Generate a Keypair from the private key bytes
      const gasSponsorKeypair = Keypair.fromSecretKey(privateKeyBytes);

      // Create a new connection to the Solana devnet
      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://devnet.helius-rpc.com/?api-key=7514a7bd-79b3-44f0-b42b-8db3c48038a7';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      // Create a new transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: gasSponsorKeypair.publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: amount * LAMPORTS_PER_SOL, // Assuming amount is in SOL, not lamports
        })
      );

      // Sign the transaction with the gas sponsor's Keypair
      transaction.sign(gasSponsorKeypair);

      // Serialize the signed transaction
      const serializedTransaction = transaction.serialize();

      // Send the serialized transaction to the Solana blockchain
      const signature = await connection.sendRawTransaction(serializedTransaction);

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
