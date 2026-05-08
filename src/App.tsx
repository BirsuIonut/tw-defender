import type { ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Nav } from './components/Nav';
import { useSession } from './state/session';

export function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { role } = useSession();
  if (role !== 'admin') return <Navigate to="/my/attacks" replace />;
  return <>{children}</>;
}
