import { useState } from 'react'
import { supabase } from '../../../lib/client'

const ProgressForm = ({ studentId }) => {
  const [formData, setFormData] = useState({
    term: '',
    start_term: '',
    program: '',
    degree: '',
    year_of_study: '',
    supervisor_name: '',
    expected_completion: '',
    progress_to_date: '',
    coursework: '',
    objective_next_term: '',
    student_comments: '',
    student_signature: '',
    signature_date: '',
    status: '',
    student_id: studentId,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('progress_form').insert(formData)

      alert(error ? 'Error submitting form.' : 'Form submitted successfully!')
      console.log(error)

      setFormData({
        term: '',
        start_term: '',
        program: '',
        degree: '',
        year_of_study: '',
        supervisor_name: '',
        expected_completion: '',
        progress_to_date: '',
        coursework: '',
        objective_next_term: '',
        student_comments: '',
        student_signature: '',
        signature_date: '',
        status: '',
        student_id: '',
        supervisor_id: '',
      })
    } catch (error) {
      console.error('Error submitting form:', error.message)
      alert('Error submitting form: ' + error.message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        padding: '0.25rem',
        width: '300px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Term</label>
        <input
          type="text"
          name="term"
          value={formData.term}
          onChange={handleChange}
          required
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Start Term</label>
        <input
          type="text"
          name="start_term"
          value={formData.start_term}
          onChange={handleChange}
          required
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Program</label>
        <input
          type="text"
          name="program"
          value={formData.program}
          onChange={handleChange}
          required
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Degree</label>
        <input
          type="text"
          name="degree"
          value={formData.degree}
          onChange={handleChange}
          required
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Year of Study</label>
        <input
          type="number"
          name="year_of_study"
          value={formData.year_of_study}
          onChange={handleChange}
          required
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Supervisor Name</label>
        <input
          type="text"
          name="supervisor_name"
          value={formData.supervisor_name}
          onChange={handleChange}
          required
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Expected Completion</label>
        <input
          type="date"
          name="expected_completion"
          value={formData.expected_completion}
          onChange={handleChange}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Progress to Date</label>
        <textarea
          name="progress_to_date"
          value={formData.progress_to_date}
          onChange={handleChange}
        ></textarea>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Coursework</label>
        <textarea
          name="coursework"
          value={formData.coursework}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Objective Next Term</label>
        <textarea
          name="objective_next_term"
          value={formData.objective_next_term}
          onChange={handleChange}
        ></textarea>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Student Comments</label>
        <textarea
          name="student_comments"
          value={formData.student_comments}
          onChange={handleChange}
        ></textarea>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Student Signature</label>
        <input
          type="text"
          name="student_signature"
          value={formData.student_signature}
          onChange={handleChange}
          required
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Signature Date</label>
        <input
          type="date"
          name="signature_date"
          value={formData.signature_date}
          onChange={handleChange}
          required
        />
      </div>
      {/* <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Status</label>
        <input
          type="text"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        />
      </div> */}

      {/* <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <label>Supervisor ID</label>
        <input
          type="text"
          name="supervisor_id"
          value={formData.supervisor_id}
          onChange={handleChange}
          required
        />
      </div> */}
      <button type="submit">Submit</button>
    </form>
  )
}

export default ProgressForm
