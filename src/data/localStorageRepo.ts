import type { Attack, AttackStatus, Player } from '../models/attack';
import type { AttacksRepo, PlayersRepo, Repos } from './repo';

const KEYS = {
  players: 'twd:players',
  attacks: 'twd:attacks',
  schemaVersion: 'twd:schemaVersion',
} as const;

const SCHEMA_VERSION = 1;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSchema(): void {
  const v = read<number | null>(KEYS.schemaVersion, null);
  if (v !== SCHEMA_VERSION) write(KEYS.schemaVersion, SCHEMA_VERSION);
}

const subscribers = new Set<() => void>();

export function subscribeToRepoChanges(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

function notify(): void {
  for (const cb of subscribers) cb();
}

class LocalAttacksRepo implements AttacksRepo {
  async listForPlayer(name: string): Promise<Attack[]> {
    return read<Attack[]>(KEYS.attacks, []).filter((a) => a.ownerPlayer === name);
  }

  async listAll(): Promise<Attack[]> {
    return read<Attack[]>(KEYS.attacks, []);
  }

  async upsertMany(attacks: Attack[]): Promise<void> {
    if (attacks.length === 0) return;
    const existing = read<Attack[]>(KEYS.attacks, []);
    const byId = new Map(existing.map((a) => [a.id, a]));
    for (const a of attacks) byId.set(a.id, a);
    write(KEYS.attacks, [...byId.values()]);
    notify();
  }

  async updateStatus(id: string, status: AttackStatus): Promise<void> {
    const list = read<Attack[]>(KEYS.attacks, []);
    const next = list.map((a) =>
      a.id === id ? { ...a, status, updatedAt: Date.now() } : a,
    );
    write(KEYS.attacks, next);
    notify();
  }

  async setStatusBulk(ids: string[], status: AttackStatus): Promise<void> {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const list = read<Attack[]>(KEYS.attacks, []);
    const now = Date.now();
    const next = list.map((a) =>
      idSet.has(a.id) ? { ...a, status, updatedAt: now } : a,
    );
    write(KEYS.attacks, next);
    notify();
  }

  async remove(id: string): Promise<void> {
    const list = read<Attack[]>(KEYS.attacks, []);
    write(
      KEYS.attacks,
      list.filter((a) => a.id !== id),
    );
    notify();
  }
}

class LocalPlayersRepo implements PlayersRepo {
  async list(): Promise<Player[]> {
    return read<Player[]>(KEYS.players, []);
  }

  async upsert(p: Player): Promise<void> {
    const list = read<Player[]>(KEYS.players, []);
    const idx = list.findIndex((x) => x.name === p.name);
    if (idx >= 0) list[idx] = { ...list[idx], ...p };
    else list.push(p);
    write(KEYS.players, list);
    notify();
  }

  async remove(name: string): Promise<void> {
    const list = read<Player[]>(KEYS.players, []);
    write(
      KEYS.players,
      list.filter((p) => p.name !== name),
    );
    notify();
  }
}

ensureSchema();

export const localRepos: Repos = {
  attacks: new LocalAttacksRepo(),
  players: new LocalPlayersRepo(),
};
