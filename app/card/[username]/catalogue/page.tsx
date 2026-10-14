'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function CataloguePage() {
  const { username } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  useEffect(() => {
    if (!username) return

    // ✅ Try by-username API first, fallback to users API
    fetch(`/api/users/by-username/${username}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('not found')
        const data = await r.json()
        if (!data || data.error) throw new Error('not found')
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback — try fetching all users and find by username
        fetch('/api/users')
          .then((r) => r.json())
          .then((data) => {
            const found = Array.isArray(data)
              ? data.find((u: any) => u.username === username)
              : null
            if (found) {
              setUser(found)
            } else {
              setNotFound(true)
            }
            setLoading(false)
          })
          .catch(() => {
            setNotFound(true)
            setLoading(false)
          })
      })
  }, [username])

  const themeColor = user?.theme_color || '#7c3aed'
  const images: string[] = Array.isArray(user?.catalogue_images)
    ? user.catalogue_images.filter(Boolean)
    : []

  const openImage = (img: string, index: number) => {
    setSelectedImage(img)
    setSelectedIndex(index)
  }

  const closeImage = () => setSelectedImage(null)

  const prevImage = () => {
    const newIndex = (selectedIndex - 1 + images.length) % images.length
    setSelectedIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  const nextImage = () => {
    const newIndex = (selectedIndex + 1) % images.length
    setSelectedIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{
              borderColor: '#7c3aed transparent transparent transparent',
            }}
          />
          <p className="text-slate-400 text-sm">Loading catalogue...</p>
        </div>
      </div>
    )
  }

  // ── Not Found ─────────────────────────────────────────────
  if (notFound || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-white font-bold text-xl mb-2">User Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">
            No user found with username @{username}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 border-b border-slate-800/50"
        style={{ background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            style={{
              backgroundColor: `${themeColor}22`,
              color: themeColor,
            }}
          >
            ←
          </button>

          {/* Avatar */}
          {user.profile_image_url ? (
            <img
              src={user.profile_image_url}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 flex-shrink-0"
              style={{ borderColor: themeColor }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: themeColor }}
            >
              {user.name?.charAt(0)}
            </div>
          )}

          {/* Name */}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-base leading-tight truncate">
              {user.name}
            </h1>
            <p className="text-slate-400 text-xs truncate">
              {user.business_name || `@${user.username}`}
            </p>
          </div>

          {/* Photo count badge */}
          <div
            className="text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0"
            style={{
              backgroundColor: `${themeColor}22`,
              color: themeColor,
            }}
          >
            {images.length} Photos
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Empty state */}
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6"
              style={{ backgroundColor: `${themeColor}22` }}
            >
              📷
            </div>
            <h2 className="text-white font-bold text-xl mb-2">
              No Photos Yet
            </h2>
            <p className="text-slate-400 text-sm">
              {user.name} hasn't added any catalogue photos yet.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-6 px-6 py-3 rounded-xl font-semibold text-white transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              ← Go Back
            </button>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="mb-6 text-center">
              <h2 className="text-white font-black text-2xl mb-1">
                Our Catalogue
              </h2>
              <p className="text-slate-400 text-sm">
                Tap any photo to view full size
              </p>
              <div
                className="w-12 h-1 rounded-full mx-auto mt-3"
                style={{ backgroundColor: themeColor }}
              />
            </div>

            {/* ── 1 Image ───────────────────────────────────── */}
            {images.length === 1 && (
              <div
                className="rounded-3xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                onClick={() => openImage(images[0], 0)}
                style={{
                  boxShadow: `0 20px 60px ${themeColor}30`,
                  border: `1px solid ${themeColor}22`,
                }}
              >
                <img
                  src={images[0]}
                  alt="Catalogue 1"
                  className="w-full object-cover"
                  style={{ maxHeight: '420px' }}
                />
              </div>
            )}

            {/* ── 2 Images ──────────────────────────────────── */}
            {images.length === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                    onClick={() => openImage(img, i)}
                    style={{
                      boxShadow: `0 8px 24px ${themeColor}25`,
                      border: `1px solid ${themeColor}22`,
                    }}
                  >
                    <img
                      src={img}
                      alt={`Catalogue ${i + 1}`}
                      className="w-full h-52 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── 3 Images ──────────────────────────────────── */}
            {images.length === 3 && (
              <div className="flex flex-col gap-3">
                <div
                  className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                  onClick={() => openImage(images[0], 0)}
                  style={{
                    boxShadow: `0 8px 24px ${themeColor}25`,
                    border: `1px solid ${themeColor}22`,
                  }}
                >
                  <img
                    src={images[0]}
                    alt="Catalogue 1"
                    className="w-full h-56 object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {images.slice(1).map((img, i) => (
                    <div
                      key={i}
                      className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                      onClick={() => openImage(img, i + 1)}
                      style={{
                        boxShadow: `0 8px 24px ${themeColor}25`,
                        border: `1px solid ${themeColor}22`,
                      }}
                    >
                      <img
                        src={img}
                        alt={`Catalogue ${i + 2}`}
                        className="w-full h-44 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 4 Images ──────────────────────────────────── */}
            {images.length >= 4 && (
              <div className="grid grid-cols-2 gap-3">
                {images.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                    onClick={() => openImage(img, i)}
                    style={{
                      boxShadow: `0 8px 24px ${themeColor}25`,
                      border: `1px solid ${themeColor}22`,
                    }}
                  >
                    <img
                      src={img}
                      alt={`Catalogue ${i + 1}`}
                      className="w-full h-44 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── User info card ─────────────────────────────── */}
            <div
              className="mt-8 rounded-3xl p-5 flex items-center gap-4"
              style={{
                background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)`,
                border: `1px solid ${themeColor}25`,
              }}
            >
              {user.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                  style={{ border: `2px solid ${themeColor}` }}
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{ backgroundColor: themeColor }}
                >
                  {user.name?.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base truncate">
                  {user.name}
                </p>
                {user.designation && (
                  <p className="text-slate-400 text-sm truncate">
                    {user.designation}
                  </p>
                )}
                {user.business_name && (
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: themeColor }}
                  >
                    {user.business_name}
                  </p>
                )}
              </div>
              <button
                onClick={() => router.back()}
                className="text-xs px-4 py-2.5 rounded-xl font-semibold flex-shrink-0 text-white transition-colors"
                style={{ backgroundColor: themeColor }}
              >
                View Card
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Fullscreen Modal ────────────────────────────────── */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/96 flex items-center justify-center p-4"
          onClick={closeImage}
        >
          {/* Close */}
          <button
            onClick={closeImage}
            className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10 text-lg"
          >
            ✕
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/50 text-white/70 text-sm px-3 py-1 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors z-10 text-2xl font-bold"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <img
            src={selectedImage}
            alt="Full view"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: `0 0 80px ${themeColor}40` }}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors z-10 text-2xl font-bold"
            >
              ›
            </button>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex(i)
                    setSelectedImage(images[i])
                  }}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      i === selectedIndex
                        ? themeColor
                        : 'rgba(255,255,255,0.3)',
                    transform: i === selectedIndex ? 'scale(1.4)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
