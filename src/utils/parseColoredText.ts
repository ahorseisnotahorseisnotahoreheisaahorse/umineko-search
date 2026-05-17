type Segment = {
    text: string
    color: string | null
  }
  
  const colorMap: Record<string, string> = {
    red: 'rgb(215,17,11)',
    blue: 'rgb(120,229,244)',
    purple: 'rgb(218,179,254)',
    gold: 'rgb(228,202,81)'
  }
  
  // convert #hexWord -> <#hex>Word
  function preprocess(input: string) {
    return input.replace(
      /#([0-9a-fA-F]{6})([^\s<]+)/g,
      '<#$1>$2'
    )
  }
  
  export function parseColoredText(input: string): Segment[] {
    const text = preprocess(input)
  
    const result: Segment[] = []
    let currentColor: string | null = null
  
    const regex = /<(\/?[a-zA-Z#0-9]+)>|([^<]+)/g
  
    let match
  
    while ((match = regex.exec(text)) !== null) {
      const tag = match[1]
      const chunk = match[2]
  
      if (tag) {
        const t = tag.toLowerCase()
  
        if (t === 'white') {
          currentColor = null
          continue
        }
  
        if (colorMap[t]) {
          currentColor = colorMap[t]
          continue
        }
  
        if (t.startsWith('#')) {
          currentColor = t
          continue
        }
  
        continue
      }
  
      if (chunk) {
        result.push({
          text: chunk,
          color: currentColor
        })
      }
    }
  
    return result
  }