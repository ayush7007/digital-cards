'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState<any>({})
  const [catalogueImages, setCatalogueImages] = useState<string[]>([])

  useEffect(() => {
    fetch(`/api/users/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data)
        // ✅ Load existing catalogue images
        if (data.catalogue_images && Array.isArray(data.catalogue_images)) {
          setCatalogueImages(data.catalogue_images)
        }
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [params.id])

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  // ── Catalogue image handlers ──────────────────────────────
  const handleCatalogueUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const updated = [...catalogueImages]
      updated[index] = reader.result as string
      setCatalogueImages(updated)
      set('catalogue_images', updated)
    }
    reader.readAsDataURL(file)
  }

  const removeCatalogueImage = (index: number) => {
    const updated = [...catalogueImages]
    updated.splice(index, 1)
    setCatalogueImages(updated)
    set('catalogue_images', updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { password_hash, created_at, updated_at, id, ...updateData } = form
      const res = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      toast.success('✅ User updated successfully!')
      router.push('/admin/users')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors'
  const labelClass = 'block text-slate-300 text-sm font-medium mb-2'

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">⏳ Loading user...</div>
      </div>
    )
  }

  if (!form || !form.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-white text-xl font-bold">User not found</p>
          <Link href="/admin/users">
            <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl">
              ← Back to Users
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/users">
          <button className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Back to Users
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Edit User</h1>
          <p className="text-slate-400 mt-1">
            Editing card for{' '}
            <span className="text-purple-400 font-medium">@{form.username}</span>
          </p>
        </div>
      </div>

      {/* QR Code Preview */}
      {form.qr_code_url && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src={form.qr_code_url}
            alt="QR Code"
            className="w-32 h-32 rounded-xl border border-slate-700"
          />
          <div>
            <h3 className="text-white font-bold mb-1">🔳 QR Code</h3>
            <p className="text-slate-400 text-sm mb-3">
              Card URL:{' '}
              <span className="text-purple-400 font-mono text-xs">
                {form.card_url}
              </span>
            </p>
            <div className="flex gap-3">
              <a
                href={form.card_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-purple-900/50 text-purple-400 hover:bg-purple-900 px-4 py-2 rounded-lg transition-colors"
              >
                👁️ View Card
              </a>
              <a
                href={form.qr_code_url}
                download={`${form.username}-qr.png`}
                className="text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
              >
                ⬇️ Download QR
              </a>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Account Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-5">🔐 Account Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                className={inputClass}
                placeholder="John Doe"
                value={form.name || ''}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Username *</label>
              <input
                className={inputClass}
                placeholder="johndoe"
                value={form.username || ''}
                onChange={(e) =>
                  set('username', e.target.value.toLowerCase().replace(/\s+/g, ''))
                }
                required
              />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                className={inputClass}
                placeholder="john@example.com"
                value={form.email || ''}
                onChange={(e) => set('email', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>New Password (leave blank to keep)</label>
              <input
                type="password"
                className={inputClass}
                placeholder="Enter new password..."
                value={form.password || ''}
                onChange={(e) => set('password', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select
                className={inputClass}
                value={form.role || 'user'}
                onChange={(e) => set('role', e.target.value)}
              >
                <option value="user">👤 User</option>
                <option value="admin">🛡️ Admin</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                value={form.is_active ? 'true' : 'false'}
                onChange={(e) =>
                  setForm((f: any) => ({
                    ...f,
                    is_active: e.target.value === 'true',
                  }))
                }
              >
                <option value="true">✅ Active</option>
                <option value="false">❌ Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Card Theme Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={form.theme_color || '#7c3aed'}
                  onChange={(e) => set('theme_color', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer"
                />
                <input
                  className={inputClass}
                  value={form.theme_color || '#7c3aed'}
                  onChange={(e) => set('theme_color', e.target.value)}
                  placeholder="#7c3aed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-5">💼 Business Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Business Name</label>
              <input
                className={inputClass}
                placeholder="Acme Corp"
                value={form.business_name || ''}
                onChange={(e) => set('business_name', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Designation</label>
              <input
                className={inputClass}
                placeholder="CEO / Developer"
                value={form.designation || ''}
                onChange={(e) => set('designation', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                placeholder="+91 9876543210"
                value={form.phone || ''}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input
                className={inputClass}
                placeholder="919876543210"
                value={form.whatsapp || ''}
                onChange={(e) => set('whatsapp', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>📍 Google Maps Link</label>
              <input
                className={inputClass}
                placeholder="https://maps.app.goo.gl/xxxxxxx"
                value={form.address || ''}
                onChange={(e) => set('address', e.target.value)}
              />
              {form.address && (
                <a
                  href={form.address}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-1 transition-colors"
                >
                  🗺️ Preview on Google Maps →
                </a>
              )}
              <p className="text-slate-500 text-xs mt-1">
                Go to Google Maps → Search your location → Click Share → Copy Link
              </p>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Short description about you or your business..."
                value={form.bio || ''}
                onChange={(e) => set('bio', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Profile Images */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-5">🖼️ Profile Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageUpload
              label="Profile Photo"
              value={form.profile_image_url || ''}
              onChange={(url) => set('profile_image_url', url)}
              bucket="avatars"
              username={form.username || 'user'}
              type="avatar"
              shape="circle"
            />
            <ImageUpload
              label="Company Logo"
              value={form.logo_url || ''}
              onChange={(url) => set('logo_url', url)}
              bucket="logos"
              username={form.username || 'user'}
              type="logo"
              shape="square"
            />
            <ImageUpload
              label="Cover Image"
              value={form.cover_image_url || ''}
              onChange={(url) => set('cover_image_url', url)}
              bucket="covers"
              username={form.username || 'user'}
              type="cover"
              shape="wide"
            />
          </div>
        </div>

        {/* ✅ Catalogue Images */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-2">📸 Catalogue Images</h2>
          <p className="text-slate-400 text-sm mb-5">
            Upload up to 4 photos — shown in user's catalogue page
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                {catalogueImages[index] ? (
                  <div className="relative group">
                    <img
                      src={catalogueImages[index]}
                      alt={`Catalogue ${index + 1}`}
                      className="w-full h-36 object-cover rounded-xl border border-slate-700"
                    />
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeCatalogueImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs items-center justify-center hidden group-hover:flex transition-all"
                    >
                      ✕
                    </button>
                    {/* Photo number badge */}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      Photo {index + 1}
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-xl cursor-pointer transition-colors bg-slate-800/50 hover:bg-slate-800">
                    <span className="text-3xl mb-2">📷</span>
                    <span className="text-slate-400 text-xs font-medium">
                      Photo {index + 1}
                    </span>
                    <span className="text-slate-600 text-xs mt-1">
                      Click to upload
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCatalogueUpload(e, index)}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
          {catalogueImages.length > 0 && (
            <p className="text-slate-500 text-xs mt-3">
              ✅ {catalogueImages.length}/4 photos uploaded
            </p>
          )}
        </div>

        {/* Social Links */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-5">🔗 Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input
                className={inputClass}
                placeholder="https://instagram.com/username"
                value={form.instagram_url || ''}
                onChange={(e) => set('instagram_url', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input
                className={inputClass}
                placeholder="https://linkedin.com/in/username"
                value={form.linkedin_url || ''}
                onChange={(e) => set('linkedin_url', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Website URL</label>
              <input
                className={inputClass}
                placeholder="https://yourwebsite.com"
                value={form.website_url || ''}
                onChange={(e) => set('website_url', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg transition-colors"
          >
            {loading ? '⏳ Saving Changes...' : '💾 Save Changes'}
          </button>
          <Link href="/admin/users" className="flex-1">
            <button
              type="button"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold text-lg transition-colors"
            >
              ✕ Cancel
            </button>
          </Link>
        </div>

      </form>
    </div>
  )
}
