import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { episodeNames } from '../data/episodeNames'
import { formatChapterName } from '../utils/formatChapterName'
import { characters } from '../data/characters'

type Props = {
  open: boolean
  onClose: () => void
  includeJP: boolean
  setIncludeJP: React.Dispatch<React.SetStateAction<boolean>>
  includeEN: boolean
  setIncludeEN: React.Dispatch<React.SetStateAction<boolean>>
  filters: Record<
    string,
    {
      included: boolean
      chapters: Record<string, boolean>
    }
  >
  setFilters: React.Dispatch<React.SetStateAction<any>>

  anchorRef?: React.RefObject<HTMLButtonElement | null>
}

function normalize(s: string) {
  return s.toLowerCase()
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 transition-transform ${open ? 'rotate-90' : ''}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M6 4l8 6-8 6V4z" />
    </svg>
  )
}

const characterNames = Object.keys(characters) as Array<keyof typeof characters>

function clampMessagesPerPage(value: number) {
  return Math.max(1, Math.min(50, value))
}

function getEpisodeNumber(ep: string) {
  const match = ep.match(/\d+/)
  return match ? Number(match[0]) : null
}

export function SettingsMenu({
  open,
  onClose,
  includeJP,
  setIncludeJP,
  includeEN,
  setIncludeEN,
  filters,
  setFilters,
  anchorRef
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const menuRef = useRef<HTMLDivElement | null>(null)

  const [episodesOpen, setEpisodesOpen] = useState(false)
  const [charactersOpen, setCharactersOpen] = useState(false)
  const [expandedEpisodes, setExpandedEpisodes] = useState<Record<string, boolean>>({})

  // ---------------- ACTIVE CHARACTERS ----------------

  const activeCharacters = useMemo(() => {
    const raw = searchParams.get('chars')

    if (!raw) return null
    if (raw === '__NONE__') return new Set<string>()

    return new Set(raw.split(',').map(normalize).filter(Boolean))
  }, [searchParams])

  // ---------------- MESSAGES PER PAGE ----------------

  const messagesPerPage = useMemo(() => {
    const raw = Number(searchParams.get('pp') ?? 10)
    return clampMessagesPerPage(Number.isNaN(raw) ? 10 : raw)
  }, [searchParams])

  const setMessagesPerPage = (value: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('pp', String(clampMessagesPerPage(value)))
    setSearchParams(params, { replace: true })
  }

  // ---------------- CLICK OUTSIDE ----------------

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handler)

    return () => {
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  // ---------------- EPISODES ----------------

  const toggleChapter = (ep: string, ch: string) => {
    setFilters((prev: any) => {
      const next = structuredClone(prev)

      next[ep].chapters[ch] = !next[ep].chapters[ch]

      const anyChapterOn = Object.values(next[ep].chapters).some(Boolean)
      next[ep].included = anyChapterOn

      return next
    })
  }

  const toggleEpisode = (ep: string) => {
    setFilters((prev: any) => {
      const next = structuredClone(prev)
      const nextValue = !next[ep].included

      next[ep].included = nextValue

      Object.keys(next[ep].chapters).forEach(ch => {
        next[ep].chapters[ch] = nextValue
      })

      return next
    })
  }

  const toggleAllEpisodes = (value: boolean) => {
    setFilters((prev: any) => {
      const next = structuredClone(prev)

      Object.keys(next).forEach(ep => {
        next[ep].included = value

        Object.keys(next[ep].chapters).forEach(ch => {
          next[ep].chapters[ch] = value
        })
      })

      return next
    })
  }

  const setQuestionArcs = () => {
    setFilters((prev: any) => {
      const next = structuredClone(prev)

      Object.keys(next).forEach((ep, index) => {
        const epNum = getEpisodeNumber(ep)
        const isQuestionArc = epNum !== null ? epNum >= 1 && epNum <= 4 : index < 4

        next[ep].included = isQuestionArc

        Object.keys(next[ep].chapters).forEach(ch => {
          next[ep].chapters[ch] = isQuestionArc
        })
      })

      return next
    })
  }

  const setAnswerArcs = () => {
    setFilters((prev: any) => {
      const next = structuredClone(prev)

      Object.keys(next).forEach((ep, index) => {
        const epNum = getEpisodeNumber(ep)
        const isAnswerArc = epNum !== null ? epNum >= 5 && epNum <= 8 : index >= 4 && index < 8

        next[ep].included = isAnswerArc

        Object.keys(next[ep].chapters).forEach(ch => {
          next[ep].chapters[ch] = isAnswerArc
        })
      })

      return next
    })
  }

  // ---------------- CHARACTERS ----------------

  const setChars = (next: Set<string> | null) => {
    const params = new URLSearchParams(searchParams)

    if (!next) {
      params.delete('chars')
    } else if (next.size === 0) {
      params.set('chars', '__NONE__')
    } else {
      params.set('chars', Array.from(next).join(','))
    }

    setSearchParams(params, { replace: true })
  }

  const toggleCharacter = (name: string) => {
    const key = normalize(name)

    let next: Set<string>

    if (activeCharacters === null) {
      next = new Set(characterNames.map(normalize))
    } else {
      next = new Set(activeCharacters)
    }

    if (next.has(key)) next.delete(key)
    else next.add(key)

    setChars(next)
  }

  const toggleAllCharacters = (value: boolean) => {
    if (value) setChars(null)
    else setChars(new Set())
  }

  const isCharacterActive = (name: string) => {
    const key = normalize(name)
    return activeCharacters === null || activeCharacters.has(key)
  }

  // ---------------- RENDER ----------------

  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!anchorRef?.current) return
    if (!open) return

    const rect = anchorRef.current.getBoundingClientRect()

    setPos({
      top: rect.top,
      left: rect.right
    })
  }, [open, anchorRef])

  return (
    <div
      ref={menuRef}
      className={[
        'fixed w-[min(92vw,420px)] max-h-[70vh]',
        'overflow-y-auto bg-bg-primary border border-bg-secondary rounded z-50',
        'p-3 text-sm text-text-primary',
        !open ? 'hidden' : ''
      ].join(' ')}
      style={{
        top: pos.top,
        left: pos.left,
        transform: 'translateX(-100%)'
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between mb-3">
        <div className="font-semibold">Settings</div>

        <button onClick={onClose} className="px-2 py-1 bg-bg-input rounded">
          close
        </button>
      </div>

      {/* LANGUAGE */}
      <div className="mb-4">
        <div className="text-xs text-text-muted mb-2">Language</div>

        <div className="flex gap-2">
          <button
            onClick={() => setIncludeJP(v => !v)}
            className={`px-2 py-1 rounded ${includeJP ? 'bg-accent' : 'bg-bg-input opacity-50'}`}
          >
            JP
          </button>

          <button
            onClick={() => setIncludeEN(v => !v)}
            className={`px-2 py-1 rounded ${includeEN ? 'bg-accent' : 'bg-bg-input opacity-50'}`}
          >
            EN
          </button>
        </div>
      </div>

      {/* EPISODES */}
      <div
        className="flex justify-between items-center mb-2 cursor-pointer hover:bg-bg-hover rounded select-none"
        onClick={() => setEpisodesOpen(v => !v)}
      >
        <div className="text-xs text-text-muted">Episodes</div>

        <div
          className="text-xs px-2 py-1 bg-bg-input rounded"
          onClick={e => {
            setEpisodesOpen(v => !v)
            e.stopPropagation()
          }}
        >
          {episodesOpen ? 'hide' : 'show'}
        </div>
      </div>

      {episodesOpen && (
        <>
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={() => toggleAllEpisodes(true)}
              className="px-2 py-1 bg-bg-input rounded"
            >
              include all
            </button>

            <button
              onClick={() => toggleAllEpisodes(false)}
              className="px-2 py-1 bg-bg-input rounded"
            >
              exclude all
            </button>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={setQuestionArcs}
              className="px-2 py-1 bg-bg-input rounded"
            >
              question arcs
            </button>

            <button
              onClick={setAnswerArcs}
              className="px-2 py-1 bg-bg-input rounded"
            >
              answer arcs
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {Object.keys(filters).map(ep => {
              const isOpen = !!expandedEpisodes[ep]

              return (
                <div key={ep} className="rounded p-2 bg-bg-panel">
                  <div
                    className="flex justify-between items-center px-2 py-1 hover:bg-bg-hover cursor-pointer"
                    onClick={() =>
                      setExpandedEpisodes(prev => ({
                        ...prev,
                        [ep]: !prev[ep]
                      }))
                    }
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Chevron open={isOpen} />
                      <span className="truncate">
                        {episodeNames[ep as keyof typeof episodeNames] ?? ep}
                      </span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation()
                        toggleEpisode(ep)
                      }}
                      className="text-xs px-2 py-1 bg-bg-input rounded"
                    >
                      toggle
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-2 pl-2 space-y-1">
                      {Object.keys(filters[ep].chapters).map(ch => {
                        const active = filters[ep].chapters[ch]

                        return (
                          <div
                            key={ch}
                            onClick={() => toggleChapter(ep, ch)}
                            className="flex justify-between text-xs px-2 py-1 rounded cursor-pointer hover:bg-bg-hover"
                          >
                            <span className="truncate">
                              {formatChapterName(ch)}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded ${active ? 'bg-accent' : 'bg-bg-input'}`}
                            >
                              {active ? 'on' : 'off'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* CHARACTERS */}
      <div
        className="flex justify-between items-center mb-2 cursor-pointer hover:bg-bg-hover rounded select-none"
        onClick={() => setCharactersOpen(v => !v)}
      >
        <div className="text-xs text-text-muted">Characters</div>

        <div
          className="text-xs px-2 py-1 bg-bg-input rounded"
          onClick={e => {
            setCharactersOpen(v => !v)
            e.stopPropagation()
          }}
        >
          {charactersOpen ? 'hide' : 'show'}
        </div>
      </div>

      {charactersOpen && (
        <>
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={() => toggleAllCharacters(true)}
              className="px-2 py-1 bg-bg-input rounded"
            >
              include all
            </button>

            <button
              onClick={() => toggleAllCharacters(false)}
              className="px-2 py-1 bg-bg-input rounded"
            >
              exclude all
            </button>
          </div>

          <div className="space-y-1">
            {characterNames.map(name => {
              const active = isCharacterActive(name)
              const sprite = characters[name]

              return (
                <div
                  key={name}
                  onClick={() => toggleCharacter(name)}
                  className={`flex items-center justify-between gap-2 text-xs px-2 py-1 rounded cursor-pointer hover:bg-bg-hover ${active ? 'bg-bg-panel' : 'bg-bg-muted opacity-60'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {sprite ? (
                      <img
                        src={`src/assets/sprites/${sprite}`}
                        alt={name}
                        className="w-8 h-8 rounded object-cover flex-shrink-0 bg-bg-input"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-bg-input flex-shrink-0" />
                    )}

                    <span className="truncate">{name}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded flex-shrink-0 ${active ? 'bg-accent' : 'bg-bg-input'
                      }`}
                  >
                    {active ? 'on' : 'off'}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* MESSAGES PER PAGE */}
      <div className="flex justify-between items-center mt-3 mb-2">
        <div className="text-xs text-text-muted">Messages per page</div>
      </div>

      <div className="mb-2">
        <input
          type="number"
          min={1}
          max={50}
          value={messagesPerPage}
          onChange={e => {
            const raw = Number(e.target.value)
            if (Number.isNaN(raw)) return
            setMessagesPerPage(raw)
          }}
          className="w-full px-2 py-1 rounded bg-bg-input text-text-primary text-xs"
        />
      </div>
    </div>
  )
}