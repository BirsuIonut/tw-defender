import { useMemo, useState } from 'react';
import type { Attack, AttackStatus, AttackType } from '../models/attack';
import { ATTACK_STATUSES, ATTACK_TYPES } from '../models/attack';
import { StatusBadge } from './StatusBadge';
import { formatArrival } from '../lib/format';

export interface AttackTableProps {
  attacks: Attack[];
  showOwner?: boolean;
  onChangeStatus?: (id: string, status: AttackStatus) => void;
  onRemove?: (id: string) => void;
}

type StatusFilter = AttackStatus | 'all';
type TypeFilter = AttackType | 'all';

export function AttackTable({
  attacks,
  showOwner = false,
  onChangeStatus,
  onRemove,
}: AttackTableProps) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return attacks
      .filter((a) => (status === 'all' ? true : a.status === status))
      .filter((a) => (type === 'all' ? true : a.type === type))
      .filter((a) => {
        if (!ql) return true;
        return (
          a.source.player.toLowerCase().includes(ql) ||
          a.source.villageName.toLowerCase().includes(ql) ||
          a.target.player.toLowerCase().includes(ql) ||
          a.target.villageName.toLowerCase().includes(ql) ||
          a.ownerPlayer.toLowerCase().includes(ql)
        );
      })
      .sort((a, b) => a.arrivalAt - b.arrivalAt);
  }, [attacks, status, type, q]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by player or village…"
          className="rounded bg-slate-800 px-3 py-1.5 text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-sky-500/40"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="rounded bg-slate-800 px-3 py-1.5 text-sm"
        >
          <option value="all">All statuses</option>
          {ATTACK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TypeFilter)}
          className="rounded bg-slate-800 px-3 py-1.5 text-sm"
        >
          <option value="all">All types</option>
          {ATTACK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          {filtered.length} of {attacks.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg ring-1 ring-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Arrival</th>
              <th className="text-left px-3 py-2 font-medium">Attacker</th>
              <th className="text-left px-3 py-2 font-medium">Source</th>
              <th className="text-left px-3 py-2 font-medium">→</th>
              <th className="text-left px-3 py-2 font-medium">Target</th>
              {showOwner && (
                <th className="text-left px-3 py-2 font-medium">Owner</th>
              )}
              <th className="text-left px-3 py-2 font-medium">Type</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              {(onChangeStatus || onRemove) && (
                <th className="text-right px-3 py-2 font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="border-t border-slate-800 hover:bg-slate-900/40"
              >
                <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">
                  {formatArrival(a.arrivalAt)}
                </td>
                <td className="px-3 py-2">{a.source.player || '—'}</td>
                <td className="px-3 py-2">
                  <span className="text-slate-300">{a.source.villageName}</span>
                  <span className="text-slate-500 ml-1">
                    ({a.source.x}|{a.source.y})
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-500">→</td>
                <td className="px-3 py-2">
                  <span className="text-slate-300">{a.target.villageName}</span>
                  <span className="text-slate-500 ml-1">
                    ({a.target.x}|{a.target.y})
                  </span>
                </td>
                {showOwner && (
                  <td className="px-3 py-2 text-slate-400">{a.ownerPlayer}</td>
                )}
                <td className="px-3 py-2">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {a.type}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={a.status} />
                </td>
                {(onChangeStatus || onRemove) && (
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 justify-end">
                      {onChangeStatus && (
                        <select
                          value={a.status}
                          onChange={(e) =>
                            onChangeStatus(a.id, e.target.value as AttackStatus)
                          }
                          className="rounded bg-slate-800 px-2 py-1 text-xs"
                        >
                          {ATTACK_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                      {onRemove && (
                        <button
                          onClick={() => onRemove(a.id)}
                          className="rounded bg-rose-900/40 hover:bg-rose-900/60 px-2 py-1 text-xs text-rose-200"
                          title="Delete"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={showOwner ? 9 : 8}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  No attacks.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
