import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadVCard(user: any) {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${user.name || ''}`,
    `ORG:${user.business_name || ''}`,
    `TITLE:${user.designation || ''}`,
    `TEL;TYPE=CELL:${user.phone || ''}`,
    `TEL;TYPE=WORK:${user.whatsapp || ''}`,
    `EMAIL:${user.email || ''}`,
    `URL:${user.website_url || ''}`,
    // Google Maps link stored here instead of plain address
    `URL;type=MAP:${user.address || ''}`,
    `NOTE:${user.bio || ''}`,
    'END:VCARD',
  ].join('\n')

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${user.name?.replace(/\s+/g, '_') || 'contact'}.vcf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
