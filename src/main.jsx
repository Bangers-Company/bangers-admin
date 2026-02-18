import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import AppLayout from './components/layout/AppLayout'
import EventsPage from './pages/events/EventsPage'
import ArtistsPage from './pages/artists/ArtistsPage'
import ActsPage from './pages/acts/ActsPage'
import StagesPage from './pages/stages/StagesPage'
import MediaPage from './pages/media/MediaPage'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/events" replace /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'artists', element: <ArtistsPage /> },
      { path: 'acts', element: <ActsPage /> },
      { path: 'stages', element: <StagesPage /> },
      { path: 'media', element: <MediaPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
)
