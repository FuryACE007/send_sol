import { useMemo } from 'react';
import { Connection, Keypair, clusterApiUrl, SystemProgram, LAMPORTS_PER_SOL, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

export const useUmi = (privateKey: string) => {
  // Decode the base58 private key string to a Uint8Array
  const privateKeyBytes = bs58.decode(privateKey);

  // Log the length of the privateKeyBytes for debugging purposes
  console.log(`Decoded private key length: ${privateKeyBytes.length}`);

  // Check if the decoded private key is of the correct size (64 bytes for Solana Keypair)
  if (privateKeyBytes.length !== 64) {
    throw new Error(`Invalid private key size. Expected 64 bytes, got ${privateKeyBytes.length}`);
  }

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
