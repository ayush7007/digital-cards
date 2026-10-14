'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import VisitingCard from '@/components/VisitingCard'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const fetchUsers = () => {
    setLoading(true)
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('User deleted!')
      fetchUsers()
    } else {
      toast.error('Failed to delete user')
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    if (res.ok) {
      toast.success(`User ${!current ? 'activated' : 'deactivated'}!`)
      fetchUsers()
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">All Users</h1>
          <p className="text-slate-400 mt-1">{users.length} total users</p>
        </div>
        <Link href="/admin/users/add">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            ➕ Add User
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by name, email or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">👤</div>
            <p className="text-slate-400">No users found</p>
            <Link href="/admin/users/add">
              <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl text-sm">
                Add First User
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">User</th>
                  <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">Username</th>
                  <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">Role</th>
                  <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">Status</th>
                  <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">Views</th>
                  <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold overflow-hidden">
                          {user.profile_image_url ? (
                            <img
                              src={user.profile_image_url}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      @{user.username}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          user.role === 'admin'
                            ? 'bg-orange-900/50 text-orange-400'
                            : 'bg-blue-900/50 text-blue-400'
                        }`}
                      >
                        {user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(user.id, user.is_active)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          user.is_active
                            ? 'bg-green-900/50 text-green-400 hover:bg-green-900'
                            : 'bg-red-900/50 text-red-400 hover:bg-red-900'
                        }`}
                      >
                        {user.is_active ? '✅ Active' : '❌ Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      👁️ {user.view_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/card/${user.username}`}
                          target="_blank"
                          className="text-xs bg-purple-900/50 text-purple-400 hover:bg-purple-900 px-3 py-1 rounded-lg transition-colors"
                        >
                          👁️ View
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-xs bg-blue-900/50 text-blue-400 hover:bg-blue-900 px-3 py-1 rounded-lg transition-colors"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-xs bg-green-900/50 text-green-400 hover:bg-green-900 px-3 py-1 rounded-lg transition-colors"
                        >
                          🪪 Card
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="text-xs bg-red-900/50 text-red-400 hover:bg-red-900 px-3 py-1 rounded-lg transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visiting Card Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUser(null)
          }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-lg">🪪 Visiting Card</h2>
                <p className="text-slate-400 text-sm">{selectedUser.name}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Visiting Card Component */}
            <VisitingCard user={selectedUser} />
          </div>
        </div>
      )}
    </div>
  )
}
