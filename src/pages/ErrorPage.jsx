import { useRouteError } from 'react-router'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
  const error = useRouteError()
  console.error(error)

  const handleReset = () => {
    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-muted/20">
      <Card className="max-w-md w-full shadow-lg border-destructive/20">
        <CardContent className="flex flex-col items-center text-center gap-4 pt-8">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Application Error</h2>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {error?.statusText || error?.message || 'An unexpected error occurred.'}
            </p>
            {error?.status && (
              <p className="text-xs font-mono bg-muted p-1 rounded inline-block">
                Error Code: {error.status}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-3 pb-8">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reload
          </Button>
          <Button size="sm" onClick={handleReset}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
