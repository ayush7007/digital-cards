'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

export default function AddUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [catalogueImages, setCatalogueImages] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
    business_name: '',
    designation: '',
    phone: '',
    whatsapp: '',
    instagram_url: '',
    linkedin_url: '',
    website_url: '',
    address: '',
    bio: '',
    theme_color: '#7c3aed',
    profile_image_url: '',
    cover_image_url: '',
    logo_url: '',
    catalogue_images: [] as string[],
  })

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

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
    if (!form.name || !form.username || !form.email || !form.password) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create user')
      toast.success('✅ User created! QR code generated.')
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
          <h1 className="text-3xl font-black text-white">Add New User</h1>
          <p className="text-slate-400 mt-1">Create a digital business card</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Profile Images */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-5">🖼️ Profile Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageUpload
              label="Profile Photo"
              value={form.profile_image_url}
              onChange={(url) => set('profile_image_url', url)}
              bucket="avatars"
              username={form.username || 'user'}
              type="avatar"
              shape="circle"
            />
            <ImageUpload
              label="Company Logo"
              value={form.logo_url}
              onChange={(url) => set('logo_url', url)}
              bucket="logos"
              username={form.username || 'user'}
              type="logo"
              shape="square"
            />
            <ImageUpload
              label="Cover Image"
              value={form.cover_image_url}
              onChange={(url) => set('cover_image_url', url)}
              bucket="covers"
              username={form.username || 'user'}
              type="cover"
              shape="wide"
            />
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-5">🔐 Account Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                className={inputClass}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Username * (used in card URL)</label>
              <input
                className={inputClass}
                placeholder="johndoe"
                value={form.username}
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
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <input
                type="password"
                className={inputClass}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
              >
                <option value="user">👤 User</option>
                <option value="admin">🛡️ Admin</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Card Theme Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={form.theme_color}
                  onChange={(e) => set('theme_color', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer"
                />
                <input
                  className={inputClass}
                  value={form.theme_color}
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
                value={form.business_name}
                onChange={(e) => set('business_name', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Designation</label>
              <input
                className={inputClass}
                placeholder="CEO / Developer"
                value={form.designation}
                onChange={(e) => set('designation', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input
                className={inputClass}
                placeholder="919876543210"
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>📍 Google Maps Link</label>
              <input
                className={inputClass}
                placeholder="https://maps.app.goo.gl/xxxxxxx"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
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
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
              />
            </div>
          </div>
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
                value={form.instagram_url}
                onChange={(e) => set('instagram_url', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input
                className={inputClass}
                placeholder="https://linkedin.com/in/username"
                value={form.linkedin_url}
                onChange={(e) => set('linkedin_url', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Website URL</label>
              <input
                className={inputClass}
                placeholder="https://yourwebsite.com"
                value={form.website_url}
                onChange={(e) => set('website_url', e.target.value)}
              />
            </div>
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

        {/* Card URL Preview */}
        {form.username && (
          <div className="bg-purple-900/20 border border-purple-800 rounded-2xl p-4">
            <p className="text-purple-300 text-sm">
              🔳 Card URL will be:{' '}
              <span className="font-mono text-purple-200">
                http://localhost:3000/card/{form.username}
              </span>
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg transition-colors"
        >
          {loading
            ? '⏳ Creating User & Generating QR...'
            : '✅ Create User & Generate QR Code'}
        </button>
      </form>
    </div>
  )
}
