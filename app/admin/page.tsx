'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.is_active).length
  const totalViews = users.reduce((sum, u) => sum + (u.view_count || 0), 0)
  const admins = users.filter((u) => u.role === 'admin').length

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: '👥', color: 'from-blue-600 to-blue-700' },
    { label: 'Active Cards', value: activeUsers, icon: '✅', color: 'from-green-600 to-green-700' },
    { label: 'Total Views', value: totalViews, icon: '👁️', color: 'from-purple-600 to-purple-700' },
    { label: 'Admins', value: admins, icon: '🛡️', color: 'from-orange-600 to-orange-700' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-lg`}
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-3xl font-black text-white">
              {loading ? '...' : stat.value}
            </div>
            <div className="text-white/70 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/admin/users/add">
          <div className="bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl p-6 cursor-pointer transition-all group">
            <div className="text-4xl mb-3">➕</div>
            <h3 className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">
              Add New User
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Create a new digital business card
            </p>
          </div>
        </Link>
        <Link href="/admin/users">
          <div className="bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl p-6 cursor-pointer transition-all group">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">
              Manage Users
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              View, edit and manage all cards
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Users */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Recent Users</h2>
          <Link href="/admin/users" className="text-purple-400 text-sm hover:text-purple-300">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="text-slate-400 text-center py-8">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👤</div>
            <p className="text-slate-400">No users yet.</p>
            <Link href="/admin/users/add">
              <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-purple-700 transition-colors">
                Add First User
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-slate-400 text-xs">{user.business_name || user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.is_active
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Link
                    href={`/card/${user.username}`}
                    target="_blank"
                    className="text-purple-400 text-xs hover:text-purple-300"
                  >
                    View Card →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
