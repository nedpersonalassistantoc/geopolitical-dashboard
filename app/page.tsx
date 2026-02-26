'use client'
import { useState, useEffect, useCallback } from 'react'

type GeoEvent = {
  id: string
  title: string
  url: string
  source: string
  date: string
  region: string
  summary: string
}

const REGIONS = ['All', 'Americas', 'Europe', 'Middle East', 'Asia-Pacific', 'Africa', 'Global']

const REGION_CONFIG: Record<string, { color: string; emoji: string }> = {
  Americas:       { color: '#3b82f6', emoji: '🌎' },
  Europe:         { color: '#a78bfa', emoji: '🇪🇺' },
  'Middle East':  { color: '#f59e0b', emoji: '🕌' },
  'Asia-Pacific': { color: '#34d399', emoji: '🌏' },
  Africa:         { color: '#f472b6', emoji: '🌍' },
  Global:         { color: '#71717a', emoji: '🌐' },
  All:            { color: '#6366f1', emoji: '🔵' },
}

function timeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    const diffMs = Date.now() - date.getTime()
    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)
    if (mins < 2) return 'Just now'
    if (mins < 60) return `${mins}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function SourceIcon({ source }: { source: string }) {
  const s = source.toLowerCase()
  let initials = source.slice(0, 2).toUpperCase()
  let bg = '#27272a'
  if (s.includes('bbc')) { initials = 'BBC'; bg = '#b91c1c' }
  else if (s.includes('al jazeera')) { initials = 'AJ'; bg = '#d97706' }
  else if (s.includes('ny times') || s.includes('nyt')) { initials = 'NYT'; bg = '#1e3a5f' }
  else if (s.includes('sky')) { initials = 'SKY'; bg = '#0369a1' }
  else if (s.includes('guardian')) { initials = 'TG'; bg = '#1d4ed8' }

  return (
    <span
      className="inline-flex items-center justify-center rounded-md text-[9px] font-bold tracking-wide text-white shrink-0"
      style={{ background: bg, width: 28, height: 18 }}
    >
      {initials}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-5 space-y-3" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex justify-between">
            <div className="shimmer h-5 w-20 rounded-full" />
            <div className="shimmer h-4 w-10 rounded" />
          </div>
          <div className="shimmer h-5 w-full rounded" />
          <div className="shimmer h-5 w-3/4 rounded" />
          <div className="shimmer h-4 w-full rounded mt-2" />
          <div className="shimmer h-4 w-2/3 rounded" />
          <div className="flex justify-between mt-3">
            <div className="shimmer h-4 w-16 rounded" />
            <div className="shimmer h-4 w-4 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  const [events, setEvents] = useState<GeoEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/events')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setEvents(data.events || [])
      setLastUpdate(new Date())
    } catch {
      setError('Failed to load events.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchEvents])

  const filteredEvents =
    selectedRegion === 'All' ? events : events.filter(e => e.region === selectedRegion)

  const regionCounts = REGIONS.reduce((acc, r) => {
    acc[r] = r === 'All' ? events.length : events.filter(e => e.region === r).length
    return acc
  }, {} as Record<string, number>)

  const visibleRegions = REGIONS.filter(r => r === 'All' || regionCounts[r] > 0)

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-[#1e1e22] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌍</span>
            <h1 className="text-base md:text-lg font-semibold tracking-tight">Geopolitical Events</h1>
            {lastUpdate && (
              <div className="hidden sm:flex items-center gap-1.5 ml-3 text-[11px] text-[#52525b]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                Live
              </div>
            )}
          </div>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] disabled:opacity-40 transition-all"
          >
            {loading ? '↻' : '↻ Refresh'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
        {/* Filters — horizontal scroll on mobile */}
        <div className="mb-5 md:mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap scrollbar-hide">
            {visibleRegions.map(region => {
              const active = selectedRegion === region
              const cfg = REGION_CONFIG[region]
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'text-white filter-active'
                      : 'bg-[#111113] text-[#71717a] border border-[#1e1e22] hover:text-[#a1a1aa] hover:border-[#2a2a30]'
                  }`}
                  style={active ? { background: cfg.color } : {}}
                >
                  <span className="text-sm">{cfg.emoji}</span>
                  <span>{region}</span>
                  <span className={`text-[10px] ${active ? 'text-white/70' : 'text-[#52525b]'}`}>
                    {regionCounts[region]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card rounded-xl p-4 mb-5 border-red-900/50 text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
            <button onClick={fetchEvents} className="ml-auto text-xs underline underline-offset-2 hover:text-red-300">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && events.length === 0 && <LoadingSkeleton />}

        {/* Empty */}
        {!loading && filteredEvents.length === 0 && !error && (
          <div className="text-center py-24 text-[#52525b]">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">No events found for {selectedRegion}</p>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredEvents.map((event, i) => {
            const cfg = REGION_CONFIG[event.region] || REGION_CONFIG.Global
            return (
              <a
                key={event.id}
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-2xl p-4 md:p-5 flex flex-col fade-up group"
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
              >
                {/* Top: region + time */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="region-pill"
                    style={{
                      background: `${cfg.color}15`,
                      color: cfg.color,
                      border: `1px solid ${cfg.color}25`,
                    }}
                  >
                    {event.region}
                  </span>
                  <span className="text-[11px] text-[#52525b] tabular-nums">{timeAgo(event.date)}</span>
                </div>

                {/* Title */}
                <h3 className="text-[14px] md:text-[15px] font-semibold leading-[1.4] mb-2 group-hover:text-indigo-400 transition-colors line-clamp-3">
                  {event.title}
                </h3>

                {/* Summary */}
                {event.summary && (
                  <p className="text-[12px] leading-relaxed text-[#71717a] mb-3 line-clamp-2">
                    {event.summary.replace(/<[^>]*>/g, '')}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-[#1a1a1e] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SourceIcon source={event.source} />
                    <span className="text-[11px] text-[#52525b]">{event.source}</span>
                  </div>
                  <span className="text-xs text-[#3f3f46] group-hover:text-indigo-400 transition-colors">→</span>
                </div>
              </a>
            )
          })}
        </div>

        {/* Footer */}
        <footer className="mt-10 md:mt-14 pb-6 text-center">
          <p className="text-[11px] text-[#3f3f46]">
            BBC · Al Jazeera · NY Times · Sky News · The Guardian — refreshes every 5 min
          </p>
        </footer>
      </main>
    </div>
  )
}
