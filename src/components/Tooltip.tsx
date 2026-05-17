import type { ReactNode } from 'react'

type Props = {
  text: string
  children: ReactNode
}

export function Tooltip({ text, children }: Props) {
  return (
    <div className="relative group inline-flex">
      {children}

      <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50">
        {text}
      </div>
    </div>
  )
}