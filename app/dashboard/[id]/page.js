'use client'

import { supabase } from '../../../lib/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import ProgressForm from './student-form'
import './UserDashboard.css'

export default function UserDashboard({ params }) {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [user, setUser] = useState(null)
  const [studentData, setStudentData] = useState(null)
  const [supervisorInfo, setSupervisorInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState(null)

  const unwrappedParams = React.use(params)
  const { id } = unwrappedParams || {}

  useEffect(() => {
    if (id) {
        console.log("Setting userId from params:", id);
        setUserId(id);
    } else {
        console.log("No id in params:", params);
    }
}, [id]);

  useEffect(() => {
    async function fetchUserData() {
      if (!userId) return

      try {
        // Check if user is authenticated
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth')
          return
        }

        // Fetch user and student data
        const { data: userData, error: userError } = await supabase
          .from('user')
          .select('*')
          .eq('id', userId)
          .single()

        if (userError || !userData) {
          console.error('Error fetching user:', userError)
          router.push('/dashboard')
          return
        }

        // Ensure the authenticated user can only view their own data
        if (userData.email !== authUser.email) {
          router.push('/dashboard')
          return
        }

        const { data: studentData, error: studentError } = await supabase
          .from('student')
          .select('*')
          .eq('user_id', userId)
          .single()

        const { data: progressForms } = await supabase
          .from('progress_form')
          .select('id, created_at, term')
          .eq('student_id', studentData.user_id)

        if (studentError) {
          console.error('Error fetching student:', studentError)
        }

        if (studentData) {
          const { data: supervisorRelation, error: relationError } = await supabase
            .from('student_supervisor_relationship')
            .select(`
              supervisor_id,
              supervisor:supervisor_id (
                department,
                user:user_id (
                  name,
                  email
                )
              )
            `)
            .eq('student_id', studentData.user_id)  // Note: Check if this should be studentData.user_id or studentData.id
            .maybeSingle()  // Use maybeSingle() instead of single()
        
          if (relationError) {
            console.error('Error fetching supervisor relation:', relationError)
          } else if (supervisorRelation) {
            setSupervisorInfo(supervisorRelation.supervisor)
          }
        }

        setUser(userData)
        setStudentData(studentData)
        setSubmissions(progressForms)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId, router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return <div className="loading-container">Loading...</div>
  }

  if (!user) {
    return <div className="error-message">User not found</div>
  }

  return (
    <main className="dashboard">
      <div className="dashboard-container">
        <div className="header">
          <h1 className="page-title">Student Dashboard</h1>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>

        <div className="card profile-card">
          <h2 className="card-title">Profile Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <p className="info-label">Name</p>
              <p className="info-value">{user.name}</p>
            </div>
            <div className="info-item">
              <p className="info-label">Email</p>
              <p className="info-value">{user.email}</p>
            </div>
          </div>
        </div>

        {studentData && (
          <div className="academic-section">
            <div className="card">
              <h2 className="card-title">Academic Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <p className="info-label">Program</p>
                  <p className="info-value">{studentData.program}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Degree</p>
                  <p className="info-value">{studentData.degree}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Year of Study</p>
                  <p className="info-value">{studentData.year_of_study}</p>
                </div>
              </div>
            </div>

            <div className="card supervisor-card">
              <h2 className="card-title">Supervisor Information</h2>
              {supervisorInfo ? (
                <div className="info-grid">
                  <div className="info-item">
                    <p className="info-label">Supervisor Name</p>
                    <p className="info-value">{supervisorInfo.user.name}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Supervisor Email</p>
                    <p className="info-value">{supervisorInfo.user.email}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Department</p>
                    <p className="info-value">{supervisorInfo.department}</p>
                  </div>
                </div>
              ) : (
                <p className="no-supervisor">No supervisor assigned yet.</p>
              )}
            </div>
          </div>
        )}

        <section className="submissions-section">
          <h2 className="section-title">Graduate Progress Form</h2>

          <div className="card">
            <h3 className="subsection-title">Previous Submissions</h3>
            {submissions?.length > 0 ? (
              <ul className="submissions-list">
                {submissions.map((s, index) => (
                  <li key={index} className="submission-item">
                    <div className="submission-info">
                      <p className="submission-term">Progress report for term: {s.term}</p>
                      <p className="submission-date">
                        Submitted at {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/${userId}/feedback/${s.id}`)}
                      className="view-feedback-btn"
                    >
                      View Feedback
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-submissions">No progress forms previously submitted.</div>
            )}
          </div>

          <div className="new-submission-section">
            <h3 className="subsection-title">Create New Submission</h3>
            <ProgressForm studentId={userId} supervisorId={supervisorInfo?.id} />
          </div>
        </section>
      </div>
    </main>
  )
}
