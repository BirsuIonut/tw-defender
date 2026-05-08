import { useEffect, useState, useCallback } from 'react';
import type { Attack, Player } from '../models/attack';
import { localRepos, subscribeToRepoChanges } from './localStorageRepo';

function useRepoVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribeToRepoChanges(() => setVersion((v) => v + 1)), []);
  return version;
}

export function useAllAttacks(): Attack[] {
  const v = useRepoVersion();
  const [data, setData] = useState<Attack[]>([]);
  useEffect(() => {
    let alive = true;
    localRepos.attacks.listAll().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [v]);
  return data;
}

export function useAttacksForPlayer(name: string | null): Attack[] {
  const v = useRepoVersion();
  const [data, setData] = useState<Attack[]>([]);
  useEffect(() => {
    if (!name) {
      setData([]);
      return;
    }
    let alive = true;
    localRepos.attacks.listForPlayer(name).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [v, name]);
  return data;
}

export function usePlayers(): Player[] {
  const v = useRepoVersion();
  const [data, setData] = useState<Player[]>([]);
  useEffect(() => {
    let alive = true;
    localRepos.players.list().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [v]);
  return data;
}

export function useRepos() {
  return localRepos;
}

export function useAsyncCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<void>,
): (...args: TArgs) => void {
  return useCallback(
    (...args: TArgs) => {
      void fn(...args);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn],
  );
}
