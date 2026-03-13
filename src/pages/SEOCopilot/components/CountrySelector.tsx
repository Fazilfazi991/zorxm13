import { useState } from 'react'
import { Country } from '../types/report.types'

const COUNTRIES: Country[] = [
  { code: 'us', name: 'United States', flag: '🇺🇸', gl: 'us', hl: 'en' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧', gl: 'uk', hl: 'en' },
  { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪', gl: 'ae', hl: 'ar' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', gl: 'sa', hl: 'ar' },
  { code: 'in', name: 'India', flag: '🇮🇳', gl: 'in', hl: 'en' },
  { code: 'au', name: 'Australia', flag: '🇦🇺', gl: 'au', hl: 'en' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦', gl: 'ca', hl: 'en' },
  { code: 'de', name: 'Germany', flag: '🇩🇪', gl: 'de', hl: 'de' },
  { code: 'fr', name: 'France', flag: '🇫🇷', gl: 'fr', hl: 'fr' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬', gl: 'sg', hl: 'en' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰', gl: 'pk', hl: 'en' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬', gl: 'ng', hl: 'en' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦', gl: 'za', hl: 'en' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷', gl: 'br', hl: 'pt' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽', gl: 'mx', hl: 'es' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵', gl: 'jp', hl: 'ja' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱', gl: 'nl', hl: 'nl' },
  { code: 'nz', name: 'New Zealand', flag: '🇳🇿', gl: 'nz', hl: 'en' },
]

export function CountrySelector({ 
  value, onChange 
}: { 
  value: Country | null
  onChange: (country: Country) => void 
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between
                   bg-white/[0.04] border border-white/[0.08]
                   rounded-xl px-4 py-3 text-left
                   hover:border-white/[0.15] transition-colors">
        {value ? (
          <span className="flex items-center gap-3 text-white">
            <span className="text-xl">{value.flag}</span>
            <span className="font-dm">{value.name}</span>
          </span>
        ) : (
          <span className="text-zinc-600 font-dm">
            Select target country...
          </span>
        )}
        <span className="text-zinc-500 text-xs text-center flex items-center">▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 
                        bg-[#0D1117] border border-white/[0.08] 
                        rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-white/[0.06]">
            <input
              autoFocus
              placeholder="Search country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] rounded-lg 
                         px-3 py-2 text-sm text-white font-dm
                         placeholder:text-zinc-600 outline-none
                         border border-white/[0.06]"
            />
          </div>
          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.map(country => (
              <button
                key={country.code}
                type="button"
                onClick={() => { onChange(country); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3
                           hover:bg-white/[0.04] transition-colors
                           text-left">
                <span className="text-xl">{country.flag}</span>
                <span className="text-sm text-zinc-300 font-dm">
                  {country.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
