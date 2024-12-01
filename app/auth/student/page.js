'use client'

import AuthForm from '../../component/authForm'
import './student.css'

export default function studentAuth() {
  return (
    <div className="auth-container">
    <h2 className="auth-heading">Student Login</h2>
    <AuthForm role="student" />
  </div>
  )
}
