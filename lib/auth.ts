import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 authorize called with:', credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', credentials.email as string)
          .eq('is_active', true)
          .single()

        console.log('👤 User from DB:', user ? 'FOUND' : 'NOT FOUND')
        console.log('🔴 DB Error:', error)

        if (error || !user) {
          console.log('❌ User not found or error')
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )

        console.log('🔑 Password valid:', isValid)

        if (!isValid) {
          console.log('❌ Wrong password')
          return null
        }

        console.log('✅ Login successful for:', user.email)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          username: user.username,
        }
      },
    }),
  ],

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        token.username = user.username
        token.id = user.id
        console.log('✅ JWT token set:', token)
      }
      return token
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.username = token.username
        console.log('✅ Session set:', session)
      }
      return session
    },
  },

  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})
