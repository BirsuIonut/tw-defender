import { useEffect, useState } from 'react';

const KEYS = {
  currentPlayer: 'twd:currentPlayer',
  role: 'twd:role',
} as const;

export type Role = 'player' | 'admin';

const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getCurrentPlayer(): string | null {
  return localStorage.getItem(KEYS.currentPlayer);
}

export function setCurrentPlayer(name: string | null): void {
  if (name === null) localStorage.removeItem(KEYS.currentPlayer);
  else localStorage.setItem(KEYS.currentPlayer, name);
  notify();
}

export function getRole(): Role {
  const v = localStorage.getItem(KEYS.role);
  return v === 'admin' ? 'admin' : 'player';
}

export function setRole(role: Role): void {
  localStorage.setItem(KEYS.role, role);
  notify();
}

export function useSession() {
  const [, setVersion] = useState(0);
  useEffect(() => subscribe(() => setVersion((v) => v + 1)), []);
  return {
    currentPlayer: getCurrentPlayer(),
    role: getRole(),
    setCurrentPlayer,
    setRole,
  };
}
