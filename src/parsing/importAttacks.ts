import type { Attack, AttackType, Village } from '../models/attack';
import { attackId } from '../models/attack';

/**
 * Parsed row, before it's promoted to a full Attack with owner & timestamps.
 */
export interface ParsedAttack {
  source: Village;
  target: Village;
  type: AttackType;
  arrivalAt: number;
  attacker: string;
}

const VILLAGE_RE = /\[village(?:=(\d+))?\]([^\[]*)\[\/village\]/gi;
const PLAYER_RE = /\[player(?:=[^\]]*)?\]([^\[]*)\[\/player\]/gi;
const UNIT_RE = /\[unit\]([a-z]+)\[\/unit\]/i;
const COORDS_RE = /(\d{1,3})\s*\|\s*(\d{1,3})/;

const UNIT_TO_TYPE: Record<string, AttackType> = {
  spy: 'scout',
  scout: 'scout',
  axe: 'attack',
  sword: 'attack',
  spear: 'attack',
  archer: 'attack',
  light: 'attack',
  marcher: 'attack',
  heavy: 'attack',
  ram: 'attack',
  catapult: 'attack',
  knight: 'attack',
  snob: 'attack',
  noble: 'attack',
};

/**
 * Try several timestamp formats commonly produced by TW worlds.
 * Returns epoch ms, or null if none matched.
 *
 * Formats handled (examples):
 *   2026-05-08 14:23:45:123
 *   2026-05-08 14:23:45
 *   08.05.2026 14:23:45:123
 *   08/05/2026 14:23:45
 *   14:23:45:123 08.05.2026
 *   14:23:45 08/05/26
 *   today at 14:23:45:123
 *   tomorrow at 14:23:45
 */
export function parseArrival(input: string, now: Date = new Date()): number | null {
  const s = input.trim();

  // ISO-ish: 2026-05-08 14:23:45[:ms]
  let m = s.match(
    /(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2}):(\d{2})(?::(\d{1,3}))?/,
  );
  if (m) {
    const [, y, mo, d, h, mi, se, ms] = m;
    return buildLocalDate(+y, +mo, +d, +h, +mi, +se, ms ? +ms : 0);
  }

  // DMY date then time: 08.05.2026 14:23:45[:ms]   (also slashes)
  m = s.match(
    /(\d{1,2})[./](\d{1,2})[./](\d{2,4})[ T](\d{1,2}):(\d{2}):(\d{2})(?::(\d{1,3}))?/,
  );
  if (m) {
    const [, d, mo, y, h, mi, se, ms] = m;
    return buildLocalDate(expandYear(+y), +mo, +d, +h, +mi, +se, ms ? +ms : 0);
  }

  // Time then DMY: 14:23:45[:ms] 08.05.2026
  m = s.match(
    /(\d{1,2}):(\d{2}):(\d{2})(?::(\d{1,3}))?\s+(\d{1,2})[./](\d{1,2})[./](\d{2,4})/,
  );
  if (m) {
    const [, h, mi, se, ms, d, mo, y] = m;
    return buildLocalDate(expandYear(+y), +mo, +d, +h, +mi, +se, ms ? +ms : 0);
  }

  // "today at HH:MM:SS[:ms]"
  m = s.match(/today(?:\s+at)?\s+(\d{1,2}):(\d{2}):(\d{2})(?::(\d{1,3}))?/i);
  if (m) {
    const [, h, mi, se, ms] = m;
    return buildLocalDate(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      +h,
      +mi,
      +se,
      ms ? +ms : 0,
    );
  }

  // "tomorrow at HH:MM:SS[:ms]"
  m = s.match(/tomorrow(?:\s+at)?\s+(\d{1,2}):(\d{2}):(\d{2})(?::(\d{1,3}))?/i);
  if (m) {
    const [, h, mi, se, ms] = m;
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    return buildLocalDate(
      t.getFullYear(),
      t.getMonth() + 1,
      t.getDate(),
      +h,
      +mi,
      +se,
      ms ? +ms : 0,
    );
  }

  // Bare time: HH:MM:SS[:ms] — assume today
  m = s.match(/(\d{1,2}):(\d{2}):(\d{2})(?::(\d{1,3}))?/);
  if (m) {
    const [, h, mi, se, ms] = m;
    return buildLocalDate(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      +h,
      +mi,
      +se,
      ms ? +ms : 0,
    );
  }

  return null;
}

function buildLocalDate(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  se: number,
  ms: number,
): number {
  return new Date(y, mo - 1, d, h, mi, se, ms).getTime();
}

function expandYear(y: number): number {
  if (y >= 1000) return y;
  return 2000 + y;
}

/**
 * Pull a {x, y} coordinate from BB village content like
 *   "VillageName (123|456) K14"  or  "123|456".
 */
function extractCoords(content: string): { x: number; y: number } | null {
  const m = content.match(COORDS_RE);
  if (!m) return null;
  return { x: +m[1], y: +m[2] };
}

function extractVillageName(content: string): string {
  // Strip "(X|Y)" and any " Kxx" continent and trim.
  return content
    .replace(/\(?\d{1,3}\s*\|\s*\d{1,3}\)?/g, '')
    .replace(/K\d{1,3}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

interface VillageMatch {
  villageId: string;
  villageName: string;
  x: number;
  y: number;
}

function findVillages(line: string): VillageMatch[] {
  const out: VillageMatch[] = [];
  for (const m of line.matchAll(VILLAGE_RE)) {
    const id = m[1] ?? '';
    const content = m[2] ?? '';
    const coords = extractCoords(content);
    if (!coords) continue;
    out.push({
      villageId: id || `${coords.x}|${coords.y}`,
      villageName: extractVillageName(content) || `${coords.x}|${coords.y}`,
      x: coords.x,
      y: coords.y,
    });
  }
  return out;
}

function findFirstPlayer(line: string): string {
  for (const m of line.matchAll(PLAYER_RE)) {
    const name = (m[1] ?? '').trim();
    if (name) return name;
  }
  return '';
}

function findUnitType(line: string): { type: AttackType; raw?: string } {
  const m = line.match(UNIT_RE);
  if (!m) return { type: 'unknown' };
  const raw = m[1].toLowerCase();
  return { type: UNIT_TO_TYPE[raw] ?? 'attack', raw };
}

/**
 * Split pasted text into per-attack candidate lines. Handles:
 *  - one row per newline,
 *  - BB list items "[*]" used by some scripts,
 *  - long single-line BB tables separated by "[||]".
 */
function splitRows(raw: string): string[] {
  const lines = raw
    .replace(/\[\*\]/g, '\n')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines;
}

/**
 * Parse BB-code pasted from the in-game "Incomings" forum export.
 * Returns rows that contained at least two villages and a parseable arrival.
 * Rows that don't look like attacks (table headers, decoration) are silently
 * skipped.
 */
export function parsePaste(raw: string, now: Date = new Date()): ParsedAttack[] {
  const out: ParsedAttack[] = [];
  for (const line of splitRows(raw)) {
    const villages = findVillages(line);
    if (villages.length < 2) continue;
    const arrivalAt = parseArrival(line, now);
    if (arrivalAt == null) continue;

    const attacker = findFirstPlayer(line);
    const { type } = findUnitType(line);
    const [src, tgt] = villages;

    out.push({
      attacker,
      source: { ...src, player: attacker },
      target: { ...tgt, player: '' },
      type,
      arrivalAt,
    });
  }
  return out;
}

/**
 * Promote ParsedAttacks to full Attacks for storage. Existing attacks (matched
 * by stable id) keep their status; new ones default to 'pending'.
 */
export interface MergeResult {
  /** Final list to upsert: union of unchanged + new (preserves existing status). */
  toUpsert: Attack[];
  /** Attacks that were already stored (status retained). */
  unchanged: Attack[];
  /** Newly seen attacks (status = 'pending'). */
  added: Attack[];
  /** Attacks the player previously had but are no longer in the paste. */
  missing: Attack[];
}

export function mergeImport(
  parsed: ParsedAttack[],
  existing: Attack[],
  ownerPlayer: string,
  now: number = Date.now(),
): MergeResult {
  const existingById = new Map(existing.map((a) => [a.id, a]));
  const parsedIds = new Set<string>();
  const unchanged: Attack[] = [];
  const added: Attack[] = [];

  for (const p of parsed) {
    const id = attackId(p.source.villageId, p.target.villageId, p.arrivalAt);
    parsedIds.add(id);
    const prev = existingById.get(id);
    if (prev) {
      unchanged.push(prev);
      continue;
    }
    added.push({
      id,
      ownerPlayer,
      source: p.source,
      target: { ...p.target, player: ownerPlayer },
      type: p.type,
      arrivalAt: p.arrivalAt,
      status: 'pending',
      importedAt: now,
      updatedAt: now,
    });
  }

  const missing = existing.filter((a) => !parsedIds.has(a.id));
  return {
    toUpsert: [...unchanged, ...added],
    unchanged,
    added,
    missing,
  };
}
