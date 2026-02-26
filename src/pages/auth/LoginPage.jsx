import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { authApi } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { isAuthenticated, loading, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingForm, setLoadingForm] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoadingForm(true)
    setError(null)

    try {
      await login({ email, password }, { silent: true })
      toast.success('Login successful')
      navigate('/')
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoadingForm(false)
    }
  }

  if (loading) return null

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 p-6">
      <div className="pt-8 flex flex-col items-center gap-2 animate-in slide-in-from-top-4 duration-500">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-xl shadow-md">
          B
        </div>
        <span className="text-2xl font-bold tracking-tight">Bangers</span>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
              <CardDescription>
                Enter your credentials to access the management dashboard
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@example.com"
                    className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loadingForm}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loadingForm}
                  />
                </div>
                {error && (
                  <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1 text-center">
                    {error}
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-7">
                <Button className="w-full" type="submit" disabled={loadingForm}>
                  {loadingForm ? 'Signing in...' : 'Sign in'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      
      <div className="pb-8 flex flex-col items-center animate-in fade-in duration-1000">
        <span className="text-sm text-muted-foreground">© Bangers Company</span>
      </div>
    </div>
  )
}
