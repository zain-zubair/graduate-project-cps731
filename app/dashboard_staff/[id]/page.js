'use client';
import { supabase } from '../../../lib/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import StaffSelect from '@/app/component/staffSelect';
import './StaffDashboard.css';

export default function StaffDashboard({ params: asyncParams }) {
    const router = useRouter();
    const params = React.use(asyncParams);
    const userId = params.id;
    const [user, setUser] = useState(null);
    const [staffData, setStaffData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assignedForms, setAssignedForms] = useState([]); 

    useEffect(() => {
        fetchUserData();
    }, [userId, router]);

    async function fetchUserData() {
        try {
            if (!userId) {
                console.error('No userId provided');
                setLoading(false);
                return;
            }

            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !authUser) {
                console.error('Error fetching authenticated user:', authError);
                router.push('/auth');
                return;
            }

            const { data: userData, error: userError } = await supabase
                .from('user')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError || !userData) {
                console.error('Error fetching user:', userError);
                router.push('/auth');
                return;
            }

            setUser(userData);
            await fetchStaffData(userData);
        } catch (error) {
            console.error('Error in fetchUserData:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchStaffData(userData) {
        const staffTableMap = {
            'supervisor': 'supervisor',
            'graduate_program_assistant': 'graduate_program_assistant',
            'graduate_program_director': 'graduate_program_director'
        };

        const staffTable = staffTableMap[userData.role];
        if (!staffTable) {
            console.error(`Invalid staff role: ${userData.role}`);
            return;
        }

        const { data: staffData, error: staffError } = await supabase
            .from(staffTable)
            .select('*')
            .eq('user_id', userId)
            .single();

        if (staffError) {
            console.error('Error fetching staff data:', staffError);
            return;
        }

        setStaffData(staffData);
        await fetchForms(userData.role, staffData);
    }

    async function fetchForms(role, staffData) {
        let query = supabase.from('progress_form').select('*');

        switch (role) {
            case 'supervisor':
                query = query.eq('supervisor_id', staffData.id);
                break;
            case 'graduate_program_assistant':
                query = query.eq('status', 'submitted_by_supervisor');
                break;
            case 'graduate_program_director':
                query = query.eq('status', 'approved_by_gpa');
                break;
        }

        const { data: forms, error: formsError } = await query;

        if (formsError) {
            console.error('Error fetching forms:', formsError);
        } else {
            setAssignedForms(forms || []);
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/auth');
    }

    async function handleSupervisorApproval(formId) {
        try {
            const { error } = await supabase
                .from('progress_form')
                .update({ 
                    supervisor_approved: true,
                    gpa_approved: false,
                    gpd_approved: false,
                    status: 'submitted_by_supervisor',
                    review_status: 'pending'
                })
                .eq('id', formId);
            
            if (error) throw error;
            alert('Form approved and submitted to GPA');
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to approve');
        }
    }

    async function handleGPAApproval(formId) {
        try {
            const { error } = await supabase
                .from('progress_form')
                .update({ 
                    supervisor_approved: true,  // Keep supervisor's approval
                    gpa_approved: true,        // Set GPA's approval
                    gpd_approved: false,       // Reset GPD's approval
                    status: 'approved_by_gpa',
                    review_status: 'pending'   // Reset review status
                })
                .eq('id', formId);
            
            if (error) throw error;
            alert('Form approved and submitted to GPD');
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to approve');
        }
    }

    async function handleGPDApproval(formId) {
        try {
            const { error } = await supabase
                .from('progress_form')
                .update({ 
                    gpd_approved: true,
                    status: 'approved_by_gpd',
                    review_status: 'completed'
                })
                .eq('id', formId);
            
            if (error) throw error;
            alert('Form approved');
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to approve');
        }
    }

    if (loading) return <div className="loading-container">Loading...</div>;
    if (!user) return <div className="error-container">User not found</div>;

    const getRoleTitle = (role) => ({
        'supervisor': 'Supervisor',
        'graduate_program_assistant': 'Graduate Program Assistant',
        'graduate_program_director': 'Graduate Program Director'
    })[role] || role;

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <header className="dashboard-header">
                    <h1>{getRoleTitle(user.role)} Dashboard</h1>
                    <button onClick={handleSignOut} className="sign-out-button">
                        Sign Out
                    </button>
                </header>

                <section className="profile-section">
                    <h2>Profile Information</h2>
                    <div className="profile-grid">
                        <div className="profile-item">
                            <p className="label">Name</p>
                            <p className="value">{user.name}</p>
                        </div>
                        <div className="profile-item">
                            <p className="label">Email</p>
                            <p className="value">{user.email}</p>
                        </div>
                        <div className="profile-item">
                            <p className="label">Role</p>
                            <p className="value">{getRoleTitle(user.role)}</p>
                        </div>
                        {staffData && (
                            <div className="profile-item">
                                <p className="label">Department</p>
                                <p className="value">{staffData.department}</p>
                            </div>
                        )}
                    </div>
                </section>

                {(user.role === 'supervisor' || 
                  user.role === 'graduate_program_assistant' || 
                  user.role === 'graduate_program_director') && (
                    <section className="forms-section">
                        <h2>
                            {user.role === 'supervisor' && 'Assigned Progress Forms'}
                            {user.role === 'graduate_program_assistant' && 'Forms Pending GPA Review'}
                            {user.role === 'graduate_program_director' && 'Forms Pending GPD Review'}
                        </h2>
                        
                        {assignedForms.length > 0 ? (
                            <ul className="forms-list">
                                {assignedForms.map((form) => (
                                    <li key={form.id} className="form-item">
                                        <div className="form-content">
                                            <div className="form-header">
                                                <div className="form-info">
                                                    <p><strong>Term:</strong> {form.term}</p>
                                                    <p><strong>Submitted At:</strong> {new Date(form.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/dashboard_staff/${userId}/feedback/${form.id}`)}
                                                    className="review-button"
                                                >
                                                    {user.role === 'supervisor' ? 'Provide Feedback' : 'Review Form'}
                                                </button>
                                            </div>

                                            <div className="approval-status">
                                                <h3>Approval Status</h3>
                                                <div className="status-indicators">
                                                    <div className="status-item">
                                                        <div className={`status-dot ${form.supervisor_approved ? 'approved' : ''}`} />
                                                        <span>Supervisor</span>
                                                    </div>
                                                    <div className="status-item">
                                                        <div className={`status-dot ${form.gpa_approved ? 'approved' : ''}`} />
                                                        <span>GPA</span>
                                                    </div>
                                                    <div className="status-item">
                                                        <div className={`status-dot ${form.gpd_approved ? 'approved' : ''}`} />
                                                        <span>GPD</span>
                                                    </div>
                                                </div>
                                            </div>

                            {/* Role-specific action buttons */}
                            <div className="form-actions">
                                {user.role === 'supervisor' && (
                                    <button
                                        onClick={() => handleSupervisorApproval(form.id)}
                                        className="submit-button"
                                    >
                                        Submit to GPA
                                    </button>
                                )}

                                {user.role === 'graduate_program_assistant' && form.supervisor_approved && (
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleGPAApproval(form.id)}
                                            className="submit-button"
                                        >
                                            Submit to GPD
                                        </button>
                                        <button
                                            onClick={() => handleReview(form.id, 'gpa')}
                                            className="review-button"
                                        >
                                            Send Back for Review
                                        </button>
                                    </div>
                                )}

                                {user.role === 'graduate_program_director' && form.gpa_approved && (
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleGPDApproval(form.id)}
                                            className="submit-button"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReview(form.id, 'gpd')}
                                            className="review-button"
                                        >
                                            Send Back for Review
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="no-forms">No forms requiring your attention.</p>
        )}
    </section>
)}

                {user?.role && (
                    <div className="staff-select">
                        <StaffSelect role={user.role} userId={userId} />
                    </div>
                )}
            </div>
        </div>
    );
}