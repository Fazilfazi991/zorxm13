import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, CreditCard } from 'lucide-react'

export function AuthHeader() {
  const { user, profile, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Get initials
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <div className="bg-white border-b border-[var(--color-border)] h-14 flex items-center justify-end px-6 sticky top-0 z-50 shadow-sm">
      {user && profile ? (
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1.5 border
            ${profile.credits > 1 ? 'bg-green-50 text-green-700 border-green-200' : 
              profile.credits === 1 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
              'bg-red-50 text-red-700 border-red-200'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${profile.credits > 1 ? 'bg-green-500' : profile.credits === 1 ? 'bg-amber-500' : 'bg-red-500'}`} />
            {profile.credits} credit{profile.credits !== 1 ? 's' : ''}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-full bg-[var(--color-offwhite)] border border-[var(--color-border)] flex items-center justify-center text-[13px] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-green-700)]/20"
            >
              {initials}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[var(--color-border)] py-1.5 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-[var(--color-border-tertiary)] mb-1">
                  <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{profile.full_name || 'User'}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate">{user.email}</p>
                </div>
                
                <Link to="/dashboard" className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-offwhite)] transition-colors" onClick={() => setDropdownOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/billing" className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-offwhite)] transition-colors" onClick={() => setDropdownOpen(false)}>
                  <CreditCard className="w-4 h-4" /> Billing
                </Link>
                
                <div className="h-px bg-[var(--color-border-tertiary)] my-1" />
                
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            Sign in
          </Link>
          <Link to="/signup">
            <Button size="sm" variant="outline" className="h-8 text-[12px] font-semibold border-[var(--color-green-700)] text-[var(--color-green-700)] hover:bg-[var(--color-green-700)] hover:text-white transition-all">
              Sign up free
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
