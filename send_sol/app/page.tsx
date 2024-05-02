import dynamic from 'next/dynamic';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { generateSigner } from '../utils/generateSigner';
import { createWeb3JsTransactionFactory } from '@metaplex-foundation/umi-transaction-factory-web3js';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

// Dynamically import the components with no SSR
const DynamicComponentWithNoSSR = dynamic(
  () => import('../components/DynamicComponent'),
  { ssr: false }
);

const TestComponentWithNoSSR = dynamic(
  () => import('../components/TestComponent'),
  { ssr: false }
);

export default function Home() {
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">Solana Token Transfer</h1>
      <DynamicComponentWithNoSSR />
      <TestComponentWithNoSSR />
      <WalletMultiButton />
    </main>
  );
}
