export const ATTACK_STATUSES = ['pending', 'resolved', 'split', 'ignored'] as const;
export type AttackStatus = (typeof ATTACK_STATUSES)[number];

export const ATTACK_TYPES = ['attack', 'support', 'scout', 'unknown'] as const;
export type AttackType = (typeof ATTACK_TYPES)[number];

export interface Village {
  villageId: string;
  villageName: string;
  x: number;
  y: number;
  player: string;
}

export interface Attack {
  id: string;
  ownerPlayer: string;
  source: Village;
  target: Village;
  type: AttackType;
  arrivalAt: number;
  launchAt?: number;
  status: AttackStatus;
  notes?: string;
  importedAt: number;
  updatedAt: number;
}

export interface Player {
  name: string;
  lastImportAt?: number;
}

/**
 * Stable identifier so re-pasting the same row maps to the same record.
 * Uses millisecond arrival to remain unique even when one source village
 * launches a 4-attack train.
 */
export function attackId(
  sourceVillageId: string,
  targetVillageId: string,
  arrivalAt: number,
): string {
  return `${sourceVillageId}-${targetVillageId}-${arrivalAt}`;
}
