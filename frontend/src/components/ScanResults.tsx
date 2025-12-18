import { ScanResult } from '../lib/api';

interface Props {
  result: ScanResult;
}

export function ScanResults({ result }: Props) {
  const attackRate = result.totalTransactions > 0
    ? ((result.attackedTransactions / result.totalTransactions) * 100).toFixed(1)
    : '0';

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="p-6 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Scan Results</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-700 rounded">
            <p className="text-sm text-gray-400">Total Transactions</p>
            <p className="text-2xl font-bold">{result.totalTransactions}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded">
            <p className="text-sm text-gray-400">MEV Attacks</p>
            <p className="text-2xl font-bold text-red-400">{result.attackedTransactions}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-700 rounded mb-4">
          <p className="text-sm text-gray-400">Attack Rate</p>
          <p className="text-2xl font-bold">{attackRate}%</p>
          <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all" 
              style={{ width: `${attackRate}%` }}
            />
          </div>
        </div>

        {result.aiReport && (
          <div className="p-4 bg-blue-900/30 border border-blue-700 rounded">
            <p className="text-sm text-blue-300 mb-1">AI Analysis</p>
            <p className="text-gray-200">{result.aiReport}</p>
          </div>
        )}
      </div>

      {result.attacks.length > 0 && (
        <div className="p-6 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Detected Attacks</h3>
          <div className="space-y-3">
            {result.attacks.map((attack, i) => (
              <div key={i} className="p-4 bg-gray-700 rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-red-400 font-medium">Sandwich Attack</span>
                  <span className="text-sm text-gray-400">Block {attack.blockNumber}</span>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-gray-400">
                    Victim: <code className="text-gray-300">{attack.victimTxHash.slice(0, 16)}...</code>
                  </p>
                  <p className="text-gray-400">
                    Attacker: <code className="text-gray-300">{attack.attackerAddress.slice(0, 16)}...</code>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
