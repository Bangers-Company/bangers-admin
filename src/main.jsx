import { createBrowserRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { toast } from 'sonner'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { ThemeProvider } from './components/ThemeProvider'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import EventsPage from './pages/events/EventsPage'
import EventLineupPage from './pages/events/EventLineupPage'
import EventLineupEditPage from './pages/events/EventLineupEditPage'
import ArtistsPage from './pages/artists/ArtistsPage'
import ActsPage from './pages/acts/ActsPage'
import StagesPage from './pages/stages/StagesPage'
import MediaPage from './pages/media/MediaPage'
import LoginPage from './pages/auth/LoginPage'
import UsersPage from './pages/users/UsersPage'
import UserDetailPage from './pages/users/UserDetailPage'
import RolesPage from './pages/rbac/RolesPage'
import ErrorPage from './pages/ErrorPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show error toasts for queries that don't have their own error handling
      // and avoid showing them for 401s (handled by auth logic)
      if (error.status !== 401 && !query.meta?.silent) {
        toast.error(error.message || 'Failed to fetch data')
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (!mutation.meta?.silent) {
        toast.error(error.message || 'Action failed')
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:id/lineup', element: <EventLineupPage /> },
      { path: 'events/:id/lineup/edit', element: <EventLineupEditPage /> },
      { path: 'artists', element: <ArtistsPage /> },
      { path: 'acts', element: <ActsPage /> },
      { path: 'stages', element: <StagesPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'roles', element: <RolesPage /> },
      { path: 'media', element: <MediaPage /> },
    ],
  },
])

import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RouterProvider router={router} />
          <Toaster position="top-center" />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
)
