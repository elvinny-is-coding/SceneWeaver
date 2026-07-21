// Library: shadcn/ui
// Path: components/board/PdfExportButton.tsx

'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Export PDF
    </Button>
  )
}
