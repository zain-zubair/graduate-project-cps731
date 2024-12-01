'use client'
import { useState } from 'react'
import { supabase } from '../../lib/client'
import { useRouter } from 'next/navigation'
import { ChromeIcon as Google } from 'lucide-react'
import './auth.css'

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
      router.push(role === 'staff' ? '/dashboard_staff' : '/dashboard')
    }
  }

  async function handleSignInWithOAuth(event) {
    event.preventDefault()
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
    <div className="auth-container">
      <form className="auth-form">
        <h1 className="auth-header">Welcome</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="auth-input"
        />
        <div className="auth-buttons">
          <button onClick={handleSignUp} className="auth-button signup">
            Sign Up
          </button>
          <button onClick={handleSignIn} className="auth-button signin">
            Sign In
          </button>
        </div>
        <button onClick={handleSignInWithOAuth} className="auth-button google">
          <Google size={18} />
          Sign In with Google
        </button>
        {message && <p className="auth-message">{message}</p>}
      </form>
    </div>
  )
}