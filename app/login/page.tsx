'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  // ✅ If already logged in, redirect away from login page
  useEffect(() => {
    if (status === 'authenticated' && session) {
      window.location.href = '/admin/users'
    }
  }, [session, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (!result) {
        toast.error('No response from server')
        setLoading(false)
        return
      }

      if (result.error) {
        toast.error('Invalid email or password')
        setLoading(false)
        return
      }

      // ✅ Success
      toast.success('Welcome back!')
      window.location.href = '/admin/users'

    } catch (err) {
      console.error('SignIn exception:', err)
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // ✅ Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-lg">⏳ Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              💳
            </div>
            <h1 className="text-2xl font-black text-white">DigiCard Admin</h1>
            <p className="text-purple-300 text-sm mt-1">Sign in to manage your cards</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-purple-200 mb-2 block">Email Address</Label>
              <Input
                type="email"
                placeholder="admin@digicard.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl h-12"
                required
              />
            </div>
            <div>
              <Label className="text-purple-200 mb-2 block">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl h-12"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl text-base font-semibold"
            >
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-6">
            Default: admin@digicard.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
