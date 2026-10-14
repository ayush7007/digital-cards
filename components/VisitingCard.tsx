'use client'
import { useRef, useState, useEffect } from 'react'
import jsPDF from 'jspdf'

export default function VisitingCard({ user }: { user: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloading, setDownloading] = useState(false)

  const tc = (() => {
    const c = user.theme_color || '#7c3aed'
    if (c.startsWith('#')) return c
    return '#7c3aed'
  })()

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  const lightenHex = (hex: string, amount: number) => {
    const { r, g, b } = hexToRgb(hex)
    return `#${Math.min(255, r + amount).toString(16).padStart(2, '0')}${Math.min(255, g + amount).toString(16).padStart(2, '0')}${Math.min(255, b + amount).toString(16).padStart(2, '0')}`
  }

  // ✅ Supports both base64 and external URLs
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      if (!src.startsWith('data:')) {
        img.crossOrigin = 'anonymous'
      }
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed'))
      img.src = src
    })
  }

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: number
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const renderCard = async (): Promise<void> => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1050
    const H = 600
    canvas.width = W
    canvas.height = H

    const rgb = hexToRgb(tc)

    // ════════════════════════════════════════════════════════
    // BACKGROUND
    // ════════════════════════════════════════════════════════
    drawRoundedRect(ctx, 0, 0, W, H, 36)
    ctx.fillStyle = '#0f172a'
    ctx.fill()

    // Subtle center radial glow
    const centerGlow = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, W * 0.6)
    centerGlow.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`)
    centerGlow.addColorStop(1, 'transparent')
    drawRoundedRect(ctx, 0, 0, W, H, 36)
    ctx.fillStyle = centerGlow
    ctx.fill()

    // ── Top accent bar ────────────────────────────────────────
    const topBarGrad = ctx.createLinearGradient(0, 0, W, 0)
    topBarGrad.addColorStop(0, 'transparent')
    topBarGrad.addColorStop(0.1, tc)
    topBarGrad.addColorStop(0.9, lightenHex(tc, 50))
    topBarGrad.addColorStop(1, 'transparent')
    drawRoundedRect(ctx, 0, 0, W, 6, 36)
    ctx.fillStyle = topBarGrad
    ctx.fill()

    // ── Dot pattern background ────────────────────────────────
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.08)`
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 14; col++) {
        ctx.beginPath()
        ctx.arc(40 + col * 74, 40 + row * 74, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // ════════════════════════════════════════════════════════
    // TOP LEFT — Company Logo ONLY (base64 + URL both supported)
    // ════════════════════════════════════════════════════════
    const logoSize = 90
    const logoX = 30
    const logoY = 24

    if (user.logo_url) {
      try {
        const logo = await loadImage(user.logo_url)
        // Logo rounded background
        drawRoundedRect(ctx, logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, 18)
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`
        ctx.fill()
        drawRoundedRect(ctx, logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, 18)
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
      } catch {
        // Fallback — show initial
        drawRoundedRect(ctx, logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, 18)
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`
        ctx.fill()
        drawRoundedRect(ctx, logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, 18)
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = lightenHex(tc, 60)
        ctx.font = 'bold 42px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          user.business_name?.charAt(0)?.toUpperCase() || '?',
          logoX + logoSize / 2,
          logoY + logoSize / 2
        )
      }
    } else {
      // No logo — show initial box
      drawRoundedRect(ctx, logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, 18)
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`
      ctx.fill()
      drawRoundedRect(ctx, logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, 18)
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = lightenHex(tc, 60)
      ctx.font = 'bold 42px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        user.business_name?.charAt(0)?.toUpperCase() ||
        user.name?.charAt(0)?.toUpperCase() || '?',
        logoX + logoSize / 2,
        logoY + logoSize / 2
      )
    }

    // ════════════════════════════════════════════════════════
    // TOP RIGHT — QR Code
    // ════════════════════════════════════════════════════════
    const qrSize = 150
    const qrX = W - qrSize - 32
    const qrY = 20

    if (user.qr_code_url) {
      try {
        const qrImg = await loadImage(user.qr_code_url)

        // QR glow
        ctx.shadowColor = tc
        ctx.shadowBlur = 24
        drawRoundedRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.shadowBlur = 0

        // QR border
        drawRoundedRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16)
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)`
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

        // Scan label
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`
        ctx.font = 'bold 18px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('Scan to Connect', qrX + qrSize / 2, qrY + qrSize + 12)
      } catch {
        // skip
      }
    }

    // ════════════════════════════════════════════════════════
    // CENTER — Avatar + Name + Business Name + Designation + Bio
    // ════════════════════════════════════════════════════════
    const CX = W / 2
    const avatarCY = 140
    const avatarR = 80

    // Avatar rings
    ctx.beginPath()
    ctx.arc(CX, avatarCY, avatarR + 20, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(CX, avatarCY, avatarR + 10, 0, Math.PI * 2)
    ctx.strokeStyle = tc
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(CX, avatarCY, avatarR + 5, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = 2
    ctx.stroke()

    // ✅ Avatar — supports base64 and URL
    let avatarLoaded = false
    if (user.profile_image_url) {
      try {
        const img = await loadImage(user.profile_image_url)
        ctx.save()
        ctx.beginPath()
        ctx.arc(CX, avatarCY, avatarR, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, CX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2)
        ctx.restore()
        avatarLoaded = true
      } catch {
        avatarLoaded = false
      }
    }

    if (!avatarLoaded) {
      ctx.beginPath()
      ctx.arc(CX, avatarCY, avatarR, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 70px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(user.name?.charAt(0)?.toUpperCase() || '?', CX, avatarCY)
    }

    // ── Name ─────────────────────────────────────────────────
    let centerTextY = avatarCY + avatarR + 18
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 44px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(user.name || '', CX, centerTextY, 400)
    centerTextY += 54

    // ── Business Name (center, under name) ────────────────────
    if (user.business_name) {
      ctx.fillStyle = lightenHex(tc, 70)
      ctx.font = 'bold 26px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(user.business_name, CX, centerTextY, 400)
      centerTextY += 40
    }

    // ── Designation pill ──────────────────────────────────────
    if (user.designation) {
      ctx.font = '22px Arial'
      const tw = ctx.measureText(user.designation).width
      const pillW = tw + 40
      const pillX = CX - pillW / 2
      drawRoundedRect(ctx, pillX, centerTextY, pillW, 36, 18)
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.25)`
      ctx.fill()
      drawRoundedRect(ctx, pillX, centerTextY, pillW, 36, 18)
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.55)`
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(user.designation, CX, centerTextY + 18, 380)
      centerTextY += 50
    }

    // ── Bio ───────────────────────────────────────────────────
    if (user.bio) {
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.font = 'italic 19px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const bioText = user.bio.length > 60 ? user.bio.slice(0, 60) + '...' : user.bio
      ctx.fillText(`"${bioText}"`, CX, centerTextY + 2, 400)
    }

    // ════════════════════════════════════════════════════════
    // BOTTOM STRIP — Contact Details
    // ════════════════════════════════════════════════════════
    const bottomH = 158
    const bottomY = H - bottomH

    // Bottom strip background
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.09)`
    ctx.fillRect(0, bottomY, W, bottomH)

    // Top border glow
    const borderGrad = ctx.createLinearGradient(0, 0, W, 0)
    borderGrad.addColorStop(0, 'transparent')
    borderGrad.addColorStop(0.1, tc)
    borderGrad.addColorStop(0.9, lightenHex(tc, 50))
    borderGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = borderGrad
    ctx.fillRect(0, bottomY, W, 3)

    // Bottom accent line
    const btmGrad = ctx.createLinearGradient(0, 0, W, 0)
    btmGrad.addColorStop(0, 'transparent')
    btmGrad.addColorStop(0.1, tc)
    btmGrad.addColorStop(0.9, lightenHex(tc, 50))
    btmGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = btmGrad
    ctx.fillRect(0, H - 5, W, 5)

    // ── Left contacts (phone, whatsapp, website, location) ────
    const leftContacts: { icon: string; label: string; value: string }[] = []
    if (user.phone)
      leftContacts.push({ icon: '☎', label: 'Phone', value: user.phone })
    if (user.whatsapp)
      leftContacts.push({ icon: '◉', label: 'WhatsApp', value: `+${user.whatsapp}` })
    if (user.website_url)
      leftContacts.push({
        icon: '🌐',
        label: 'Website',
        value: user.website_url.replace(/https?:\/\//, ''),
      })
    if (user.address)
      leftContacts.push({ icon: '📍', label: 'Location', value: 'Open on Maps' })
    if (user.instagram_url)
      leftContacts.push({
        icon: '📸',
        label: 'Instagram',
        value: user.instagram_url
          .replace('https://instagram.com/', '@')
          .replace('https://www.instagram.com/', '@'),
      })

    const maxLeft = Math.min(leftContacts.length, 4)
    const leftColW = (W * 0.62) / 2
    const contactPadY = bottomY + 16

    for (let i = 0; i < maxLeft; i++) {
      const c = leftContacts[i]
      const col = i % 2
      const row = Math.floor(i / 2)
      const cx = col * leftColW + 28
      const cy = contactPadY + row * 66

      // Icon circle
      ctx.beginPath()
      ctx.arc(cx + 20, cy + 20, 20, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.22)`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 20, cy + 20, 20, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Icon
      ctx.fillStyle = lightenHex(tc, 70)
      ctx.font = 'bold 15px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(c.icon, cx + 20, cy + 20)

      // Label
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`
      ctx.font = 'bold 15px Arial'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(c.label.toUpperCase(), cx + 48, cy + 4)

      // Value
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '21px Arial'
      ctx.textBaseline = 'top'
      ctx.fillText(c.value, cx + 48, cy + 24, leftColW - 60)
    }

    // ── BOTTOM RIGHT — Email box ───────────────────────────────
    if (user.email) {
      const emailBoxW = 310
      const emailBoxH = 80
      const emailBoxX = W - emailBoxW - 28
      const emailBoxY = bottomY + (bottomH - emailBoxH) / 2

      // Email box background
      drawRoundedRect(ctx, emailBoxX, emailBoxY, emailBoxW, emailBoxH, 16)
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`
      ctx.fill()
      drawRoundedRect(ctx, emailBoxX, emailBoxY, emailBoxW, emailBoxH, 16)
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.45)`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Email icon circle
      ctx.beginPath()
      ctx.arc(emailBoxX + 30, emailBoxY + emailBoxH / 2, 20, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(emailBoxX + 30, emailBoxY + emailBoxH / 2, 20, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.6)`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Email icon
      ctx.fillStyle = lightenHex(tc, 80)
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('✉', emailBoxX + 30, emailBoxY + emailBoxH / 2)

      // Email label
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`
      ctx.font = 'bold 15px Arial'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('EMAIL', emailBoxX + 58, emailBoxY + 12)

      // Email value
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '20px Arial'
      ctx.textBaseline = 'top'
      ctx.fillText(user.email, emailBoxX + 58, emailBoxY + 34, emailBoxW - 68)
    }
  }

  useEffect(() => {
    renderCard()
  }, [user])

  const downloadAsImage = async () => {
    setDownloading(true)
    try {
      await renderCard()
      const canvas = canvasRef.current
      if (!canvas) return
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `${user.name?.replace(/\s+/g, '_') || 'card'}-visiting-card.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  const downloadAsPDF = async () => {
    setDownloading(true)
    try {
      await renderCard()
      const canvas = canvasRef.current
      if (!canvas) return
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [3.5, 2],
      })
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 3.5, 2)
      pdf.save(`${user.name?.replace(/\s+/g, '_') || 'card'}-visiting-card.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <p style={{
        color: '#94a3b8',
        fontSize: '13px',
        textAlign: 'center',
        marginBottom: '14px',
      }}>
        🪪 Visiting Card Preview — 3.5 × 2 inch
      </p>

      {/* Canvas Preview */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '350px',
            height: '200px',
            borderRadius: '12px',
            boxShadow: `0 8px 32px rgba(${hexToRgb(tc).r},${hexToRgb(tc).g},${hexToRgb(tc).b},0.4)`,
            border: `1px solid rgba(${hexToRgb(tc).r},${hexToRgb(tc).g},${hexToRgb(tc).b},0.3)`,
          }}
        />
      </div>

      {/* Download Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={downloadAsImage}
          disabled={downloading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', padding: '10px 20px', borderRadius: '10px',
            fontWeight: '600',
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.5 : 1,
            background: `linear-gradient(135deg, ${tc}, ${lightenHex(tc, 40)})`,
            color: '#fff', border: 'none',
            boxShadow: `0 4px 14px rgba(${hexToRgb(tc).r},${hexToRgb(tc).g},${hexToRgb(tc).b},0.4)`,
          }}
        >
          {downloading ? '⏳' : '🖼️'} Download PNG
        </button>

        <button
          onClick={downloadAsPDF}
          disabled={downloading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', padding: '10px 20px', borderRadius: '10px',
            fontWeight: '600',
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.5 : 1,
            backgroundColor: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          }}
        >
          {downloading ? '⏳' : '📄'} Download PDF
        </button>
      </div>

      <p style={{
        color: '#475569',
        fontSize: '11px',
        textAlign: 'center',
        marginTop: '8px',
      }}>
        Print ready • Standard business card size
      </p>
    </div>
  )
}
