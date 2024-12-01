'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/client';
import React from 'react';

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
          .select(
            `
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
            `
          )
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
    return <div className="p-4">Loading...</div>;
  }

  if (error || !formDetails) {
    return <div className="p-4">{error || 'No data found'}</div>;
  }

  return (
    <main className="p-4">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-500 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </nav>

    
        <section className="mb-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Progress Form Details</h2>
          <p><strong>Term:</strong> {formDetails.term}</p>
          <p><strong>Program:</strong> {formDetails.program}</p>
          <p><strong>Degree:</strong> {formDetails.degree}</p>
          <p><strong>Year of Study:</strong> {formDetails.year_of_study}</p>
          <p><strong>Supervisor:</strong> {formDetails.supervisor_name}</p>
          <p><strong>Submitted At:</strong> {new Date(formDetails.created_at).toLocaleDateString()}</p>
          <p><strong>Progress to Date:</strong> {formDetails.progress_to_date}</p>
          <p><strong>Coursework:</strong> {formDetails.coursework}</p>
          <p><strong>Objective for Next Term:</strong> {formDetails.objective_next_term}</p>
        </section>

      
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Feedback</h2>
          <p><strong>Self Motivation:</strong> {formDetails.self_motivation}</p>
          <p><strong>Research Skills:</strong> {formDetails.research_skills}</p>
          <p><strong>Research Progress:</strong> {formDetails.research_progress}</p>
          <p><strong>Overall Performance:</strong> {formDetails.overall_performance}</p>
          <p><strong>Comments:</strong> {formDetails.comments}</p>
        </section>
      </div>
    </main>
  );
}