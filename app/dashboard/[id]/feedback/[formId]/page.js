'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/client';
import React from 'react';
import './FeedbackPage.css';

export default function FeedbackPage({ params: asyncParams }) {
  const router = useRouter();
  const params = React.use(asyncParams);
  const formId = params?.formId;
  const [formDetails, setFormDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('progress_form')
          .select(`
            term,
            created_at,
            program,
            degree,
            year_of_study,
            supervisor_name,
            progress_to_date,
            coursework,
            objective_next_term,
            self_motivation,
            research_skills,
            research_progress,
            overall_performance,
            comments
          `)
          .eq('id', formId)
          .single();

        if (error) {
          setError('Error fetching form details');
          console.error('Error fetching form details:', error);
        } else {
          setFormDetails(data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (formId) {
      fetchData();
    }
  }, [formId]);

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  if (error || !formDetails) {
    return <div className="error-state">{error || 'No data found'}</div>;
  }

  const getRatingColor = (rating) => {
    const ratingNum = parseInt(rating);
    if (ratingNum >= 4) return 'excellent';
    if (ratingNum >= 3) return 'good';
    if (ratingNum >= 2) return 'fair';
    return 'needs-improvement';
  };

  return (
    <main className="feedback-page">
      <div className="container">
        <nav className="navigation">
          <button
            onClick={() => router.push('/dashboard')}
            className="back-button"
          >
            ← Back to Dashboard
          </button>
        </nav>

        <div className="content-wrapper">
          <section className="form-details">
            <div className="header-section">
              <h2>Progress Form Details</h2>
              <span className="submission-date">
                Submitted on {new Date(formDetails.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Term</label>
                <span>{formDetails.term}</span>
              </div>
              <div className="info-item">
                <label>Program</label>
                <span>{formDetails.program}</span>
              </div>
              <div className="info-item">
                <label>Degree</label>
                <span>{formDetails.degree}</span>
              </div>
              <div className="info-item">
                <label>Year of Study</label>
                <span>{formDetails.year_of_study}</span>
              </div>
              <div className="info-item">
                <label>Supervisor</label>
                <span>{formDetails.supervisor_name}</span>
              </div>
            </div>

            <div className="text-sections">
              <div className="text-section">
                <h3>Progress to Date</h3>
                <p>{formDetails.progress_to_date}</p>
              </div>
              <div className="text-section">
                <h3>Coursework</h3>
                <p>{formDetails.coursework}</p>
              </div>
              <div className="text-section">
                <h3>Objectives for Next Term</h3>
                <p>{formDetails.objective_next_term}</p>
              </div>
            </div>
          </section>

          <section className="feedback-section">
            <h2>Supervisor Feedback</h2>
            
            <div className="ratings-grid">
              <div className={`rating-item ${getRatingColor(formDetails.self_motivation)}`}>
                <label>Self Motivation</label>
                <span className="rating">{formDetails.self_motivation}/5</span>
              </div>
              <div className={`rating-item ${getRatingColor(formDetails.research_skills)}`}>
                <label>Research Skills</label>
                <span className="rating">{formDetails.research_skills}/5</span>
              </div>
              <div className={`rating-item ${getRatingColor(formDetails.research_progress)}`}>
                <label>Research Progress</label>
                <span className="rating">{formDetails.research_progress}/5</span>
              </div>
              <div className={`rating-item ${getRatingColor(formDetails.overall_performance)}`}>
                <label>Overall Performance</label>
                <span className="rating">{formDetails.overall_performance}/5</span>
              </div>
            </div>

            <div className="comments-section">
              <h3>Additional Comments</h3>
              <p>{formDetails.comments}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}