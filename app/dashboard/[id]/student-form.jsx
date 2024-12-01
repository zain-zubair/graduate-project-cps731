import { useState } from 'react'
import { supabase } from '@/lib/client'
import './ProgressForm.css'

const ProgressForm = ({ studentId, supervisorId }) => {
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
    supervisor_id: supervisorId,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!supervisorId) {
      alert('Cannot submit progress form if you have no assigned supervisor.');
      return;
    }
  
    try {
      // Fetch the supervisor's email by joining the 'supervisor' and 'user' tables
      const { data: supervisorData, error: supervisorError } = await supabase
        .from('supervisor')
        .select('user ( email )')
        .eq('id', supervisorId)
        .single();
  
      if (supervisorError || !supervisorData) {
        throw new Error('Unable to retrieve supervisor email.');
      }
  
      const supervisorEmail = supervisorData.user.email;
  
      // Insert the progress form
      const { error } = await supabase.from('progress_form').insert(formData);
  
      if (error) {
        throw error;
      }
  
      // Send the notification
      const notificationResponse = await fetch('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'oeunvicheka95@gmail.com',
          subject: 'New Progress Form',
          message: `A new progress form was submitted for ${formData.term} by student ${formData.student_id}.`
        })
      });      
  
      const result = await notificationResponse.json();
      console.log('Notification result:', result);
  
      if (!notificationResponse.ok) {
        throw new Error(result.error || 'Failed to send notification');
      }
  
      alert('Form submitted successfully!');
  
      // Reset form data
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
        student_id: studentId,
        supervisor_id: supervisorId,
      });
    } catch (error) {
      console.error('Error submitting form:', error.message);
      alert('Error submitting form: ' + error.message);
    }
  };
  
  
  

  return (
    <form onSubmit={handleSubmit} className="progress-form">
      <div className="form-grid">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Term</label>
            <input
              type="text"
              name="term"
              value={formData.term}
              onChange={handleChange}
              required
              placeholder="e.g., Fall 2024"
            />
          </div>

          <div className="form-group">
            <label>Start Term</label>
            <input
              type="text"
              name="start_term"
              value={formData.start_term}
              onChange={handleChange}
              required
              placeholder="e.g., Fall 2023"
            />
          </div>

          <div className="form-group">
            <label>Program</label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
              placeholder="Your program name"
            />
          </div>

          <div className="form-group">
            <label>Degree</label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              placeholder="e.g., Ph.D., Master's"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Academic Details</h3>
          <div className="form-group">
            <label>Year of Study</label>
            <input
              type="number"
              name="year_of_study"
              value={formData.year_of_study}
              onChange={handleChange}
              required
              min="1"
              max="10"
            />
          </div>

          <div className="form-group">
            <label>Supervisor Name</label>
            <input
              type="text"
              name="supervisor_name"
              value={formData.supervisor_name}
              onChange={handleChange}
              required
              placeholder="Full name of your supervisor"
            />
          </div>

          <div className="form-group">
            <label>Expected Completion Date</label>
            <input
              type="date"
              name="expected_completion"
              value={formData.expected_completion}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section full-width">
          <h3>Progress Details</h3>
          <div className="form-group">
            <label>Progress to Date</label>
            <textarea
              name="progress_to_date"
              value={formData.progress_to_date}
              onChange={handleChange}
              placeholder="Describe your academic progress this term"
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Coursework</label>
            <textarea
              name="coursework"
              value={formData.coursework}
              onChange={handleChange}
              required
              placeholder="List completed courses and grades"
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Objectives for Next Term</label>
            <textarea
              name="objective_next_term"
              value={formData.objective_next_term}
              onChange={handleChange}
              placeholder="What are your academic goals for next term?"
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Additional Comments</label>
            <textarea
              name="student_comments"
              value={formData.student_comments}
              onChange={handleChange}
              placeholder="Any additional comments or concerns"
              rows="4"
            ></textarea>
          </div>
        </div>

        <div className="form-section signature-section">
          <h3>Signature</h3>
          <div className="form-group">
            <label>Student Signature</label>
            <input
              type="text"
              name="student_signature"
              value={formData.student_signature}
              onChange={handleChange}
              required
              placeholder="Type your full name"
            />
          </div>

          <div className="form-group">
            <label>Signature Date</label>
            <input
              type="date"
              name="signature_date"
              value={formData.signature_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button">
          Submit Progress Form
        </button>
      </div>
    </form>
  )
}

export default ProgressForm