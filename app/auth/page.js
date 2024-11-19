'use client';
import { useState } from 'react';
import { supabase } from '../../lib/client';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSignUp(event) {
    event.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(`Error signing up: ${error.message}`);
    } else {
      setMessage('Sign Up Successful!');
      router.push('/dashboard');
    }
  }

  async function handleSignIn(event) {
    event.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(`Error signing in: ${error.message}`);
    } else {
      setMessage('Signed in successfully!');
      router.push('/dashboard');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h1>Sign In / Sign Up</h1>
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
      <button onClick={handleSignUp} style={{ marginRight: '10px' }}>
        Sign Up
      </button>
      <button onClick={handleSignIn}>Sign In</button>
      <p>{message}</p>
    </div>
  );
}
