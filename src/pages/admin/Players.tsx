import { useAllAttacks, usePlayers, useRepos } from '../../data/hooks';
import { useSession } from '../../state/session';
import { formatDistance } from '../../lib/format';

export function Players() {
  const players = usePlayers();
  const attacks = useAllAttacks();
  const { currentPlayer, setCurrentPlayer } = useSession();
  const repos = useRepos();

  const counts = new Map<string, number>();
  for (const a of attacks) {
    counts.set(a.ownerPlayer, (counts.get(a.ownerPlayer) ?? 0) + 1);
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ players, attacks }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tw-defender-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Players</h1>
        <button
          onClick={exportJson}
          className="rounded bg-slate-800 hover:bg-slate-700 text-sm px-3 py-1.5"
        >
          Export JSON
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg ring-1 ring-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-right px-3 py-2 font-medium">Attacks</th>
              <th className="text-left px-3 py-2 font-medium">Last import</th>
              <th className="text-right px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.name} className="border-t border-slate-800">
                <td className="px-3 py-2 font-medium">
                  {p.name}
                  {currentPlayer === p.name && (
                    <span className="ml-2 text-xs text-sky-400">(acting as)</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {counts.get(p.name) ?? 0}
                </td>
                <td className="px-3 py-2 text-slate-400">
                  {p.lastImportAt ? formatDistance(p.lastImportAt) : 'never'}
                </td>
                <td className="px-3 py-2 text-right space-x-1">
                  <button
                    onClick={() => setCurrentPlayer(p.name)}
                    className="rounded bg-slate-800 hover:bg-slate-700 text-xs px-2 py-1"
                  >
                    Switch to
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Remove player "${p.name}"? Their imported attacks will remain.`,
                        )
                      ) {
                        void repos.players.remove(p.name);
                        if (currentPlayer === p.name) setCurrentPlayer(null);
                      }
                    }}
                    className="rounded bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 text-xs px-2 py-1"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                  No players yet. Use the "+" in the top-right to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
