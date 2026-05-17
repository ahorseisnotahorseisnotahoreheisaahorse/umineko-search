import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { episodeNames } from '../data/episodeNames'
import { Tooltip } from './Tooltip'
import { parseColoredText } from '../utils/parseColoredText'
import { characters } from '../data/characters'
import { formatChapterName } from '../utils/formatChapterName'

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

type Props = {
  m: Message
  includeJP: boolean
  includeEN: boolean
}

function formatSpeaker(name: string) {
  return name
    .toLowerCase()
    .replace(/(^|\s|-)\w/g, c => c.toUpperCase())
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightText(text: string, q: string, active: boolean) {
  const segments = parseColoredText(text)

  if (!active || !q) {
    return segments.map((s, i) => (
      <span key={i} style={s.color ? { color: s.color } : undefined}>
        {s.text}
      </span>
    ))
  }

  const regex = new RegExp(`(${escapeRegExp(q)})`, 'gi')

  return segments.map((segment, i) => {
    const parts = segment.text.split(regex)

    return (
      <span
        key={i}
        style={segment.color ? { color: segment.color } : undefined}
      >
        {parts.map((part, j) => {
          const isMatch = part.toLowerCase() === q.toLowerCase()

          if (!isMatch) return <span key={j}>{part}</span>

          return (
            <span
              key={j}
              className="bg-highlight-bg text-highlight-text font-bold"
            >
              {part}
            </span>
          )
        })}
      </span>
    )
  })
}

export function MessageItem({ m, includeJP, includeEN }: Props) {
  const epNum = m.ep.replace('ep', '')

  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim().toLowerCase() ?? ''

  const [highlight, setHighlight] = useState(true)

  useEffect(() => {
    setHighlight(true)

    if (!query) {
      setHighlight(false)
      return
    }

    const t = setTimeout(() => setHighlight(false), 3000)
    return () => clearTimeout(t)
  }, [query, m.id])

  const epFull = episodeNames[m.ep as keyof typeof episodeNames] ?? m.ep
  const chapterLabel = formatChapterName(m.chapter)
  const tooltipText = `${epFull} | ${chapterLabel}`

  const characterImage = useMemo(() => {
    const normalizedSpeaker = normalizeName(m.speaker)

    const entry = Object.entries(characters).find(([name]) => {
      return normalizeName(name) === normalizedSpeaker
    })

    return entry?.[1]
  }, [m.speaker])

  return (
    <div className="flex gap-3 p-3 bg-bg-panel hover:bg-bg-hover">
      {m.speaker !== 'narrator' && (
        <div className="w-11 h-11 flex-shrink-0 rounded-full p-[2px] bg-accent">
          <div className="w-full h-full rounded-full overflow-hidden bg-bg-input">
            {characterImage && (
              <img
                src={`/src/assets/sprites/${characterImage}`}
                alt={m.speaker}
                className="w-full h-full object-cover object-top scale-125"
                loading="lazy"
              />
            )}
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-text-primary">
            {formatSpeaker(m.speaker)}
          </div>

          <Tooltip text={tooltipText}>
            <div className="text-xs text-text-muted cursor-default">
              {`Ep${epNum} ${chapterLabel} #${m.id}`}
            </div>
          </Tooltip>
        </div>

        {includeJP && (
          <div className="text-sm mt-1 whitespace-pre-wrap text-text-muted">
            {highlightText(m.jp, query, highlight)}
          </div>
        )}

        {includeEN && (
          <div className="text-sm mt-1 whitespace-pre-wrap text-text-muted">
            {highlightText(m.en, query, highlight)}
          </div>
        )}
      </div>
    </div>
  )
}