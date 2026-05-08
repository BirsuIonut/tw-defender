import type { Attack } from '../models/attack';

export interface DuplicateGroup {
  sourceVillageId: string;
  sourceVillageName: string;
  sourceCoords: { x: number; y: number };
  attacker: string;
  attacks: Attack[]; // sorted by arrivalAt ascending
  uniqueTargets: number;
  earliestArrivalAt: number;
}

/**
 * Group attacks by source village. A source village hitting more than one
 * distinct target is suspicious — at most one of those is the real nuke,
 * the rest are fakes.
 *
 * Returns groups with size > 1 sorted by earliest arrival.
 */
export function computeDuplicates(attacks: Attack[]): DuplicateGroup[] {
  const byVillage = new Map<string, Attack[]>();
  for (const a of attacks) {
    if (a.status === 'ignored') continue;
    const arr = byVillage.get(a.source.villageId) ?? [];
    arr.push(a);
    byVillage.set(a.source.villageId, arr);
  }

  const groups: DuplicateGroup[] = [];
  for (const list of byVillage.values()) {
    if (list.length < 2) continue;
    const targets = new Set(list.map((a) => a.target.villageId));
    if (targets.size < 2) continue;
    const sorted = [...list].sort((a, b) => a.arrivalAt - b.arrivalAt);
    const head = sorted[0];
    groups.push({
      sourceVillageId: head.source.villageId,
      sourceVillageName: head.source.villageName,
      sourceCoords: { x: head.source.x, y: head.source.y },
      attacker: head.source.player,
      attacks: sorted,
      uniqueTargets: targets.size,
      earliestArrivalAt: head.arrivalAt,
    });
  }

  groups.sort((a, b) => a.earliestArrivalAt - b.earliestArrivalAt);
  return groups;
}
