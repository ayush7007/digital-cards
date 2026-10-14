'use client'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

interface ImageUploadProps {
  label: string
  value: string
  onChange: (url: string) => void
  bucket?: string
  username?: string
  type?: 'avatar' | 'cover' | 'logo'
  shape?: 'circle' | 'square' | 'wide'
}

export default function ImageUpload({
  label,
  value,
  onChange,
  bucket = 'avatars',
  username = 'user',
  type = 'avatar',
  shape = 'circle',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filename = `${username}-${type}-${Date.now()}.${ext}`

      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      formData.append('filename', filename)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      onChange(data.url)
      toast.success('✅ Image uploaded!')
    } catch (err: any) {
      // Fallback: convert to base64 locally
      toast.info('Using local preview...')
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange(e.target?.result as string)
        toast.success('✅ Image ready!')
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleRemove = () => {
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  // Preview shape styles
  const previewClass = {
    circle: 'w-24 h-24 rounded-full',
    square: 'w-24 h-24 rounded-2xl',
    wide: 'w-full h-24 rounded-2xl',
  }[shape]

  return (
    <div className="w-full">
      <label className="block text-slate-300 text-sm font-medium mb-2">
        {label}
      </label>

      <div className="flex flex-col gap-3">
        {/* Preview */}
        {value ? (
          <div className="relative inline-flex">
            <img
              src={value}
              alt={label}
              className={`${previewClass} object-cover border-2 border-slate-600`}
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow-lg transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          // Drop Zone
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              ${shape === 'wide' ? 'w-full h-24' : 'w-24 h-24'}
              ${shape === 'circle' ? 'rounded-full' : 'rounded-2xl'}
              border-2 border-dashed cursor-pointer
              flex flex-col items-center justify-center gap-1
              transition-all
              ${dragOver
                ? 'border-purple-400 bg-purple-900/20'
                : 'border-slate-600 hover:border-purple-500 bg-slate-800/50 hover:bg-slate-800'
              }
            `}
          >
            {uploading ? (
              <div className="text-center">
                <div className="text-2xl animate-spin">⏳</div>
                <p className="text-slate-400 text-xs mt-1">Uploading...</p>
              </div>
            ) : (
              <div className="text-center px-2">
                <div className="text-2xl">📷</div>
                {shape !== 'circle' && (
                  <p className="text-slate-400 text-xs mt-1">
                    {dragOver ? 'Drop here!' : 'Click or drag'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
          </button>

          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs bg-red-900/50 hover:bg-red-900 text-red-400 px-4 py-2 rounded-xl transition-colors"
            >
              🗑️ Remove
            </button>
          )}
        </div>

        {/* URL Input (manual paste) */}
        <div>
          <p className="text-slate-500 text-xs mb-1">Or paste image URL:</p>
          <input
            type="text"
            placeholder="https://example.com/photo.jpg"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-slate-600 text-xs">
          Supports JPG, PNG, WebP, GIF • Max 5MB
        </p>
      </div>
    </div>
  )
}
