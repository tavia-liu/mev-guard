import { useState } from 'react';

interface Props {
  onSearch: (query: string, type: 'address' | 'ens' | 'tx') => void;
  loading: boolean;
}

export function SearchInput({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let type: 'address' | 'ens' | 'tx' = 'address';
    if (query.endsWith('.eth')) {
      type = 'ens';
    } else if (query.length === 66) {
      type = 'tx';
    }
    onSearch(query.trim(), type);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wallet address, ENS name, or transaction hash"
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Try: vitalik.eth or any wallet address
      </p>
    </form>
  );
}
