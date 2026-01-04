import { useState } from 'react';
import { scanWallet, ScanResult } from './lib/api';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = query.trim();
    if (!input) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await scanWallet(input);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold">MEV Guard</span>
          </div>
          <a href="https://github.com/tavia-liu/mev-guard" target="_blank" className="text-sm text-gray-400 hover:text-white">
            GitHub
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">AI-Powered MEV Attack Detector</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Scan any Ethereum wallet to detect sandwich attacks and front-running. See how much you've lost to MEV bots.
        </p>

        <form onSubmit={handleScan} className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter wallet address or ENS (try: vitalik.eth)"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scanning
                </span>
              ) : 'Scan'}
            </button>
          </div>
        </form>
      </section>

      {/* Error */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <section className="max-w-5xl mx-auto px-4 pb-16">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Wallet</p>
              <p className="font-mono text-sm">{result.ensName || fmt(result.walletAddress)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Transactions Scanned</p>
              <p className="text-2xl font-bold">{result.totalTransactions}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">MEV Attacks Found</p>
              <p className="text-2xl font-bold text-red-400">{result.attackedTransactions}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Estimated Loss</p>
              <p className="text-2xl font-bold text-red-400">${result.totalLossUSD}</p>
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Attack Rate</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                result.riskLevel === 'high' ? 'bg-red-900/50 text-red-300' :
                result.riskLevel === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                'bg-green-900/50 text-green-300'
              }`}>
                {result.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  result.riskLevel === 'high' ? 'bg-red-500' :
                  result.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${result.totalTransactions > 0 ? Math.min((result.attackedTransactions / result.totalTransactions) * 100, 100) : 0}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {result.totalTransactions > 0 
                ? `${((result.attackedTransactions / result.totalTransactions) * 100).toFixed(1)}% of transactions affected`
                : 'No transactions to analyze'}
            </p>
          </div>

          {/* AI Report */}
          {result.aiReport && (
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="font-semibold text-blue-300">AI Analysis</span>
                <span className="text-xs text-gray-500 ml-auto">Powered by Claude</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{result.aiReport}</p>
            </div>
          )}

          {/* Attack List */}
          {result.attacks.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-semibold">Detected Attacks</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {result.attacks.map((attack, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Sandwich Attack
                        </span>
                        <span className="ml-2 text-sm text-gray-500">{attack.tokenPair}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-semibold">-${attack.victimLossUSD}</p>
                        <p className="text-xs text-gray-500">{fmtDate(attack.timestamp)}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-gray-500 text-xs mb-1">Your Transaction</p>
                        <code className="text-gray-300">{fmt(attack.victimTxHash)}</code>
                      </div>
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-gray-500 text-xs mb-1">Attacker</p>
                        <code className="text-gray-300">{fmt(attack.attackerAddress)}</code>
                      </div>
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-gray-500 text-xs mb-1">Block</p>
                        <code className="text-gray-300">{attack.blockNumber}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">How to Protect Yourself</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ['Use MEV Blocker RPC', 'Add mevblocker.io as your RPC endpoint'],
                ['Lower Slippage Tolerance', 'Set slippage to 0.5% or less when possible'],
                ['Use CoW Swap', 'DEX with built-in MEV protection'],
                ['Split Large Trades', 'Smaller trades are less attractive targets'],
              ].map(([title, desc], i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Built by <a href="https://twitter.com/tavialiu" className="text-blue-400 hover:underline">tavialiu.eth</a></p>
        </div>
      </footer>
    </div>
  );
}

export default App;
