import { NavLink } from 'react-router-dom';
import { useSession } from '../state/session';
import { PlayerSwitcher } from './PlayerSwitcher';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded text-sm transition-colors ${
    isActive
      ? 'bg-sky-700 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

export function Nav() {
  const { role, setRole } = useSession();
  const isAdmin = role === 'admin';

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="font-semibold tracking-tight">
          <span className="text-sky-400">TW</span> Defender
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/my/attacks" className={linkClass}>
            My attacks
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin/attacks" className={linkClass}>
                All attacks
              </NavLink>
              <NavLink to="/admin/duplicates" className={linkClass}>
                Duplicates
              </NavLink>
              <NavLink to="/admin/by-target" className={linkClass}>
                By target
              </NavLink>
              <NavLink to="/admin/players" className={linkClass}>
                Players
              </NavLink>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <PlayerSwitcher />
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setRole(e.target.checked ? 'admin' : 'player')}
              className="accent-sky-500"
            />
            Admin
          </label>
        </div>
      </div>
    </header>
  );
}
