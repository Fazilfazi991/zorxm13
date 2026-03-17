import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { signUp, signInWithGoogle } = useAuth()

  // Calculate password strength
  let strength = 0;
  if (password.length > 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (strength < 2) {
      setError('Please use a stronger password')
      setLoading(false)
      return
    }

    const { error: signUpError } = await signUp(email, password, fullName)

    if (signUpError) {
      setError(signUpError.message || 'Failed to create account')
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // They need to verify email via Supabase confirmation
    }
  }

  async function handleGoogleSignUp() {
    setError('')
    setGoogleLoading(true)
    const { error: googleError } = await signInWithGoogle()
    if (googleError) {
      setError(googleError.message || 'Failed to sign up with Google')
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-offwhite)] flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-10 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#166534]" />
          </div>
          <h2 className="text-[24px] font-semibold text-[var(--color-text-primary)] mb-3">
            Account created!
          </h2>
          <p className="text-[15px] text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            Please check your email to verify your account. Once verified, you can sign in and start generating.
          </p>
          <Link to="/login">
            <Button className="w-full h-11 bg-[#166534] hover:bg-[#14532d] text-white rounded-[10px] font-semibold">
              Go to sign in
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8">
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-semibold text-[var(--color-text-primary)] mb-2 tracking-tight">
            Create your account
          </h1>
          <p className="text-[14px] text-[var(--color-text-muted)]">
            Start with 3 free page generations
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg text-[13px] text-red-700 font-medium">
            {error}
          </div>
        )}

        <Button
          type="button"
          onClick={handleGoogleSignUp}
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
          Sign up with Google
        </Button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[var(--color-border-tertiary)]"></div>
          <span className="px-3 text-[12px] text-[var(--color-text-muted)] bg-white">or sign up with email</span>
          <div className="flex-1 border-t border-[var(--color-border-tertiary)]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11 bg-[var(--color-offwhite)] border-[var(--color-border)] rounded-[10px] text-[14px] focus:ring-2 focus:ring-[var(--color-green-700)]/20 focus:border-[var(--color-green-700)] transition-all"
            />
          </div>

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

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 bg-[var(--color-offwhite)] border-[var(--color-border)] rounded-[10px] text-[14px] focus:ring-2 focus:ring-[var(--color-green-700)]/20 focus:border-[var(--color-green-700)] transition-all"
            />
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="flex gap-1 mt-2">
                <div className={`h-1 w-1/4 rounded-full transition-colors duration-300 ${strength >= 1 ? (strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-500' : strength === 3 ? 'bg-lime-500' : 'bg-green-600') : 'bg-gray-200'}`} />
                <div className={`h-1 w-1/4 rounded-full transition-colors duration-300 ${strength >= 2 ? (strength === 2 ? 'bg-amber-500' : strength === 3 ? 'bg-lime-500' : 'bg-green-600') : 'bg-gray-200'}`} />
                <div className={`h-1 w-1/4 rounded-full transition-colors duration-300 ${strength >= 3 ? (strength === 3 ? 'bg-lime-500' : 'bg-green-600') : 'bg-gray-200'}`} />
                <div className={`h-1 w-1/4 rounded-full transition-colors duration-300 ${strength >= 4 ? 'bg-green-600' : 'bg-gray-200'}`} />
              </div>
            )}
            {password.length > 0 && strength < 2 && (
              <p className="text-[11px] text-red-500 mt-1">Add numbers or symbols to strengthen password.</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || googleLoading || (password.length > 0 && strength < 2)}
            className="w-full h-11 bg-[#166534] hover:bg-[#14532d] active:scale-[0.98] text-white rounded-[10px] font-semibold text-[15px] transition-all shadow-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create account — it's free"
            )}
          </Button>

          <p className="text-[11px] text-[var(--color-text-muted)] text-center pt-2">
            By signing up you agree to our Terms of Service and Privacy Policy
          </p>
        </form>

        <div className="mt-6 text-center text-[13px] text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#166534] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
