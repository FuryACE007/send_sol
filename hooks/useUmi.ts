import { useMemo } from 'react';
import { Connection, Keypair, clusterApiUrl, SystemProgram, LAMPORTS_PER_SOL, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

export const useUmi = (privateKey: string) => {
  // Convert the private key string to a Uint8Array
  const privateKeyBytes = Uint8Array.from(privateKey.split(',').map(s => parseInt(s, 10)));

  // Generate a Keypair from the private key bytes
  const signer = Keypair.fromSecretKey(privateKeyBytes);

  // Initialize Umi instance with the necessary configurations
  const umi = useMemo(() => {
    const network = clusterApiUrl('devnet');
    const connection = new Connection(network, 'confirmed');

    return {
      signer,
      connection,
    };
  }, [signer]);

  // Provide the `transferSol` function to create and sign a transaction for transferring SOL
  const transferSol = async (recipientAddress: string, amount: number) => {
    // Convert recipientAddress to PublicKey
    const recipientPublicKey = new PublicKey(recipientAddress);

    // Create a Transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: signer.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(umi.connection, transaction, [signer]);

    // Confirm the transaction
    const confirmResult = await umi.connection.confirmTransaction(signature, 'confirmed');

    return { signature, confirmResult };
  };

  return { umi, transferSol };
};
