import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Generation } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, CreditCard, Wand2, History, Loader2, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function Dashboard() {
  const { profile, user, signOut } = useAuth()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGenerations() {
      if (!user) return
      
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) setGenerations(data)
      setLoading(false)
    }
    
    fetchGenerations()
  }, [user])

  if (!profile) return null

  const isLowOnCredits = profile.plan === 'free' && profile.credits <= 1;

  return (
    <div className="min-h-screen bg-[var(--color-offwhite)]">
      <Navbar />
      
      <main className="max-w-[1000px] mx-auto px-4 py-32">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--color-text-primary)] tracking-tight mb-2">
              Welcome back, {profile.full_name?.split(' ')[0] || 'Creator'}
            </h1>
            <p className="text-[15px] text-[var(--color-text-secondary)]">
              Manage your generated pages and credits
            </p>
          </div>
          
          <Link to="/ai-generator">
            <Button className="bg-[#166534] hover:bg-[#14532d] text-white rounded-[10px] shadow-sm">
              <Wand2 className="w-4 h-4 mr-2" />
              New Generation
            </Button>
          </Link>
        </div>

        {isLowOnCredits && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="font-semibold text-amber-900 text-[15px]">Running low on credits</p>
                <p className="text-[13px] text-amber-700 mt-0.5">Upgrade for unlimited generations and pro features.</p>
              </div>
            </div>
            <Link to="/billing">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-6 rounded-[16px] border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)] mb-3">
              <CreditCard className="w-4 h-4" />
              <span className="text-[13px] font-medium uppercase tracking-wider">Credits Remaining</span>
            </div>
            <div className="text-[32px] font-semibold text-[var(--color-text-primary)]">
              {profile.credits}
            </div>
            <div className="text-[13px] text-[var(--color-text-secondary)] mt-2">
              {profile.plan === 'free' ? 'Free plan' : 'Pro plan'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[16px] border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)] mb-3">
              <History className="w-4 h-4" />
              <span className="text-[13px] font-medium uppercase tracking-wider">Pages Generated</span>
            </div>
            <div className="text-[32px] font-semibold text-[var(--color-text-primary)]">
              {generations.length}
            </div>
            <div className="text-[13px] text-[var(--color-text-secondary)] mt-2">
              Total lifetime
            </div>
          </div>

          <div className="bg-white p-6 rounded-[16px] border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)] mb-3">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-[13px] font-medium uppercase tracking-wider">Member Since</span>
            </div>
            <div className="text-[32px] font-semibold text-[var(--color-text-primary)]">
              {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border-tertiary)] flex justify-end">
               <button onClick={signOut} className="text-[13px] text-red-600 hover:text-red-700 font-medium">
                 Sign Out
               </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--color-border)]">
            <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Recent Generations</h2>
          </div>
          
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" />
            </div>
          ) : generations.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 bg-[var(--color-offwhite)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-7 h-7 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)] mb-1">No generations yet</h3>
              <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">Create your first AI-powered Elementor page now</p>
              <Link to="/ai-generator">
                <Button className="bg-[#166534] hover:bg-[#14532d] text-white rounded-[10px]">
                  Go to Generator <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-offwhite)] text-[12px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    <th className="px-6 py-3 font-medium">Business Name</th>
                    <th className="px-6 py-3 font-medium">Page Type</th>
                    <th className="px-6 py-3 font-medium">Style</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-tertiary)]">
                  {generations.map(gen => (
                    <tr key={gen.id} className="hover:bg-[var(--color-offwhite-dark)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[14px] text-[var(--color-text-primary)] flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gen.primary_color }} />
                          {gen.business_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[var(--color-text-secondary)] capitalize">
                        {gen.page_type}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[var(--color-text-secondary)] capitalize">
                        {gen.style_id?.replace('-', ' ') || 'Default'}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[var(--color-text-muted)]">
                        {new Date(gen.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/ai-generator?regen=${gen.id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-[12px] border-[var(--color-border)] rounded-lg">
                            Regenerate
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
