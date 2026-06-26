import { supabase } from '../../services/supabase/client'

export type UserRole = 'student' | 'teacher' | 'admin'

export interface AuthProfile {
  id: string
  displayName: string
  role: UserRole
}

interface ProfileRow {
  id: string
  display_name: string
  role: string
}

export interface SignInResult {
  profile: AuthProfile | null
  error: string | null
}

function isUserRole(role: string): role is UserRole {
  return role === 'student' || role === 'teacher' || role === 'admin'
}

function mapProfile(row: ProfileRow): AuthProfile | null {
  if (!isUserRole(row.role)) {
    return null
  }

  return {
    id: row.id,
    displayName: row.display_name,
    role: row.role,
  }
}

export function getRoleHomePath(role: UserRole): string {
  if (role === 'student') {
    return '/student'
  }

  if (role === 'teacher') {
    return '/teacher'
  }

  return '/login'
}

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const sessionResult = await supabase.auth.getSession()

  if (sessionResult.error || !sessionResult.data.session?.user.id) {
    return null
  }

  const userId = sessionResult.data.session.user.id
  const profileResult = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', userId)
    .single()

  if (profileResult.error || !profileResult.data) {
    return null
  }

  return mapProfile(profileResult.data as ProfileRow)
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  const signInResult = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInResult.error) {
    return {
      profile: null,
      error: '邮箱或密码不正确，请重新输入。',
    }
  }

  const profile = await getCurrentProfile()

  if (!profile) {
    await signOutSession()

    return {
      profile: null,
      error: '无法读取当前用户资料，请重新登录。',
    }
  }

  return {
    profile,
    error: null,
  }
}

export async function signOutSession(): Promise<void> {
  await supabase.auth.signOut()
}
