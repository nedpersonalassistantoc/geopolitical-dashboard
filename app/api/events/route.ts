import { NextResponse } from 'next/server'

type RawArticle = { title: string; link: string; pubDate: string; source: string; description: string }

const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times' },
  { url: 'https://feeds.skynews.com/feeds/rss/world.xml', source: 'Sky News' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
]

let cache: { data: any; ts: number } | null = null
const CACHE_MS = 5 * 60 * 1000 // 5 min

function extractItems(xml: string, source: string): RawArticle[] {
  const items: RawArticle[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s)?.[1]?.trim() || ''
    const link = block.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s)?.[1]?.trim() || ''
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1]?.trim() || ''
    const desc = block.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s)?.[1]?.trim() || ''
    if (title && link) {
      items.push({ title, link, pubDate, source, description: desc.replace(/<[^>]*>/g, '').slice(0, 200) })
    }
  }
  return items
}

function classifyRegion(text: string): string {
  const t = text.toLowerCase()
  if (/\b(us |usa|united states|america|canada|mexico|brazil|argentina|colombia|venezuela|chile|peru|cuba|ecuador|bolivia|haiti|honduras|guatemala|panama|dominican|puerto rico|congress|white house|pentagon|washington|capitol)\b/.test(t)) return 'Americas'
  if (/\b(europe|eu |russia|ukraine|uk |britain|british|france|french|germany|german|italy|italian|spain|spanish|poland|polish|netherlands|dutch|sweden|norway|finland|belgium|austria|switzerland|greece|portugal|ireland|denmark|czech|hungary|romania|bulgaria|serbia|croatia|nato|brussels|moscow|kyiv|london|paris|berlin)\b/.test(t)) return 'Europe'
  if (/\b(middle east|israel|palestinian|gaza|iran|iraq|syria|syrian|saudi|yemen|lebanon|jordan|turkey|turkish|egypt|egyptian|uae|qatar|kuwait|bahrain|oman|houthi|hezbollah|hamas|tehran|jerusalem|tel aviv|cairo|ankara|riyadh)\b/.test(t)) return 'Middle East'
  if (/\b(china|chinese|japan|japanese|korea|korean|india|indian|pakistan|pakistan|vietnam|thai|indonesia|malaysia|philippines|taiwan|singapore|australia|australian|new zealand|bangladesh|myanmar|nepal|sri lanka|beijing|tokyo|delhi|seoul|taipei|hong kong|asia|pacific)\b/.test(t)) return 'Asia-Pacific'
  if (/\b(africa|african|nigeria|nigerian|ethiopia|congo|south africa|kenya|tanzania|uganda|algeria|morocco|sudan|sudanese|somalia|somali|ghana|mozambique|madagascar|cameroon|libya|libyan|tunisia|sahel|mali|niger|chad|senegal|zimbabwe|angola|nairobi|lagos|sahara)\b/.test(t)) return 'Africa'
  return 'Global'
}

// Filter to geopolitical keywords
function isGeopolitical(title: string, desc: string): boolean {
  const t = (title + ' ' + desc).toLowerCase()
  return /\b(war|conflict|military|troops|sanctions|nuclear|missile|border|invasion|coup|protest|diplomatic|diplomacy|treaty|ceasefire|geopolit|alliance|nato|un |united nations|security council|territory|sovereignty|election|government|regime|crisis|tension|weapon|army|navy|force|attack|strike|defend|occupation|refugee|migration|asylum|embargo|tariff|trade war|intelligence|espionage|assassination|terror|insurgent|rebel|militia|deploy|airstr|drone|summit|negotiate|arms|defence|defense|geopolit|foreign (policy|minister|affair)|state department|ambassador|envoy|peace talk|annex)\b/.test(t)
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data)
  }

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async feed => {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GeoDashboard/1.0)' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) return []
      const xml = await res.text()
      return extractItems(xml, feed.source)
    })
  )

  let articles: RawArticle[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') articles.push(...r.value)
  }

  // Filter to geopolitical content and dedupe by title similarity
  articles = articles.filter(a => isGeopolitical(a.title, a.description))

  // Sort by date descending
  articles.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0
    return db - da
  })

  // Dedupe by similar titles (first 50 chars)
  const seen = new Set<string>()
  articles = articles.filter(a => {
    const key = a.title.toLowerCase().slice(0, 50)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const events = articles.slice(0, 60).map((a, i) => ({
    id: `${i}-${Date.now()}`,
    title: a.title,
    url: a.link,
    source: a.source,
    date: a.pubDate,
    region: classifyRegion(a.title + ' ' + a.description),
    summary: a.description,
  }))

  const data = { events, fetchedAt: new Date().toISOString(), sources: RSS_FEEDS.length }
  cache = { data, ts: Date.now() }

  return NextResponse.json(data)
}
