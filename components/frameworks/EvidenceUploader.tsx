'use client'

import { useEffect, useState } from 'react'
import * as db from '@/lib/db'
import { EvidenceFile } from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'

interface EvidenceUploaderProps {
  controlId: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function EvidenceUploader({ controlId }: EvidenceUploaderProps) {
  const [files, setFiles] = useState<EvidenceFile[]>([])
  const [loading, setLoading] = useState(true)
  const addEvidenceFileId = useAppStore((s) => s.addEvidenceFileId)
  const removeEvidenceFileId = useAppStore((s) => s.removeEvidenceFileId)

  useEffect(() => {
    let active = true
    db.getEvidenceFilesForControl(controlId)
      .then((result) => {
        if (active) setFiles(result)
      })
      .catch(() => {
        if (active) setFiles([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [controlId])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const selected = input.files?.[0]
    if (!selected) return
    const record = await db.saveEvidenceFile({
      controlId,
      filename: selected.name,
      mimeType: selected.type || 'application/octet-stream',
      blob: selected,
    })
    await addEvidenceFileId(controlId, record.id)
    setFiles((prev) => [...prev, record])
    input.value = ''
  }

  async function handleRemove(fileId: string) {
    await db.deleteEvidenceFile(fileId)
    await removeEvidenceFileId(controlId, fileId)
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  return (
    <div className="space-y-2">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-button border border-brand-navy px-3 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy-light">
        Upload evidence file
        <input type="file" className="hidden" onChange={handleFileChange} />
      </label>

      {!loading && files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between rounded-input border border-border bg-surface-secondary px-3 py-2 text-sm"
            >
              <span className="truncate text-text-primary">
                {file.filename}{' '}
                <span className="text-text-muted">({formatSize(file.sizeBytes)})</span>
              </span>
              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                className="shrink-0 text-xs font-medium text-status-critical hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
