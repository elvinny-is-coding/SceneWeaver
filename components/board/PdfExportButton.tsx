'use client'

import { useState, useRef } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface PdfExportButtonProps {
  boardRef: React.RefObject<HTMLDivElement | null>
  sceneName: string
}

export function PdfExportButton({ boardRef, sceneName }: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    if (!boardRef.current) return
    setLoading(true)
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      const canvas = await html2canvas(boardRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`${sceneName.replace(/\s+/g, '-')}-storyboard.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Export PDF
    </button>
  )
}
