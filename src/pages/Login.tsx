import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message || 'Failed to sign in')
      setLoading(false)
    } else {
      navigate('/ai-generator')
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    setGoogleLoading(true)
    const { error: googleError } = await signInWithGoogle()
    if (googleError) {
      setError(googleError.message || 'Failed to sign in with Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8">
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-semibold text-[var(--color-text-primary)] mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-[14px] text-[var(--color-text-muted)]">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg text-[13px] text-red-700 font-medium">
            {error}
          </div>
        )}

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full h-11 bg-white hover:bg-[var(--color-background-secondary)] text-[#0A0A0A] border border-[var(--color-border)] rounded-[10px] font-medium text-[14px] flex items-center justify-center gap-3 transition-colors mb-6 shadow-sm"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--color-text-muted)]" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[var(--color-border-tertiary)]"></div>
          <span className="px-3 text-[12px] text-[var(--color-text-muted)] bg-white">or continue with email</span>
          <div className="flex-1 border-t border-[var(--color-border-tertiary)]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-[var(--color-offwhite)] border-[var(--color-border)] rounded-[10px] text-[14px] focus:ring-2 focus:ring-[var(--color-green-700)]/20 focus:border-[var(--color-green-700)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 bg-[var(--color-offwhite)] border-[var(--color-border)] rounded-[10px] text-[14px] focus:ring-2 focus:ring-[var(--color-green-700)]/20 focus:border-[var(--color-green-700)] transition-all"
            />
            <div className="flex justify-end pt-1">
              <a href="#" className="text-[12px] text-[#166534] hover:underline font-medium">
                Forgot password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-11 bg-[#166534] hover:bg-[#14532d] active:scale-[0.98] text-white rounded-[10px] font-semibold text-[15px] transition-all shadow-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-[13px] text-[var(--color-text-secondary)]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#166534] font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
