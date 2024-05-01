import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const TransferForm = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implement the submit functionality using the Umi instance
    console.log('Recipient:', recipient);
    console.log('Amount:', amount);
  };

  return (
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
        label="Amount (SOL)"
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
        Transfer SOL
      </Button>
    </Box>
  );
};

export default TransferForm;
