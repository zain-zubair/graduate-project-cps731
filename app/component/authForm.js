'use client'
import { useState } from 'react'
import { supabase } from '../../lib/client'
import { useRouter } from 'next/navigation'

export default function AuthForm({ role }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSignUp(event) {
    event.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(`Error signing up: ${error.message}`)
    } else {
      setMessage('Sign Up Successful!')
      // Redirect based on role prop
      router.push(role === 'staff' ? '/dashboard_staff' : '/dashboard')
    }
  }

  async function handleSignIn(event) {
    event.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setMessage(`Error signing in: ${error.message}`)
    } else {
      setMessage('Signed in successfully!')
      // Redirect based on role prop
      router.push(role === 'staff' ? '/dashboard_staff' : '/dashboard')
    }
  }

  async function handleSignInWithOAuth(event) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: role === 'staff' 
          ? `${window.location.origin}/dashboard_staff` 
          : `${window.location.origin}/dashboard`,
      },
    })
    if (error) {
      setMessage(`Error signing in : ${error.message}`)
    }
  }

  return (
    <div>
      <h1>{role} Auth</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />
      <div>
        <button onClick={handleSignUp}>Sign Up</button>
        <button onClick={handleSignIn}>Sign In</button>
        <button onClick={handleSignInWithOAuth}>Sign In with Google</button>
      </div>
      <p>{message}</p>
    </div>
  )
}