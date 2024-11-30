'use client';
import { useRouter } from 'next/navigation'; //works for only app-based directory, else use next/router

export default function AuthPage() {
  const router = useRouter();

  const handleRoleSelect = (role) => {
    if (role === 'student') {
      router.push('/auth/student');
    } else if (role === 'staff') {
      router.push('/auth/staff');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
    <h1>Sign In / Sign Up</h1>
    <div>
      <button onClick={() => handleRoleSelect('student')}>Student</button>
      <button onClick={() => handleRoleSelect('staff')}>Staff</button>
    </div>
  </div>
  )
}
