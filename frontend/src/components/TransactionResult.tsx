import { TransactionAnalysis } from '../lib/api';

interface Props {
  analysis: TransactionAnalysis;
}

export function TransactionResult({ analysis }: Props) {
  return (
    <div className="w-full max-w-2xl">
      <div className="p-6 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transaction Analysis</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            analysis.isMEVAttack 
              ? 'bg-red-900/50 text-red-300' 
              : 'bg-green-900/50 text-green-300'
          }`}>
            {analysis.isMEVAttack ? 'MEV Attack Detected' : 'Clean'}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="p-3 bg-gray-700 rounded">
            <p className="text-sm text-gray-400">Transaction Hash</p>
            <code className="text-sm">{analysis.txHash}</code>
          </div>
          <div className="p-3 bg-gray-700 rounded">
            <p className="text-sm text-gray-400">Block Number</p>
            <p>{analysis.blockNumber}</p>
          </div>
        </div>

        {analysis.isMEVAttack && analysis.attack && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded mb-4">
            <h3 className="font-medium text-red-300 mb-2">Attack Details</h3>
            <div className="text-sm space-y-2">
              <p>
                <span className="text-gray-400">Type:</span> {analysis.attackType}
              </p>
              <p>
                <span className="text-gray-400">Frontrun:</span>{' '}
                <code>{analysis.attack.frontrunTxHash.slice(0, 20)}...</code>
              </p>
              <p>
                <span className="text-gray-400">Backrun:</span>{' '}
                <code>{analysis.attack.backrunTxHash.slice(0, 20)}...</code>
              </p>
              <p>
                <span className="text-gray-400">Attacker:</span>{' '}
                <code>{analysis.attack.attackerAddress.slice(0, 20)}...</code>
              </p>
            </div>
          </div>
        )}

        {analysis.aiExplanation && (
          <div className="p-4 bg-blue-900/30 border border-blue-700 rounded mb-4">
            <h3 className="font-medium text-blue-300 mb-2">AI Explanation</h3>
            <p className="text-gray-200">{analysis.aiExplanation}</p>
          </div>
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="p-4 bg-gray-700 rounded">
            <h3 className="font-medium mb-2">Recommendations</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
