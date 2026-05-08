import { useAllAttacks, useRepos } from '../../data/hooks';
import { AttackTable } from '../../components/AttackTable';
import type { AttackStatus } from '../../models/attack';

export function AllAttacks() {
  const attacks = useAllAttacks();
  const repos = useRepos();

  const handleStatus = (id: string, status: AttackStatus) => {
    void repos.attacks.updateStatus(id, status);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">All attacks</h1>
        <p className="text-sm text-slate-400">
          {attacks.length} attacks across {countOwners(attacks)} players
        </p>
      </div>
      <AttackTable
        attacks={attacks}
        showOwner
        onChangeStatus={handleStatus}
      />
    </div>
  );
}

function countOwners(list: { ownerPlayer: string }[]): number {
  return new Set(list.map((a) => a.ownerPlayer)).size;
}
