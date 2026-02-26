'use client'
import { useState, useEffect } from 'react'

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

const REGION_COLORS: Record<string, string> = {
  Americas: '#3b82f6',
  Europe: '#8b5cf6',
  'Middle East': '#f59e0b',
  'Asia-Pacific': '#10b981',
  Africa: '#ec4899',
  Global: '#6b7280',
  All: '#6366f1',
}

const REGION_EMOJI: Record<string, string> = {
  Americas: '🌎',
  Europe: '🌍',
  'Middle East': '🕌',
  'Asia-Pacific': '🌏',
  Africa: '🌍',
  Global: '🌐',
}

function timeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export default function Page() {
  const [events, setEvents] = useState<GeoEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [sources, setSources] = useState(0)

  async function fetchEvents() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/events')
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      setEvents(data.events || [])
      setSources(data.sources || 0)
      setLastUpdate(new Date())
    } catch {
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const filteredEvents =
    selectedRegion === 'All' ? events : events.filter(e => e.region === selectedRegion)

  const regionCounts = REGIONS.reduce(
    (acc, region) => {
      acc[region] = region === 'All' ? events.length : events.filter(e => e.region === region).length
      return acc
    },
    {} as Record<string, number>,
  )

  // Hide regions with 0 events (except All)
  const visibleRegions = REGIONS.filter(r => r === 'All' || regionCounts[r] > 0)

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">🌍 Geopolitical Events</h1>
              <p className="text-sm text-gray-500">
                Real-time tracking of global geopolitical developments
                {sources > 0 && <span className="ml-1">• {sources} sources</span>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <span className="text-xs text-gray-600">
                  Updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="bg-[#1a1a28] hover:bg-[#222236] disabled:opacity-50 border border-[#2a2a3a] px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {loading ? '⟳ Loading...' : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* Region Filters */}
          <div className="flex flex-wrap gap-2">
            {visibleRegions.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedRegion === region
                    ? 'text-white shadow-lg'
                    : 'bg-[#14141e] text-gray-400 hover:bg-[#1a1a28] hover:text-white border border-[#222]'
                }`}
                style={
                  selectedRegion === region
                    ? { background: REGION_COLORS[region] }
                    : {}
                }
              >
                {REGION_EMOJI[region] && <span className="mr-1">{REGION_EMOJI[region]}</span>}
                {region}
                <span className="ml-2 text-xs opacity-70">({regionCounts[region] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && events.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4" />
            <p className="text-gray-500">Loading events…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredEvents.length === 0 && !error && (
          <div className="text-center py-20 text-gray-500">No events found for {selectedRegion}</div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <a
              key={event.id}
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#14141e] hover:bg-[#1a1a28] rounded-xl border border-[#222] hover:border-[#333] p-5 transition-all duration-200 flex flex-col"
            >
              {/* Top row: region + time */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: `${REGION_COLORS[event.region] || '#555'}15`,
                    color: REGION_COLORS[event.region] || '#888',
                    border: `1px solid ${REGION_COLORS[event.region] || '#555'}30`,
                  }}
                >
                  {event.region}
                </span>
                <span className="text-[11px] text-gray-600">{timeAgo(event.date)}</span>
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-semibold mb-2 leading-snug group-hover:text-indigo-400 transition line-clamp-3">
                {event.title}
              </h3>

              {/* Summary */}
              {event.summary && (
                <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
                  {event.summary}
                </p>
              )}

              {/* Footer: source */}
              <div className="mt-auto pt-3 border-t border-[#1e1e2e] flex items-center justify-between text-xs text-gray-600">
                <span className="truncate">{event.source}</span>
                <span className="group-hover:text-indigo-400 transition ml-2 text-sm">→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-600 border-t border-[#1a1a24] pt-6">
          Data sourced from BBC, Al Jazeera, NYT, Sky News, The Guardian • Auto-refreshes every 5 minutes
        </div>
      </div>
    </div>
  )
}
