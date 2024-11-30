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
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      
      <img
      src="/TMU_GradTrack_logo.png" 
      alt="TMU GradTrack Logo" 
      style={{ width: '300px', marginBottom: '20px' }} 
      />

      <h1>Sign Up</h1>
      <div style={{ marginTop: '20px' }}>
        <button
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007BFF',
            color: '#FFF',
            border: 'none',
            borderRadius: '5px',
          }}
          onClick={() => handleRoleSelect('student')}
        >
          Student
        </button>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#28A745',
            color: '#FFF',
            border: 'none',
            borderRadius: '5px',
          }}
          onClick={() => handleRoleSelect('staff')}
        >
          Staff
        </button>
      </div>
    </div>
  );
  
}
