const stopWords = new Set(['by', 'of', 'and', 'the', 'at', 'on'])

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function capitalizeAfterParen(word: string) {
  return word.replace(/\(([a-z])/, (_, c) => `(${c.toUpperCase()}`)
}

export function formatChapterName(raw: string) {
  const cleaned = raw.replace(/^\d+_/, '')
  const parts = cleaned.split('_')

  return parts
    .map((w, i) => {
      let lower = w.toLowerCase()

      lower = capitalizeAfterParen(lower)

      if (i !== 0 && stopWords.has(lower)) {
        return lower
      }

      return capitalize(lower)
    })
    .join(' ')
}