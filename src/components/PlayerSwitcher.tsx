import { useState } from 'react';
import { usePlayers, useRepos } from '../data/hooks';
import { useSession } from '../state/session';

export function PlayerSwitcher() {
  const players = usePlayers();
  const { currentPlayer, setCurrentPlayer } = useSession();
  const repos = useRepos();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await repos.players.upsert({ name: trimmed });
    setCurrentPlayer(trimmed);
    setName('');
    setAdding(false);
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400">Acting as</span>
      {!adding ? (
        <>
          <select
            value={currentPlayer ?? ''}
            onChange={(e) => setCurrentPlayer(e.target.value || null)}
            className="rounded bg-slate-800 px-2 py-1"
          >
            <option value="">—</option>
            {players.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setAdding(true)}
            className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-1"
            title="Add player"
          >
            +
          </button>
        </>
      ) : (
        <>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submit();
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="In-game name"
            className="rounded bg-slate-800 px-2 py-1"
          />
          <button
            onClick={() => void submit()}
            className="rounded bg-emerald-700 hover:bg-emerald-600 px-2 py-1"
          >
            Add
          </button>
          <button
            onClick={() => setAdding(false)}
            className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-1"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
