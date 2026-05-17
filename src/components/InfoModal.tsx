import { useEffect } from 'react'

type Props = {
    open: boolean
    onClose: () => void
}

export function InfoModal({ open, onClose }: Props) {
    useEffect(() => {
        if (!open) return

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="w-[min(92vw,520px)] bg-[#1e1f22] rounded p-4 text-[#dcddde]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-3">
                    <div className="font-bold">Info</div>

                    <button
                        onClick={onClose}
                        className="px-2 py-1 bg-[#383a40] rounded"
                    >
                        close
                    </button>
                </div>

                <div className="text-sm space-y-2">
                    <div>search and filter ui for structured episode data</div>
                    <br />
                    <div>filters include <span className='font-bold'>episodes</span> <span className='font-bold'>chapters</span> <span className='font-bold'>characters</span> and <span className='font-bold'>en/jp</span></div>
                    <div>the page takes long to load because it's a static website so the text data has to be on the client</div>
                    <div>the text is <span className='underline'>brutally scuffed</span> because the data is <span className='font-bold'>evil</span> and impossible difficulty to clean </div>
                    <div>select message count per page in the settings</div>
                    <br />
                    <div>
                        search for red, blue, purple and gold truth with the following keywords: <span className='font-bold'>{"<red>"}, {"<gold>"}, {"<purple>"}</span> and <span className='font-bold'>{"<blue>"}</span>
                    </div>
                    <div>
                        search for any/all colored text with <span className='font-bold'>{"<white>"}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}