import type { AttackStatus } from '../models/attack';

const COLORS: Record<AttackStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-300 ring-amber-500/40',
  resolved: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40',
  split: 'bg-sky-500/20 text-sky-300 ring-sky-500/40',
  ignored: 'bg-slate-500/20 text-slate-400 ring-slate-500/40',
};

export function StatusBadge({ status }: { status: AttackStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORS[status]}`}
    >
      {status}
    </span>
  );
}
