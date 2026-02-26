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

const REGIONS = ['All', 'Americas', 'Europe', 'Middle East', 'Asia-Pacific', 'Africa']

const REGION_COLORS: Record<string, string> = {
  'Americas': '#3b82f6',
  'Europe': '#8b5cf6',
  'Middle East': '#f59e0b',
  'Asia-Pacific': '#10b981',
  'Africa': '#ec4899',
  'All': '#6366f1'
}

// Map countries to regions
function getRegion(title: string, url: string): string {
  const text = (title + ' ' + url).toLowerCase()
  
  // Americas
  if (/usa|united states|america|canada|mexico|brazil|argentina|colombia|venezuela|chile|peru/i.test(text)) 
    return 'Americas'
  
  // Europe
  if (/europe|russia|ukraine|uk|britain|france|germany|italy|spain|poland|netherlands|sweden|norway|finland|belgium|austria|switzerland|greece|portugal|ireland|denmark|czech|hungary|romania|bulgaria/i.test(text)) 
    return 'Europe'
  
  // Middle East
  if (/middle east|israel|palestine|iran|iraq|syria|saudi|yemen|lebanon|jordan|turkey|egypt|uae|qatar|kuwait|bahrain|oman/i.test(text)) 
    return 'Middle East'
  
  // Asia-Pacific
  if (/china|japan|korea|india|pakistan|vietnam|thailand|indonesia|malaysia|philippines|taiwan|singapore|australia|new zealand|bangladesh|myanmar|nepal|sri lanka/i.test(text)) 
    return 'Asia-Pacific'
  
  // Africa
  if (/africa|nigeria|ethiopia|egypt|congo|south africa|kenya|tanzania|uganda|algeria|morocco|sudan|somalia|ghana|mozambique|madagascar|cameroon|libya|tunisia/i.test(text)) 
    return 'Africa'
  
  return 'All'
}

export default function Page() {
  const [events, setEvents] = useState<GeoEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  async function fetchEvents() {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(
        'https://api.gdeltproject.org/api/v2/doc/doc?query=geopolitics%20OR%20conflict%20OR%20diplomacy%20OR%20war%20OR%20sanctions%20OR%20treaty&mode=artlist&format=json&maxrecords=50&sort=datedesc',
        { cache: 'no-store' }
      )
      
      if (!res.ok) throw new Error('Failed to fetch events')
      
      const data = await res.json()
      
      if (!data.articles || data.articles.length === 0) {
        setEvents([])
        setLoading(false)
        return
      }

      const parsedEvents: GeoEvent[] = data.articles.map((article: any, idx: number) => {
        const title = article.title || 'Untitled'
        const url = article.url || ''
        const source = article.domain || new URL(url).hostname.replace('www.', '')
        const date = article.seendate || new Date().toISOString()
        const region = getRegion(title, url)
        
        return {
          id: `${article.url}-${idx}`,
          title,
          url,
          source,
          date: formatDate(date),
          region,
          summary: article.socialimage || ''
        }
      })
      
      setEvents(parsedEvents)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  function formatDate(dateStr: string): string {
    try {
      // GDELT format: YYYYMMDDHHMMSS
      if (dateStr.length === 14) {
        const year = dateStr.slice(0, 4)
        const month = dateStr.slice(4, 6)
        const day = dateStr.slice(6, 8)
        const hour = dateStr.slice(8, 10)
        const minute = dateStr.slice(10, 12)
        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`)
        
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)
        
        if (diffHours < 1) return 'Just now'
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return 'Unknown date'
    }
  }

  const filteredEvents = selectedRegion === 'All' 
    ? events 
    : events.filter(e => e.region === selectedRegion)

  const regionCounts = REGIONS.reduce((acc, region) => {
    acc[region] = region === 'All' 
      ? events.length 
      : events.filter(e => e.region === region).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">🌍 Geopolitical Events</h1>
              <p className="text-sm text-gray-500">
                Real-time tracking of global geopolitical developments
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
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {loading ? '⟳ Loading...' : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* Region Filters */}
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedRegion === region
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#1a1a24] text-gray-400 hover:bg-[#222230] hover:text-white border border-[#2a2a3a]'
                }`}
                style={
                  selectedRegion === region 
                    ? { background: REGION_COLORS[region] } 
                    : {}
                }
              >
                {region}
                <span className="ml-2 text-xs opacity-70">
                  ({regionCounts[region] || 0})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && events.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-500">Loading geopolitical events...</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No events found for {selectedRegion}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <a
              key={event.id}
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#14141e] hover:bg-[#1a1a28] rounded-xl border border-[#222] hover:border-[#333] p-5 transition-all duration-200 flex flex-col"
            >
              {/* Region Badge */}
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="region-badge"
                  style={{ 
                    background: `${REGION_COLORS[event.region]}20`,
                    color: REGION_COLORS[event.region],
                    border: `1px solid ${REGION_COLORS[event.region]}40`
                  }}
                >
                  {event.region}
                </span>
                <span className="text-xs text-gray-600">{event.date}</span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold mb-2 leading-snug group-hover:text-indigo-400 transition line-clamp-3">
                {event.title}
              </h3>

              {/* Source */}
              <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500">
                <span className="truncate">{event.source}</span>
                <span className="group-hover:text-indigo-400 transition ml-2">→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-600 border-t border-[#222] pt-6">
          <p>Data sourced from GDELT Project • Auto-refreshes every 5 minutes</p>
        </div>
      </div>
    </div>
  )
}
