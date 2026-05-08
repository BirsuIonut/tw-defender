import { describe, expect, it } from 'vitest';
import { computeDuplicates } from './duplicates';
import { computeByTarget } from './byTarget';
import type { Attack } from '../models/attack';

function mk(overrides: Partial<Attack> & { id: string }): Attack {
  return {
    ownerPlayer: 'Def',
    source: { villageId: '1', villageName: 'A', x: 1, y: 1, player: 'Atk' },
    target: { villageId: '2', villageName: 'B', x: 2, y: 2, player: 'Def' },
    type: 'attack',
    arrivalAt: 1000,
    status: 'pending',
    importedAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('computeDuplicates', () => {
  it('returns empty for distinct sources', () => {
    const r = computeDuplicates([
      mk({ id: 'a', source: { villageId: 'X', villageName: '', x: 0, y: 0, player: '' } }),
      mk({ id: 'b', source: { villageId: 'Y', villageName: '', x: 0, y: 0, player: '' } }),
    ]);
    expect(r).toHaveLength(0);
  });

  it('returns one group for source attacking multiple targets', () => {
    const r = computeDuplicates([
      mk({ id: 'a', target: { villageId: 'T1', villageName: '', x: 0, y: 0, player: 'P1' } }),
      mk({ id: 'b', target: { villageId: 'T2', villageName: '', x: 0, y: 0, player: 'P2' } }),
    ]);
    expect(r).toHaveLength(1);
    expect(r[0].uniqueTargets).toBe(2);
    expect(r[0].attacks).toHaveLength(2);
  });

  it('does not group when same source hits same target multiple times (train)', () => {
    const r = computeDuplicates([
      mk({ id: 'a', arrivalAt: 1000 }),
      mk({ id: 'b', arrivalAt: 1100 }),
      mk({ id: 'c', arrivalAt: 1200 }),
      mk({ id: 'd', arrivalAt: 1300 }),
    ]);
    expect(r).toHaveLength(0);
  });

  it('excludes ignored attacks from grouping', () => {
    const r = computeDuplicates([
      mk({ id: 'a', target: { villageId: 'T1', villageName: '', x: 0, y: 0, player: 'P1' } }),
      mk({
        id: 'b',
        target: { villageId: 'T2', villageName: '', x: 0, y: 0, player: 'P2' },
        status: 'ignored',
      }),
    ]);
    expect(r).toHaveLength(0);
  });

  it('sorts groups by earliest arrival', () => {
    const r = computeDuplicates([
      mk({
        id: 'late1',
        source: { villageId: 'L', villageName: '', x: 0, y: 0, player: '' },
        target: { villageId: 'T1', villageName: '', x: 0, y: 0, player: '' },
        arrivalAt: 5000,
      }),
      mk({
        id: 'late2',
        source: { villageId: 'L', villageName: '', x: 0, y: 0, player: '' },
        target: { villageId: 'T2', villageName: '', x: 0, y: 0, player: '' },
        arrivalAt: 5100,
      }),
      mk({
        id: 'early1',
        source: { villageId: 'E', villageName: '', x: 0, y: 0, player: '' },
        target: { villageId: 'T1', villageName: '', x: 0, y: 0, player: '' },
        arrivalAt: 1000,
      }),
      mk({
        id: 'early2',
        source: { villageId: 'E', villageName: '', x: 0, y: 0, player: '' },
        target: { villageId: 'T2', villageName: '', x: 0, y: 0, player: '' },
        arrivalAt: 1100,
      }),
    ]);
    expect(r.map((g) => g.sourceVillageId)).toEqual(['E', 'L']);
  });
});

describe('computeByTarget', () => {
  it('sums per defender by status', () => {
    const r = computeByTarget([
      mk({ id: '1', target: { villageId: 'T1', villageName: '', x: 0, y: 0, player: 'Alice' } }),
      mk({
        id: '2',
        target: { villageId: 'T2', villageName: '', x: 0, y: 0, player: 'Alice' },
        status: 'resolved',
      }),
      mk({
        id: '3',
        target: { villageId: 'T3', villageName: '', x: 0, y: 0, player: 'Bob' },
        status: 'pending',
      }),
    ]);
    const alice = r.find((x) => x.player === 'Alice')!;
    expect(alice.total).toBe(2);
    expect(alice.pending).toBe(1);
    expect(alice.resolved).toBe(1);
    const bob = r.find((x) => x.player === 'Bob')!;
    expect(bob.pending).toBe(1);
  });
});
