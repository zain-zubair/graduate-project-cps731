'use client'

import AuthForm from '../../component/authForm'
import './staff.css'

export default function staffAuth() {
  return (
    <div className="auth-container">
      <h2 className="auth-heading">Staff Login</h2>
      <AuthForm role="staff" />
    </div>
  )
}
