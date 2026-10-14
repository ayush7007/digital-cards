import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-white px-4">
      <div className="text-center max-w-3xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-purple-500 rounded-2xl flex items-center justify-center text-4xl shadow-2xl shadow-purple-500/50">
            💳
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
          DigiCard
        </h1>
        <p className="text-xl md:text-2xl text-purple-200 mb-4 font-light">
          Beautiful Digital Business Cards
        </p>
        <p className="text-gray-400 mb-12 text-lg max-w-xl mx-auto">
          Share your business identity with a single QR scan.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: '🔳', title: 'QR Code', desc: 'Auto-generated QR for every card' },
            { icon: '📱', title: 'Mobile First', desc: 'Looks stunning on any device' },
            { icon: '💾', title: 'Save Contact', desc: 'One-tap contact saving' },
          ].map((f) => (
            <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 text-lg rounded-2xl w-full sm:w-auto">
              🔐 Admin Login
            </Button>
          </Link>
        </div>
      </div>
      <p className="mt-16 text-gray-600 text-sm">© 2026 DigiCard. All rights reserved.</p>
    </div>
  )
}
