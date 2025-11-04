import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"

// In-memory user store (in production, use a database)
const users = new Map<string, {
  id: string
  email: string
  password: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
}>()

// Default admin user (like n8n's initial setup)
const defaultAdmin = {
  id: 'admin-1',
  email: 'admin@agentflow.com',
  password: bcrypt.hashSync('admin123', 10),
  name: 'Admin User',
  role: 'admin' as const,
  createdAt: new Date().toISOString()
}

users.set(defaultAdmin.email, defaultAdmin)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = users.get(credentials.email)
        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Auto-create user for OAuth providers
      if (account?.provider !== 'credentials' && user.email) {
        if (!users.has(user.email)) {
          const newUser = {
            id: `oauth-${Date.now()}`,
            email: user.email,
            password: '', // OAuth users don't need password
            name: user.name || user.email,
            role: 'user' as const,
            createdAt: new Date().toISOString()
          }
          users.set(user.email, newUser)
        }
      }
      return true
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
}

// Helper functions for user management
export async function createUser(email: string, password: string, name: string) {
  if (users.has(email)) {
    throw new Error('User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = {
    id: `user-${Date.now()}`,
    email,
    password: hashedPassword,
    name,
    role: 'user' as const,
    createdAt: new Date().toISOString()
  }

  users.set(email, user)
  return user
}

export function getUser(email: string) {
  return users.get(email)
}

export function getAllUsers() {
  return Array.from(users.values()).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  }))
}