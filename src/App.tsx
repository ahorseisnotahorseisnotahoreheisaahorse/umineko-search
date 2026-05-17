import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import data from './data/script.json'
import { MessageItem } from './components/MessageItem'
import { SettingsMenu } from './components/SettingsMenu'
import { ActiveFiltersBar } from './components/ActiveFiltersBar'
import { InfoModal } from './components/InfoModal'

type Message = {
  id: number
  ep: string
  chapter: string
  chapterIndex: number
  speaker: string
  jp: string
  en: string
  text: string
}

function normalize(s: string) {
  return s.toLowerCase()
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function App() {
  const messages = (data as any).messages as Message[]

  const filtersBtnRef = useRef<HTMLButtonElement | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') ?? '')
  const [page, setPage] = useState(Number(searchParams.get('p') ?? 1))

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const [includeJP, setIncludeJP] = useState(searchParams.get('jp') === '1')
  const [includeEN, setIncludeEN] = useState(searchParams.get('en') !== '0')

  const [filters, setFilters] = useState(() => {
    const eps: any = {}

    messages.forEach(m => {
      if (!eps[m.ep]) {
        eps[m.ep] = {
          included: true,
          chapters: {}
        }
      }

      eps[m.ep].chapters[m.chapter] = true
    })

    return eps
  })

  const pageSize = useMemo(() => {
    const raw = Number(searchParams.get('pp') ?? 10)
    return clamp(Number.isNaN(raw) ? 10 : raw, 1, 50)
  }, [searchParams])

  const activeCharacters = useMemo(() => {
    const raw = searchParams.get('chars')

    if (!raw) return null

    if (raw === '__NONE__') {
      return new Set<string>()
    }

    return new Set(raw.split(',').map(normalize).filter(Boolean))
  }, [searchParams])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query)
    }, 250)

    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    params.set('q', debouncedQuery)
    params.set('p', String(page))
    params.set('jp', includeJP ? '1' : '0')
    params.set('en', includeEN ? '1' : '0')
    params.set('pp', String(pageSize))

    setSearchParams(params, { replace: true })
  }, [debouncedQuery, page, includeJP, includeEN, pageSize])

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()

    return messages.filter(m => {
      const epState = filters[m.ep]
      if (!epState) return false

      if (!epState.included) return false
      if (!epState.chapters[m.chapter]) return false

      const hasJP = m.jp.trim() !== ''
      const hasEN = m.en.trim() !== ''

      if ((includeJP && !hasJP) || (includeEN && !hasEN)) return false
      if (!includeJP && !includeEN) return false
      if (!hasJP && !hasEN) return false

      if (activeCharacters !== null) {
        const speakerKey = normalize(m.speaker)
        if (!activeCharacters.has(speakerKey)) return false
      }

      const searchable: string[] = []
      if (includeJP && hasJP) searchable.push(m.jp)
      if (includeEN && hasEN) searchable.push(m.en)

      const haystack = searchable.join(' ').toLowerCase()

      if (!q) return true
      return haystack.includes(q)
    })
  }, [messages, debouncedQuery, filters, includeJP, includeEN, activeCharacters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  return (
    <div className="min-h-screen bg-[#2b2d31] text-[#dcddde] flex justify-center relative">
      <div className="w-full max-w-[1000px] flex flex-col min-h-screen">
        <div className="p-4 border-b border-[#1e1f22] bg-[#1e1f22]">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xl font-bold">Uminkeo search</div>

            <button
              onClick={() => setInfoOpen(true)}
              className="px-3 py-1 bg-[#383a40] rounded"
            >
              ⓘ info
            </button>
          </div>

          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search..."
              className="flex-1 min-w-0 bg-[#383a40] text-white px-3 py-2 rounded outline-none"
            />

            <button
              ref={filtersBtnRef}
              onClick={() => setFiltersOpen(v => !v)}
              className="px-3 py-2 bg-[#383a40] rounded"
            >
              settings
            </button>
          </div>

          <ActiveFiltersBar
            includeJP={includeJP}
            includeEN={includeEN}
            setIncludeJP={setIncludeJP}
            setIncludeEN={setIncludeEN}
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        <div className="flex-1 overflow-auto">
          {pageItems.map(m => (
            <MessageItem
              key={`${m.id}-${m.ep}`}
              m={m}
              includeJP={includeJP}
              includeEN={includeEN}
            />
          ))}
        </div>

        <div className="p-3 border-t border-[#1e1f22] bg-[#1e1f22] flex justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 bg-[#383a40] rounded"
          >
            prev
          </button>

          <input
            className="w-16 text-center bg-[#383a40] rounded"
            value={safePage}
            onChange={e => {
              const val = Number(e.target.value)
              if (!isNaN(val)) setPage(val)
            }}
          />

          <span className="text-sm text-gray-400">/ {totalPages}</span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-[#383a40] rounded"
          >
            next
          </button>
        </div>

        <SettingsMenu
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          includeJP={includeJP}
          setIncludeJP={setIncludeJP}
          includeEN={includeEN}
          setIncludeEN={setIncludeEN}
          filters={filters}
          setFilters={setFilters}
          anchorRef={filtersBtnRef}
        />

        <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />

        <div className="p-3 border-t border-[#1e1f22] bg-[#1e1f22] text-xs text-[#9ca3af] flex justify-between">
          <div>Umineko search</div>
          <div>lambas bombsona 2037 © all rights preserved</div>
          <div className="flex gap-3">
            <span>JP/EN</span>
            <span>•</span>
            <span>{filtered.length} messages</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App