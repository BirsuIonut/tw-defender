import { useAttacksForPlayer, useRepos } from '../data/hooks';
import { useSession } from '../state/session';
import { AttackTable } from '../components/AttackTable';
import { PasteImport } from '../components/PasteImport';
import type { Attack, AttackStatus } from '../models/attack';

export function MyAttacks() {
  const { currentPlayer } = useSession();
  const attacks = useAttacksForPlayer(currentPlayer);
  const repos = useRepos();

  const handleConfirm = (toUpsert: Attack[]) => {
    if (!currentPlayer) return;
    void (async () => {
      await repos.attacks.upsertMany(toUpsert);
      await repos.players.upsert({ name: currentPlayer, lastImportAt: Date.now() });
    })();
  };

  const handleStatus = (id: string, status: AttackStatus) => {
    void repos.attacks.updateStatus(id, status);
  };

  const handleRemove = (id: string) => {
    void repos.attacks.remove(id);
  };

  if (!currentPlayer) {
    return (
      <div className="rounded-lg ring-1 ring-slate-800 bg-slate-900/50 p-6 text-slate-300">
        <p className="font-medium mb-2">Pick a player to act as</p>
        <p className="text-sm text-slate-400">
          Use the "Acting as" switcher in the top-right. Add your in-game name,
          and you'll be able to import your incomings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg ring-1 ring-slate-800 bg-slate-900/50 p-4">
        <PasteImport
          ownerPlayer={currentPlayer}
          existing={attacks}
          onConfirm={handleConfirm}
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">
          {currentPlayer}'s attacks
        </h2>
        <AttackTable
          attacks={attacks}
          onChangeStatus={handleStatus}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}
