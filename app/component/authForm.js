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
      <h1>{role} Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        style={{ display: 'block',
        marginBottom: "10px",
        width: "200px", // Adjust width
        height: "10px", // Adjust height
        padding: "10px", // Add padding
        fontSize: "16px", // Adjust font size
        borderRadius: "5px", // Add rounded corners
        border: "1px solid #ccc", // Add border styling      
      
      }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        style={{ display: 'block', 
        marginBottom: '10px',
        width: "200px", // Adjust width
        height: "10px", // Adjust height
        padding: "10px", // Add padding
        fontSize: "16px", // Adjust font size
        borderRadius: "5px", // Add rounded corners
        border: "1px solid #ccc", // Add border styling  
       }}
      />
      <div>
      <button
      onClick={handleSignUp}
  style={{
    backgroundColor: '#4CAF50', // Green color
    color: 'white',
    padding: '10px 20px',
    margin: '5px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',

  }}
>
  Sign Up
</button>
<button
  onClick={handleSignIn}
  style={{
    backgroundColor: '#008CBA', // Blue color
    color: 'white',
    padding: '10px 20px',
    margin: '5px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease',
  }}
>
  Sign In
</button>
<button
  onClick={handleSignInWithOAuth}
  style={{
    backgroundColor: '#f4f4f4', // Light grey color
    color: '#333',
    padding: '10px 20px',
    margin: '5px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease',
  }}
>
  Sign In with Google
</button>

      </div>
      <p>{message}</p>
    </div>
  )
}