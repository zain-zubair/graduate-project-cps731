'use client';
import { supabase } from '../../../../../lib/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function FeedbackPage({ params: asyncParams }) {
    const params = React.use(asyncParams);
    const { formId } = params; 
    const [formDetails, setFormDetails] = useState(null);
    const [feedback, setFeedback] = useState({
        self_motivation: '',
        research_skills: '',
        research_progress: '',
        overall_performance: '',
        comments: '',
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchFormDetails() {
            try {
                
                const { data: formData, error: formError } = await supabase
                    .from('progress_form')
                    .select('*')
                    .eq('id', formId)
                    .single();

                if (formError) {
                    console.error('Error fetching form details:', formError);
                    return;
                }

                setFormDetails(formData);
            } catch (error) {
                console.error('Error fetching form details:', error);
            } finally {
                setLoading(false);
            }
        }

        if (formId) {
            fetchFormDetails();
        }
    }, [formId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFeedback((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveAnnotations = async () => {
        try {
           
            const { error } = await supabase
                .from('progress_form')
                .update({
                    self_motivation: feedback.self_motivation,
                    research_skills: feedback.research_skills,
                    research_progress: feedback.research_progress,
                    overall_performance: feedback.overall_performance,
                    comments: feedback.comments,
                })
                .eq('id', formId);

            if (error) {
                console.error('Error saving annotations:', error);
                alert('Failed to save annotations.');
            } else {
                alert('Annotations saved successfully.');
            }
        } catch (error) {
            console.error('Error saving annotations:', error);
        }
    };

    const handleSubmitFeedback = async () => {
        try {
          
            const { error } = await supabase
                .from('progress_form')
                .update({ status: 'submitted' })
                .eq('id', formId);

            if (error) {
                console.error('Error submitting feedback:', error);
                alert('Failed to submit feedback.');
            } else {
                alert('Feedback submitted successfully.');
                router.push('/dashboard_staff');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (!formDetails) {
        return <div className="p-4">Form not found.</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Provide Feedback</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Progress Form Details</h2>
                <p><strong>Term:</strong> {formDetails.term}</p>
                <p><strong>Submitted At:</strong> {new Date(formDetails.created_at).toLocaleDateString()}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Feedback</h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Self Motivation</label>
                        <select
                            name="self_motivation"
                            value={feedback.self_motivation}
                            onChange={handleInputChange}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Select</option>
                            <option value="Exceptional">Exceptional</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Needs Improvement">Needs Improvement</option>
                            <option value="Unsatisfactory">Unsatisfactory</option>
                            <option value="Inadequate">Inadequate</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Research Skills</label>
                        <select
                            name="research_skills"
                            value={feedback.research_skills}
                            onChange={handleInputChange}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Select</option>
                            <option value="Exceptional">Exceptional</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Needs Improvement">Needs Improvement</option>
                            <option value="Unsatisfactory">Unsatisfactory</option>
                            <option value="Inadequate">Inadequate</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Research Progress</label>
                        <select
                            name="research_progress"
                            value={feedback.research_progress}
                            onChange={handleInputChange}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Select</option>
                            <option value="Exceptional">Exceptional</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Needs Improvement">Needs Improvement</option>
                            <option value="Unsatisfactory">Unsatisfactory</option>
                            <option value="Inadequate">Inadequate</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Overall Performance</label>
                        <select
                            name="overall_performance"
                            value={feedback.overall_performance}
                            onChange={handleInputChange}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Select</option>
                            <option value="INP">In Progress</option>
                            <option value="UNS">Unsatisfactory</option>
                            <option value="N/A">Not Applicable</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Comments</label>
                        <textarea
                            name="comments"
                            value={feedback.comments}
                            onChange={handleInputChange}
                            className="w-full border rounded p-2"
                            placeholder="Enter additional comments"
                        ></textarea>
                    </div>
                    <button
                        type="button"
                        onClick={handleSaveAnnotations}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save Annotations
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmitFeedback}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
                    >
                        Submit Feedback
                    </button>
                </form>
            </div>
        </div>
    );
}
