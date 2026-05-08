import { useMemo, useState } from 'react';
import { useAllAttacks, useRepos } from '../../data/hooks';
import { computeDuplicates } from '../../reports/duplicates';
import { StatusBadge } from '../../components/StatusBadge';
import { formatArrival } from '../../lib/format';

export function Duplicates() {
  const attacks = useAllAttacks();
  const repos = useRepos();
  const groups = useMemo(() => computeDuplicates(attacks), [attacks]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const markRealAndIgnoreRest = async (groupKey: string, realId: string) => {
    const group = groups.find((g) => g.sourceVillageId === groupKey);
    if (!group) return;
    const fakeIds = group.attacks.filter((a) => a.id !== realId).map((a) => a.id);
    if (fakeIds.length) await repos.attacks.setStatusBulk(fakeIds, 'ignored');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Duplicate sources (suspected fakes)</h1>
        <p className="text-sm text-slate-400">
          {groups.length} sources hitting more than one target
        </p>
      </div>

      {groups.length === 0 && (
        <div className="rounded-lg ring-1 ring-slate-800 bg-slate-900/50 p-6 text-center text-slate-400">
          No duplicate sources detected.
        </div>
      )}

      <div className="space-y-2">
        {groups.map((g) => {
          const isOpen = expanded.has(g.sourceVillageId);
          return (
            <div
              key={g.sourceVillageId}
              className="rounded-lg ring-1 ring-slate-800 bg-slate-900/50"
            >
              <button
                onClick={() => toggle(g.sourceVillageId)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-900"
              >
                <span className="text-slate-500 text-xs">{isOpen ? '▼' : '▶'}</span>
                <div className="flex-1">
                  <div className="font-medium">
                    {g.attacker || '—'}
                    <span className="text-slate-400 ml-2">
                      {g.sourceVillageName} ({g.sourceCoords.x}|{g.sourceCoords.y})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    earliest arrival {formatArrival(g.earliestArrivalAt)}
                  </div>
                </div>
                <span className="rounded-full bg-rose-900/40 ring-1 ring-rose-800/60 text-rose-200 text-xs px-2 py-0.5">
                  {g.uniqueTargets} targets
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-800 px-4 py-3 space-y-2">
                  <p className="text-xs text-slate-400">
                    Click "Real" on the one you believe is the actual nuke; the
                    rest will be marked <code>ignored</code>.
                  </p>
                  <table className="min-w-full text-sm">
                    <thead className="text-slate-500 text-xs uppercase">
                      <tr>
                        <th className="text-left py-1">Arrival</th>
                        <th className="text-left py-1">Target player</th>
                        <th className="text-left py-1">Target village</th>
                        <th className="text-left py-1">Type</th>
                        <th className="text-left py-1">Status</th>
                        <th className="text-right py-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.attacks.map((a) => (
                        <tr key={a.id} className="border-t border-slate-800/60">
                          <td className="py-1.5 font-mono text-xs whitespace-nowrap">
                            {formatArrival(a.arrivalAt)}
                          </td>
                          <td className="py-1.5">{a.target.player || '—'}</td>
                          <td className="py-1.5">
                            {a.target.villageName} ({a.target.x}|{a.target.y})
                          </td>
                          <td className="py-1.5 text-xs uppercase text-slate-400">
                            {a.type}
                          </td>
                          <td className="py-1.5">
                            <StatusBadge status={a.status} />
                          </td>
                          <td className="py-1.5 text-right">
                            <button
                              onClick={() =>
                                void markRealAndIgnoreRest(g.sourceVillageId, a.id)
                              }
                              className="rounded bg-emerald-700 hover:bg-emerald-600 text-xs px-2 py-1"
                            >
                              Real
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
