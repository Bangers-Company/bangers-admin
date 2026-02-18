import { createBrowserRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './components/ThemeProvider'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
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
      { index: true, element: <DashboardPage /> },
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <RouterProvider router={router} />
    </ThemeProvider>
  </QueryClientProvider>
)
