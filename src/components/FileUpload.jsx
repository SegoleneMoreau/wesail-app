import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import './FileUpload.css'

export default function FileUpload({
  bucket = 'posts',
  folder = '',
  accept = 'image/*',
  multiple = false,
  maxFiles = 4,
  label = 'Ajouter une photo',
  onUpload,
  existingFiles = [],
  onRemove,
  compact = false,
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    if (multiple && existingFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichiers`)
      setTimeout(() => setError(null), 3000)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')

      const uploaded = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
        uploaded.push({ url: publicUrl, name: file.name, path: fileName, type: file.type })
      }

      onUpload(multiple ? uploaded : uploaded[0])
    } catch (err) {
      setError(err.message || 'Erreur upload')
      setTimeout(() => setError(null), 3000)
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  const isPDF = (url) => /\.pdf$/i.test(url)

  return (
    <div className={`fu-wrap ${compact ? 'compact' : ''}`}>
      {/* Fichiers existants */}
      {existingFiles.length > 0 && (
        <div className="fu-files">
          {existingFiles.map((f, i) => {
            const url = typeof f === 'string' ? f : f.url
            const name = typeof f === 'string' ? url.split('/').pop() : f.name
            return (
              <div key={i} className="fu-file">
                {isImage(url) ? (
                  <img src={url} alt={name} className="fu-img-preview" />
                ) : isPDF(url) ? (
                  <div className="fu-doc-preview">
                    <span className="fu-doc-icon">📄</span>
                    <span className="fu-doc-name">{name}</span>
                  </div>
                ) : (
                  <div className="fu-doc-preview">
                    <span className="fu-doc-icon">📎</span>
                    <span className="fu-doc-name">{name}</span>
                  </div>
                )}
                {onRemove && (
                  <button className="fu-remove" onClick={() => onRemove(i)}>✕</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Bouton upload */}
      {(!multiple || existingFiles.length < maxFiles) && (
        <button
          className={`fu-btn ${uploading ? 'loading' : ''}`}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          type="button"
        >
          {uploading ? (
            <><span className="fu-spinner">⟳</span> Upload en cours...</>
          ) : (
            <>{compact ? '📎' : '📎'} {label}</>
          )}
        </button>
      )}

      {error && <div className="fu-error">{error}</div>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFiles}
        style={{ display: 'none' }}
      />
    </div>
  )
}