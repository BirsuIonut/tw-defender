import type { Attack, AttackStatus, Player } from '../models/attack';

export interface AttacksRepo {
  listForPlayer(name: string): Promise<Attack[]>;
  listAll(): Promise<Attack[]>;
  upsertMany(attacks: Attack[]): Promise<void>;
  updateStatus(id: string, status: AttackStatus): Promise<void>;
  setStatusBulk(ids: string[], status: AttackStatus): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface PlayersRepo {
  list(): Promise<Player[]>;
  upsert(p: Player): Promise<void>;
  remove(name: string): Promise<void>;
}

export interface Repos {
  attacks: AttacksRepo;
  players: PlayersRepo;
}
