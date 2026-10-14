'use client'

import { downloadVCard } from '@/lib/utils'

import {
  FaWhatsapp,
  FaInstagram,
  FaLinkedin,
  FaGlobe,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaImages,
} from 'react-icons/fa'

export default function DigitalCard({ user }: { user: any }) {
  const themeColor = user.theme_color || '#7c3aed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50">

          {/* Cover Image */}
          <div
            className="relative h-36 w-full"
            style={{
              background: user.cover_image_url
                ? undefined
                : `linear-gradient(135deg, ${themeColor}99, ${themeColor}33)`,
            }}
          >
            {user.cover_image_url && (
              <img
                src={user.cover_image_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Logo top right */}
            {user.logo_url && (
              <div className="absolute top-3 right-3">
                <img
                  src={user.logo_url}
                  alt="Logo"
                  className="w-10 h-10 rounded-lg object-contain bg-white/10 backdrop-blur-sm p-1 border border-white/20"
                />
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="relative px-6 pb-6">

            {/* Avatar + QR row */}
            <div className="relative -mt-12 mb-4 flex justify-between items-end">
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden border-4 shadow-xl"
                style={{ borderColor: themeColor }}
              >
                {user.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-3xl font-black"
                    style={{ backgroundColor: themeColor }}
                  >
                    {user.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>

              {/* QR Code small */}
              {user.qr_code_url && (
                <div className="bg-white rounded-xl p-1 shadow-lg">
                  <img
                    src={user.qr_code_url}
                    alt="QR Code"
                    className="w-14 h-14"
                  />
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="mb-4">
              <h1 className="text-white text-2xl font-black leading-tight">
                {user.name}
              </h1>
              {user.designation && (
                <p className="text-sm font-medium mt-0.5" style={{ color: themeColor }}>
                  {user.designation}
                </p>
              )}
              {user.business_name && (
                <p className="text-slate-400 text-sm mt-0.5">
                  🏢 {user.business_name}
                </p>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-700/50">
                <p className="text-slate-300 text-sm leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* ── Action Buttons ──────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 mb-4">

              {/* WhatsApp */}
              {user.whatsapp && (
                <a
                  href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-white py-3 px-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                    boxShadow: '0 4px 15px rgba(37,211,102,0.35)',
                  }}
                >
                  <FaWhatsapp size={18} />
                  WhatsApp
                </a>
              )}

              {/* Instagram */}
              {user.instagram_url && (
                <a
                  href={user.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-white py-3 px-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                    boxShadow: '0 4px 15px rgba(253,29,29,0.25)',
                  }}
                >
                  <FaInstagram size={18} />
                  Instagram
                </a>
              )}

              {/* LinkedIn */}
              {user.linkedin_url && (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-white py-3 px-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #0077b5, #00a0dc)',
                    boxShadow: '0 4px 15px rgba(0,119,181,0.35)',
                  }}
                >
                  <FaLinkedin size={18} />
                  LinkedIn
                </a>
              )}

              {/* ✅ Website — improved color */}
              {user.website_url && (
                <a
                  href={user.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-white py-3 px-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                    boxShadow: `0 4px 15px ${themeColor}40`,
                  }}
                >
                  <FaGlobe size={18} />
                  Website
                </a>
              )}
            </div>

            {/* ── Save Contact + Catalogue Row ─────────────────── */}
            {user.catalogue_images && user.catalogue_images.length > 0 ? (
              <div className="flex gap-3 mb-4">

                {/* Save Contact */}
                <button
                  onClick={() => downloadVCard(user)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                    boxShadow: `0 4px 20px ${themeColor}45`,
                  }}
                >
                  💾 Save Contact
                </button>

                {/* ✅ Catalogue — improved color */}
                <a
                  href={`/card/${user.username}/catalogue`}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
                    color: '#ffffff',
                  }}
                >
                  <FaImages size={16} />
                  Catalogue
                </a>
              </div>
            ) : (
              /* Save Contact full width */
              <button
                onClick={() => downloadVCard(user)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 mb-4"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                  boxShadow: `0 4px 20px ${themeColor}45`,
                }}
              >
                💾 Save Contact
              </button>
            )}

            {/* ── Contact Details ──────────────────────────────── */}
            <div className="space-y-3">
              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl px-4 py-3 transition-colors border border-slate-700/50"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${themeColor}22` }}
                  >
                    <FaPhone size={14} style={{ color: themeColor }} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Phone</p>
                    <p className="text-white text-sm font-medium">{user.phone}</p>
                  </div>
                </a>
              )}

              {user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl px-4 py-3 transition-colors border border-slate-700/50"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${themeColor}22` }}
                  >
                    <FaEnvelope size={14} style={{ color: themeColor }} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Email</p>
                    <p className="text-white text-sm font-medium">{user.email}</p>
                  </div>
                </a>
              )}

              {user.address && (
                <a
                  href={user.address}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700/50 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${themeColor}22` }}
                  >
                    <FaMapMarkerAlt size={14} style={{ color: themeColor }} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Location</p>
                    <p className="text-white text-sm font-medium">
                      📍 Open Google Maps
                    </p>
                  </div>
                </a>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-slate-600 text-xs">
                Powered by{' '}
                <span className="font-semibold" style={{ color: themeColor }}>
                  DigiCard
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Full Size Below Card */}
        {user.qr_code_url && (
          <div className="mt-6 bg-slate-900 border border-slate-700/50 rounded-3xl p-6 text-center">
            <p className="text-slate-400 text-sm mb-4">
              📲 Scan to share this card
            </p>
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl p-3 shadow-xl">
                <img
                  src={user.qr_code_url}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = user.qr_code_url
                link.download = `${user.username}-qr.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              className="inline-block mt-4 text-sm px-6 py-2 rounded-xl border transition-colors cursor-pointer"
              style={{
                borderColor: themeColor,
                color: themeColor,
              }}
            >
              ⬇️ Download QR Code
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
