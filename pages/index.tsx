import React from 'react';
import TransferForm from '../components/TransferForm';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Solana Token Transfer dApp</h1>
      <p>This dApp allows you to transfer SOL tokens with the transaction fees sponsored.</p>
      <TransferForm />
    </div>
  );
};

export default HomePage;
