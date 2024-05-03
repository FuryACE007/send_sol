import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const TransferForm = () => {
  const { publicKey, signTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (!publicKey) {
        alert('Please connect your wallet.');
        return;
      }

      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      if (isNaN(lamports)) {
        alert('Invalid amount.');
        return;
      }

      // Check if the environment variable is defined
      if (!process.env.NEXT_PUBLIC_GAS_SPONSOR_PRIVATE_KEY) {
        console.error('Gas sponsor private key is not defined in the environment variables.');
        alert('Transfer failed. Gas sponsor private key is not available.');
        return;
      }

      const gasSponsorPrivateKey = process.env.NEXT_PUBLIC_GAS_SPONSOR_PRIVATE_KEY.split(',').map(s => parseInt(s, 10));
      const gasSponsorKeypair = Keypair.fromSecretKey(new Uint8Array(gasSponsorPrivateKey));

      // Create a new transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: lamports,
        })
      );

      // Sign the transaction using the wallet's signTransaction function
      if (signTransaction) {
        const signedTransaction = await signTransaction(transaction);

        // Serialize the signed transaction
        const serializedTransaction = signedTransaction.serialize();

        // Send the signed transaction to the server
        const response = await fetch('/api/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signedTransaction: serializedTransaction,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Transaction signature:', data.signature);
        alert(`Transfer successful! Transaction signature: ${data.signature}`);
      } else {
        throw new Error('Wallet not connected properly. signTransaction function is undefined.');
      }
    } catch (error) {
      console.error('Error submitting transfer:', error);
      alert('Transfer failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Transfer SOL
        </Typography>
        <WalletMultiButton />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="recipient"
            label="Recipient Wallet Address"
            name="recipient"
            autoComplete="recipient"
            autoFocus
            value={recipient}
            onChange={handleRecipientChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="amount"
            label="Amount of SOL"
            type="number"
            id="amount"
            autoComplete="amount"
            value={amount}
            onChange={handleAmountChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Send SOL
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TransferForm;
