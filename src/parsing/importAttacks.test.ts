import { describe, expect, it } from 'vitest';
import { mergeImport, parseArrival, parsePaste } from './importAttacks';
import type { Attack } from '../models/attack';

describe('parseArrival', () => {
  const now = new Date(2026, 4, 8, 12, 0, 0); // 2026-05-08 12:00

  it('parses ISO datetime with milliseconds', () => {
    const t = parseArrival('arriving 2026-05-08 14:23:45:123', now);
    expect(t).toBe(new Date(2026, 4, 8, 14, 23, 45, 123).getTime());
  });

  it('parses dotted DMY date with time', () => {
    const t = parseArrival('arriving 08.05.2026 14:23:45:123', now);
    expect(t).toBe(new Date(2026, 4, 8, 14, 23, 45, 123).getTime());
  });

  it('parses time then DMY', () => {
    const t = parseArrival('14:23:45:123 08.05.2026', now);
    expect(t).toBe(new Date(2026, 4, 8, 14, 23, 45, 123).getTime());
  });

  it('parses two-digit year', () => {
    const t = parseArrival('14:23:45 08/05/26', now);
    expect(t).toBe(new Date(2026, 4, 8, 14, 23, 45).getTime());
  });

  it('parses today + time', () => {
    const t = parseArrival('today at 14:23:45:500', now);
    expect(t).toBe(new Date(2026, 4, 8, 14, 23, 45, 500).getTime());
  });

  it('parses tomorrow + time', () => {
    const t = parseArrival('tomorrow at 02:00:00', now);
    expect(t).toBe(new Date(2026, 4, 9, 2, 0, 0).getTime());
  });

  it('falls back to bare time as today', () => {
    const t = parseArrival('14:23:45', now);
    expect(t).toBe(new Date(2026, 4, 8, 14, 23, 45).getTime());
  });

  it('returns null for unparseable input', () => {
    expect(parseArrival('hello world', now)).toBeNull();
  });
});

describe('parsePaste', () => {
  const now = new Date(2026, 4, 8, 12, 0, 0);

  it('parses a typical compact BB-code row', () => {
    const raw =
      '[player]Attila[/player] [village=12345]Capital (500|500) K55[/village] ' +
      '[unit]ram[/unit] -> [village=67890]Defender Town (510|510) K55[/village] ' +
      'arriving 2026-05-08 14:23:45:123';
    const out = parsePaste(raw, now);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      attacker: 'Attila',
      type: 'attack',
      source: { villageId: '12345', x: 500, y: 500, villageName: 'Capital' },
      target: { villageId: '67890', x: 510, y: 510, villageName: 'Defender Town' },
    });
    expect(out[0].arrivalAt).toBe(new Date(2026, 4, 8, 14, 23, 45, 123).getTime());
  });

  it('handles BB list items with [*]', () => {
    const raw = `
      [list]
      [*][player]Attila[/player] [village=1]A (1|1) K00[/village] [unit]ram[/unit] -> [village=2]B (2|2) K00[/village] 14:23:45 08.05.26
      [*][player]Hun[/player] [village=3]C (3|3) K00[/village] [unit]spy[/unit] -> [village=4]D (4|4) K00[/village] 15:00:00 08.05.26
      [/list]`;
    const out = parsePaste(raw, now);
    expect(out).toHaveLength(2);
    expect(out[0].source.villageId).toBe('1');
    expect(out[1].type).toBe('scout');
  });

  it('skips header / decoration lines without two villages', () => {
    const raw = `[b]Incomings[/b]
      Some commentary
      [player]Attila[/player] [village=1]A (1|1)[/village] [unit]ram[/unit] -> [village=2]B (2|2)[/village] 14:23:45 08.05.26`;
    const out = parsePaste(raw, now);
    expect(out).toHaveLength(1);
  });

  it('falls back to coord-based id when village id missing', () => {
    const raw =
      '[player]Attila[/player] [village]100|100[/village] [unit]ram[/unit] -> [village]200|200[/village] 14:23:45 08.05.26';
    const out = parsePaste(raw, now);
    expect(out).toHaveLength(1);
    expect(out[0].source.villageId).toBe('100|100');
    expect(out[0].target.villageId).toBe('200|200');
  });

  it('marks scout units as type=scout', () => {
    const raw =
      '[player]A[/player] [village=1]X (1|1)[/village] [unit]spy[/unit] -> [village=2]Y (2|2)[/village] 14:23:45 08.05.26';
    expect(parsePaste(raw, now)[0].type).toBe('scout');
  });

  it('marks rows with no [unit] as type=unknown', () => {
    const raw =
      '[player]A[/player] [village=1]X (1|1)[/village] -> [village=2]Y (2|2)[/village] 14:23:45 08.05.26';
    expect(parsePaste(raw, now)[0].type).toBe('unknown');
  });
});

describe('mergeImport', () => {
  const baseAttack: Attack = {
    id: '1-2-100',
    ownerPlayer: 'Defender',
    source: { villageId: '1', villageName: 'A', x: 1, y: 1, player: 'Attila' },
    target: { villageId: '2', villageName: 'B', x: 2, y: 2, player: 'Defender' },
    type: 'attack',
    arrivalAt: 100,
    status: 'resolved',
    importedAt: 0,
    updatedAt: 0,
  };

  it('preserves existing status for known ids', () => {
    const parsed = [
      {
        attacker: 'Attila',
        source: baseAttack.source,
        target: { ...baseAttack.target, player: '' },
        type: 'attack' as const,
        arrivalAt: 100,
      },
    ];
    const r = mergeImport(parsed, [baseAttack], 'Defender', 999);
    expect(r.added).toHaveLength(0);
    expect(r.unchanged).toHaveLength(1);
    expect(r.unchanged[0].status).toBe('resolved');
  });

  it('adds new attacks as pending', () => {
    const parsed = [
      {
        attacker: 'Attila',
        source: { villageId: '9', villageName: 'Z', x: 9, y: 9, player: 'Attila' },
        target: { villageId: '2', villageName: 'B', x: 2, y: 2, player: '' },
        type: 'attack' as const,
        arrivalAt: 200,
      },
    ];
    const r = mergeImport(parsed, [baseAttack], 'Defender', 999);
    expect(r.added).toHaveLength(1);
    expect(r.added[0].status).toBe('pending');
    expect(r.added[0].target.player).toBe('Defender');
  });

  it('flags attacks missing from a re-paste', () => {
    const r = mergeImport([], [baseAttack], 'Defender', 999);
    expect(r.missing).toHaveLength(1);
    expect(r.missing[0].id).toBe(baseAttack.id);
  });
});
