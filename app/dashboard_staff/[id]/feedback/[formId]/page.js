'use client';
import { supabase } from '../../../../../lib/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { use } from 'react';

export default function FeedbackPage({ params }) {
    // Correctly unwrap params using React.use()
    const unwrappedParams = use(params);
    const { formId } = unwrappedParams;
    const [formDetails, setFormDetails] = useState(null);
    const [feedback, setFeedback] = useState({
        self_motivation: '',
        research_skills: '',
        research_progress: '',
        overall_performance: '',
        comments: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchFormDetails() {
            if (!formId) {
                setError('No form ID provided');
                setLoading(false);
                return;
            }

            try {
                const { data: formData, error: formError } = await supabase
                    .from('progress_form')
                    .select('*')
                    .eq('id', formId)
                    .single();

                if (formError) {
                    setError('Error fetching form details');
                    console.error('Error fetching form details:', formError);
                    return;
                }

                if (!formData) {
                    setError('Form not found');
                    return;
                }

                setFormDetails(formData);
                // Pre-populate feedback state with existing data if available
                setFeedback({
                    self_motivation: formData.self_motivation || '',
                    research_skills: formData.research_skills || '',
                    research_progress: formData.research_progress || '',
                    overall_performance: formData.overall_performance || '',
                    comments: formData.comments || '',
                });
            } catch (error) {
                setError('An unexpected error occurred');
                console.error('Error fetching form details:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchFormDetails();
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
            const { error: updateError } = await supabase
                .from('progress_form')
                .update({
                    self_motivation: feedback.self_motivation,
                    research_skills: feedback.research_skills,
                    research_progress: feedback.research_progress,
                    overall_performance: feedback.overall_performance,
                    comments: feedback.comments,
                })
                .eq('id', formId);

            if (updateError) {
                throw updateError;
            }

            alert('Annotations saved successfully.');
        } catch (error) {
            console.error('Error saving annotations:', error);
            alert('Failed to save annotations.');
        }
    };

    const handleSubmitFeedback = async () => {
        try {
            const { error: submitError } = await supabase
                .from('progress_form')
                .update({ 
                    status: 'submitted',
                    self_motivation: feedback.self_motivation,
                    research_skills: feedback.research_skills,
                    research_progress: feedback.research_progress,
                    overall_performance: feedback.overall_performance,
                    comments: feedback.comments,
                })
                .eq('id', formId);

            if (submitError) {
                throw submitError;
            }

            alert('Feedback submitted successfully.');
            router.push('/dashboard_staff');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-4 text-lg">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-4 text-red-500">{error}</div>
            </div>
        );
    }

    if (!formDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-4">Form not found.</div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Provide Feedback</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Progress Form Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Term:</strong> {formDetails.term}</p>
                    <p><strong>Start Term:</strong> {formDetails.start_term}</p>
                    <p><strong>Program:</strong> {formDetails.program}</p>
                    <p><strong>Degree:</strong> {formDetails.degree}</p>
                    <p><strong>Year of Study:</strong> {formDetails.year_of_study}</p>
                    <p><strong>Supervisor:</strong> {formDetails.supervisor_name}</p>
                    <p><strong>Expected Completion:</strong> {formDetails.expected_completion && new Date(formDetails.expected_completion).toLocaleDateString()}</p>
                    <p><strong>Submitted At:</strong> {new Date(formDetails.created_at).toLocaleDateString()}</p>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Progress to Date</h3>
                    <p className="whitespace-pre-wrap">{formDetails.progress_to_date}</p>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Coursework</h3>
                    <p className="whitespace-pre-wrap">{formDetails.coursework}</p>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Objectives for Next Term</h3>
                    <p className="whitespace-pre-wrap">{formDetails.objective_next_term}</p>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Student Comments</h3>
                    <p className="whitespace-pre-wrap">{formDetails.student_comments}</p>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Student Signature:</strong> {formDetails.student_signature}</p>
                    <p><strong>Signature Date:</strong> {formDetails.signature_date && new Date(formDetails.signature_date).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Feedback</h2>
                <form onSubmit={(e) => e.preventDefault()}>
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
                            rows="4"
                            placeholder="Enter additional comments"
                        ></textarea>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSaveAnnotations}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Save Annotations
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmitFeedback}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}