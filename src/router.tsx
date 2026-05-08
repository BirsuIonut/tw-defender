import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App, RequireAdmin } from './App';
import { MyAttacks } from './pages/MyAttacks';
import { AllAttacks } from './pages/admin/AllAttacks';
import { Duplicates } from './pages/admin/Duplicates';
import { ByTarget } from './pages/admin/ByTarget';
import { Players } from './pages/admin/Players';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Navigate to="/my/attacks" replace /> },
        { path: 'my/attacks', element: <MyAttacks /> },
        {
          path: 'admin/attacks',
          element: (
            <RequireAdmin>
              <AllAttacks />
            </RequireAdmin>
          ),
        },
        {
          path: 'admin/duplicates',
          element: (
            <RequireAdmin>
              <Duplicates />
            </RequireAdmin>
          ),
        },
        {
          path: 'admin/by-target',
          element: (
            <RequireAdmin>
              <ByTarget />
            </RequireAdmin>
          ),
        },
        {
          path: 'admin/players',
          element: (
            <RequireAdmin>
              <Players />
            </RequireAdmin>
          ),
        },
        { path: '*', element: <Navigate to="/my/attacks" replace /> },
      ],
    },
  ],
  {
    // Strip the trailing slash so router paths match cleanly when hosted
    // under a sub-path (e.g. GitHub Pages /tw-defender/).
    basename: import.meta.env.BASE_URL.replace(/\/$/, ''),
  },
);
