import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

type Props = {
    includeJP: boolean
    includeEN: boolean

    setIncludeJP: React.Dispatch<React.SetStateAction<boolean>>
    setIncludeEN: React.Dispatch<React.SetStateAction<boolean>>

    filters: Record<
        string,
        {
            included: boolean
            chapters: Record<string, boolean>
        }
    >

    setFilters: React.Dispatch<React.SetStateAction<any>>
}

export function ActiveFiltersBar({
    includeJP,
    includeEN,
    setIncludeJP,
    setIncludeEN,
    filters,
    setFilters
}: Props) {
    const [searchParams, setSearchParams] = useSearchParams()

    const activeCharacters = useMemo(() => {
        const raw = searchParams.get('chars')

        if (!raw) return null
        if (raw === '__NONE__') return new Set<string>()

        return new Set(raw.split(',').map(s => s.toLowerCase()).filter(Boolean))
    }, [searchParams])

    const items: {
        key: string
        label: string
        clear: () => void
    }[] = []

    if (!includeJP || !includeEN) {
        items.push({
            key: 'lang',
            label: `Language: ${[includeJP ? 'JP' : null, includeEN ? 'EN' : null]
                .filter(Boolean)
                .join(', ') || 'none'}`,
            clear: () => {
                setIncludeJP(true)
                setIncludeEN(true)
            }
        })
    }

    const modifiedEpisodes = Object.keys(filters).filter(ep =>
        Object.values(filters[ep].chapters).some(v => v === false)
    )

    if (modifiedEpisodes.length > 0) {
        items.push({
            key: 'episodes',
            label: `Episodes modified: ${modifiedEpisodes.length}`,
            clear: () => {
                setFilters((prev: any) => {
                    const next = structuredClone(prev)
                    Object.keys(next).forEach(ep => {
                        Object.keys(next[ep].chapters).forEach(ch => {
                            next[ep].chapters[ch] = true
                        })
                        next[ep].included = true
                    })
                    return next
                })
            }
        })
    }

    if (activeCharacters !== null) {
        items.push({
            key: 'chars',
            label: `Characters: ${activeCharacters.size}`,
            clear: () => {
                const params = new URLSearchParams(searchParams)
                params.delete('chars')
                setSearchParams(params, { replace: true })
            }
        })
    }

    if (items.length === 0) return null

    return (
        <div className="mb-2 p-2 rounded bg-bg-panel">
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-text-muted whitespace-nowrap">
                    Active filters:
                </span>

                {items.map(i => (
                    <div
                        key={i.key}
                        onClick={i.clear}
                        className="cursor-pointer select-none flex items-center gap-2 px-2 py-1 rounded bg-bg-input text-xs hover:bg-bg-hover"
                    >
                        <span>{i.label}</span>

                        <span
                            onClick={e => {
                                e.stopPropagation()
                                i.clear()
                            }}
                            className="text-base leading-none text-text-muted hover:text-text-primary"
                        >
                            ×
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}