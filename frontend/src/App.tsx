import { useState } from 'react';
import { SearchInput } from './components/SearchInput';
import { ScanResults } from './components/ScanResults';
import { TransactionResult } from './components/TransactionResult';
import { scanWallet, scanENS, analyzeTransaction, ScanResult, TransactionAnalysis } from './lib/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [txAnalysis, setTxAnalysis] = useState<TransactionAnalysis | null>(null);

  const handleSearch = async (query: string, type: 'address' | 'ens' | 'tx') => {
    setLoading(true);
    setError(null);
    setScanResult(null);
    setTxAnalysis(null);

    try {
      if (type === 'tx') {
        const result = await analyzeTransaction(query);
        setTxAnalysis(result);
      } else if (type === 'ens') {
        const result = await scanENS(query);
        setScanResult(result);
      } else {
        const result = await scanWallet(query);
        setScanResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">MEV Guard</h1>
        <p className="text-gray-400">AI-powered MEV attack detector for Ethereum wallets</p>
      </header>

      <SearchInput onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg max-w-2xl w-full">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="mt-8">
        {scanResult && <ScanResults result={scanResult} />}
        {txAnalysis && <TransactionResult analysis={txAnalysis} />}
      </div>

      <footer className="mt-auto pt-12 text-center text-sm text-gray-500">
        <p>Built by tavialiu.eth</p>
      </footer>
    </div>
  );
}

export default App;
