import { useMemo } from 'react';
import { useAllAttacks } from '../../data/hooks';
import { computeByTarget } from '../../reports/byTarget';
import { formatArrival } from '../../lib/format';

export function ByTarget() {
  const attacks = useAllAttacks();
  const summaries = useMemo(() => computeByTarget(attacks), [attacks]);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Per-defender summary</h1>
      <div className="overflow-x-auto rounded-lg ring-1 ring-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Defender</th>
              <th className="text-right px-3 py-2 font-medium">Total</th>
              <th className="text-right px-3 py-2 font-medium">Pending</th>
              <th className="text-right px-3 py-2 font-medium">Resolved</th>
              <th className="text-right px-3 py-2 font-medium">Split</th>
              <th className="text-right px-3 py-2 font-medium">Ignored</th>
              <th className="text-left px-3 py-2 font-medium">Earliest pending</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s) => (
              <tr key={s.player} className="border-t border-slate-800">
                <td className="px-3 py-2 font-medium">{s.player}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.total}</td>
                <td className="px-3 py-2 text-right tabular-nums text-amber-300">
                  {s.pending}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-300">
                  {s.resolved}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-sky-300">
                  {s.split}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-500">
                  {s.ignored}
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  {s.earliestPendingArrivalAt
                    ? formatArrival(s.earliestPendingArrivalAt)
                    : '—'}
                </td>
              </tr>
            ))}
            {summaries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
