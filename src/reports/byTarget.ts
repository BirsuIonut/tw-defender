import type { Attack } from '../models/attack';

export interface TargetSummary {
  player: string;
  total: number;
  pending: number;
  resolved: number;
  split: number;
  ignored: number;
  earliestPendingArrivalAt: number | null;
}

export function computeByTarget(attacks: Attack[]): TargetSummary[] {
  const byPlayer = new Map<string, Attack[]>();
  for (const a of attacks) {
    const k = a.target.player || a.ownerPlayer || '(unknown)';
    const arr = byPlayer.get(k) ?? [];
    arr.push(a);
    byPlayer.set(k, arr);
  }

  const out: TargetSummary[] = [];
  for (const [player, list] of byPlayer.entries()) {
    let pending = 0,
      resolved = 0,
      split = 0,
      ignored = 0;
    let earliest: number | null = null;
    for (const a of list) {
      if (a.status === 'pending') {
        pending++;
        if (earliest === null || a.arrivalAt < earliest) earliest = a.arrivalAt;
      } else if (a.status === 'resolved') resolved++;
      else if (a.status === 'split') split++;
      else if (a.status === 'ignored') ignored++;
    }
    out.push({
      player,
      total: list.length,
      pending,
      resolved,
      split,
      ignored,
      earliestPendingArrivalAt: earliest,
    });
  }
  out.sort((a, b) => b.pending - a.pending || a.player.localeCompare(b.player));
  return out;
}
