import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

const TransferForm = () => {
  const { publicKey, signTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validate the amount to ensure it's a number and greater than 0
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount of SOL to send.');
      setIsSubmitting(false);
      return;
    }

    // Ensure all fields are filled
    if (!publicKey || !recipient) {
      alert('Please make sure all fields are filled and your wallet is connected.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderPublicKey: publicKey.toBase58(),
          recipient,
          amount: parsedAmount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const { serializedTransaction } = await response.json();
      const transaction = Transaction.from(bs58.decode(serializedTransaction));

      if (signTransaction) {
        const signedTransaction = await signTransaction(transaction);
        const serializedSignedTransaction = signedTransaction.serialize();

        const submitResponse = await fetch('/api/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signedTransaction: bs58.encode(serializedSignedTransaction),
          }),
        });

        if (!submitResponse.ok) {
          throw new Error(`Error: ${submitResponse.status}`);
        }

        const submitData = await submitResponse.json();
        console.log('Transaction signature:', submitData.signature);
        alert(`Transfer successful! Transaction signature: ${submitData.signature}`);
      } else {
        throw new Error('Wallet not connected or signTransaction function not available');
      }
    } catch (error) {
      console.error('Error submitting transfer:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          {/* Removed Gas Sponsor Private Key field as it's no longer needed */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send SOL'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TransferForm;
