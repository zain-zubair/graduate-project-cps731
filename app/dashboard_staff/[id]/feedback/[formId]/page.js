'use client';
import { supabase } from '../../../../../lib/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import './FeedbackPage.css';

export default function FeedbackPage({ params }) {
    const unwrappedParams = use(params);
    const { formId } = unwrappedParams;
    const [formDetails, setFormDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const router = useRouter();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // State for form data
    const [feedback, setFeedback] = useState({
        self_motivation: '',
        research_skills: '',
        research_progress: '',
        overall_performance: '',
        comments: '',
        supervisor_signature: '',
        gpd_signature: '',
        gpd_comment: '',
    });

    // Fetch user role
    useEffect(() => {
        async function fetchUserRole() {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (!authUser) return;

                const { data: userData } = await supabase
                    .from('user')
                    .select('role, id')
                    .eq('id', unwrappedParams.id)
                    .single();

                if (userData) {
                    setUserRole(userData.role);
                    setUserId(userData.id);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        }
        fetchUserRole();
    }, [unwrappedParams.id]);

    // Fetch form details
    useEffect(() => {
        async function fetchFormDetails() {
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
                // Pre-populate feedback state with existing data
                setFeedback({
                    self_motivation: formData.self_motivation || '',
                    research_skills: formData.research_skills || '',
                    research_progress: formData.research_progress || '',
                    overall_performance: formData.overall_performance || '',
                    comments: formData.comments || '',
                    supervisor_signature: formData.supervisor_signature || '',
                    gpd_signature: formData.gpd_signature || '',
                    gpd_comment: formData.gpd_comment || '',
                });
            } catch (error) {
                setError('An unexpected error occurred');
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
        setHasUnsavedChanges(true);
    };

    const handleSaveChanges = () => {
        setHasUnsavedChanges(false);
        alert('Changes saved locally');
    };

    const handleSubmitFeedback = async () => {
        try {
            setHasUnsavedChanges(false);
            let updateData = {};

            // Each role only updates their specific fields
            switch (userRole) {
                case 'supervisor':
                    // Validate required fields for supervisor
                    if (!feedback.overall_performance) {
                        alert('Please select an Overall Performance rating before submitting.');
                        return;
                    }
                    if (!feedback.self_motivation || !feedback.research_skills || !feedback.research_progress) {
                        alert('Please complete all performance ratings before submitting.');
                        return;
                    }
                    if (!feedback.supervisor_signature) {
                        alert('Please provide your signature before submitting.');
                        return;
                    }

                    updateData = {
                        self_motivation: feedback.self_motivation,
                        research_skills: feedback.research_skills,
                        research_progress: feedback.research_progress,
                        overall_performance: feedback.overall_performance,
                        comments: feedback.comments || '',
                        supervisor_signature: feedback.supervisor_signature,
                        status: 'feedback_from_supervisor', // Changed from 'pending'
                        supervisor_approved: false,
                        gpa_approved: false,
                        gpd_approved: false
                    };
                    break;
                case 'graduate_program_assistant':
                    if (!feedback.comments) {
                        alert('Please provide comments before submitting.');
                        return;
                    }
                    updateData = {
                        comments: feedback.comments,
                        status: 'feedback_from_gpa'
                    };
                    break;
                case 'graduate_program_director':
                    if (!feedback.gpd_comment || !feedback.gpd_signature) {
                        alert('Please provide both comments and signature before submitting.');
                        return;
                    }
                    updateData = {
                        gpd_comment: feedback.gpd_comment,
                        gpd_signature: feedback.gpd_signature,
                        status: 'feedback_from_gpd'
                    };
                    break;
                default:
                    throw new Error('Invalid user role');
            }

            console.log('Submitting feedback with data:', updateData);

            const { data, error: submitError } = await supabase
                .from('progress_form')
                .update(updateData)
                .eq('id', formId)
                .select();

            if (submitError) {
                console.error('Supabase error:', submitError);
                throw submitError;
            }

            alert('Feedback submitted successfully.');
            router.push('/dashboard_staff');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert(`Failed to submit feedback: ${error.message || 'Please ensure all required fields are filled.'}`);
        }
    };

    if (loading) return <div className="loading-state">Loading...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!formDetails) return <div className="error-state">Form not found.</div>;

    const performanceOptions = [
        { value: '', label: 'Select rating' },
        { value: 'Exceptional', label: 'Exceptional' },
        { value: 'Good', label: 'Good' },
        { value: 'Fair', label: 'Fair' },
        { value: 'Needs Improvement', label: 'Needs Improvement' },
        { value: 'Unsatisfactory', label: 'Unsatisfactory' },
        { value: 'Inadequate', label: 'Inadequate' }
    ];

    const overallOptions = [
        { value: '', label: 'Select status' },
        { value: 'INP', label: 'In Progress' },
        { value: 'UNS', label: 'Unsatisfactory' },
        { value: 'N/A', label: 'Not Applicable' }
    ];

    return (
        <div className="feedback-page">
            <div className="feedback-container">
                <nav className="navigation">
                    <button onClick={() => router.back()} className="back-button">
                        ← Back
                    </button>
                    <h1>Provide Feedback</h1>
                </nav>

                <section className="form-details">
                    <h2>Progress Form Details</h2>
                    
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Term</label>
                            <span>{formDetails.term}</span>
                        </div>
                        <div className="info-item">
                            <label>Start Term</label>
                            <span>{formDetails.start_term}</span>
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
                        <div className="info-item">
                            <label>Expected Completion</label>
                            <span>{formDetails.expected_completion && new Date(formDetails.expected_completion).toLocaleDateString()}</span>
                        </div>
                        <div className="info-item">
                            <label>Submitted At</label>
                            <span>{new Date(formDetails.created_at).toLocaleDateString()}</span>
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
                        <div className="text-section">
                            <h3>Student Comments</h3>
                            <p>{formDetails.student_comments}</p>
                        </div>
                    </div>
                </section>

                <section className="feedback-form">
                    <h2>Provide Feedback</h2>
                    <form onSubmit={(e) => e.preventDefault()}>
                        {/* Only supervisor can rate performance */}
                        {userRole === 'supervisor' && (
                            <div className="rating-grid">
                                <div className="form-group">
                                    <label>Self Motivation</label>
                                    <select
                                        name="self_motivation"
                                        value={feedback.self_motivation}
                                        onChange={handleInputChange}
                                    >
                                        {performanceOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Research Skills</label>
                                    <select
                                        name="research_skills"
                                        value={feedback.research_skills}
                                        onChange={handleInputChange}
                                    >
                                        {performanceOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Research Progress</label>
                                    <select
                                        name="research_progress"
                                        value={feedback.research_progress}
                                        onChange={handleInputChange}
                                    >
                                        {performanceOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Overall Performance</label>
                                    <select
                                        name="overall_performance"
                                        value={feedback.overall_performance}
                                        onChange={handleInputChange}
                                    >
                                        {overallOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="comments-section">
                            {/* Everyone can leave comments */}
                            <div className="form-group">
                                <label>Comments</label>
                                <textarea
                                    name="comments"
                                    value={feedback.comments}
                                    onChange={handleInputChange}
                                    placeholder="Enter additional comments"
                                    rows="4"
                                ></textarea>
                            </div>

                            {/* Only GPD can leave GPD comments */}
                            {userRole === 'graduate_program_director' && (
                                <div className="form-group">
                                    <label>Graduate Program Director Comment</label>
                                    <textarea
                                        name="gpd_comment"
                                        value={feedback.gpd_comment}
                                        onChange={handleInputChange}
                                        placeholder="Enter GPD comments"
                                        rows="4"
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <div className="signature-section">
                            {/* Show signature fields based on role */}
                            {userRole === 'supervisor' && (
                                <div className="form-group">
                                    <label>Supervisor Signature</label>
                                    <input
                                        type="text"
                                        name="supervisor_signature"
                                        value={feedback.supervisor_signature}
                                        onChange={handleInputChange}
                                        placeholder="Enter supervisor signature"
                                    />
                                </div>
                            )}

                            {userRole === 'graduate_program_director' && (
                                <div className="form-group">
                                    <label>Graduate Program Director Signature</label>
                                    <input
                                        type="text"
                                        name="gpd_signature"
                                        value={feedback.gpd_signature}
                                        onChange={handleInputChange}
                                        placeholder="Enter GPD signature"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleSaveChanges}
                                className={`save-button ${!hasUnsavedChanges ? 'disabled' : ''}`}
                                disabled={!hasUnsavedChanges}
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitFeedback}
                                className="submit-button"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}