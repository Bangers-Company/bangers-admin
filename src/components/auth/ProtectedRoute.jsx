import { Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse font-medium text-lg">
          Loading portal...
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}
