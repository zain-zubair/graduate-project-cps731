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
        async function fetchUserData() {
            try {
                if (!userId) {
                    console.error('No userId provided');
                    setLoading(false);
                    return;
                }

                // Check if user is authenticated
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
                if (authError || !authUser) {
                    console.error('Error fetching authenticated user:', authError);
                    router.push('/auth');
                    return;
                }

                // Fetch user data
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

                // Map roles to staff tables
                const staffTableMap = {
                    'supervisor': 'supervisor',
                    'graduate_program_assistant': 'graduate_program_assistant',
                    'graduate_program_director': 'graduate_program_director'
                };

                const staffTable = staffTableMap[userData.role];
                if (!staffTable) {
                    console.error(`Invalid staff role: ${userData.role}`);
                    setLoading(false);
                    return;
                }

                // Fetch staff-specific data
                const { data: staffData, error: staffError } = await supabase
                    .from(staffTable)
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (staffError) {
                    console.error('Error fetching staff data:', staffError);
                } else {
                    setStaffData(staffData);
                }

                // Fetch forms based on role
                let formsQuery;
                if (userData.role === 'supervisor') {
                    formsQuery = supabase
                        .from('progress_form')
                        .select('*')  // Selecting all fields for consistency
                        .eq('supervisor_id', staffData.id);
                } else if (userData.role === 'graduate_program_assistant') {
                    formsQuery = supabase
                        .from('progress_form')
                        .select('*')
                        .eq('status', 'submitted_by_supervisor');
                } else if (userData.role === 'graduate_program_director') {
                    formsQuery = supabase
                        .from('progress_form')
                        .select('*')
                        .eq('status', 'approved_by_gpa');
                }

                if (formsQuery) {
                    const { data: forms, error: formsError } = await formsQuery;
                    if (formsError) {
                        console.error('Error fetching forms:', formsError);
                    } else {
                        setAssignedForms(forms || []);
                    }
                }

            } catch (error) {
                console.error('Error in fetchUserData:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [userId, router]);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/auth');
    }

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (!user) {
        return <div className="p-4">User not found</div>;
    }

    const getRoleTitle = (role) => {
        const roleTitles = {
            'supervisor': 'Supervisor',
            'graduate_program_assistant': 'Graduate Program Assistant',
            'graduate_program_director': 'Graduate Program Director'
        };
        return roleTitles[role] || role;
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'in_progress': 'status-badge-progress',
            'disapproved': 'status-badge-disapproved',
            'approved': 'status-badge-approved'
        };
        return `status-badge ${statusClasses[status] || 'status-badge-default'}`;
    };

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    if (!user) {
        return <div className="error-screen">User not found</div>;
    }

    return (
        <div className="staff-dashboard">
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="header-content">
                        <h1>{getRoleTitle(user.role)} Dashboard</h1>
                        <button onClick={handleSignOut} className="sign-out-button">
                            Sign Out
                        </button>
                    </div>
                </header>

                <section className="profile-card">
                    <h2>Profile Information</h2>
                    <div className="profile-grid">
                        <div className="profile-item">
                            <label>Name</label>
                            <span>{user.name}</span>
                        </div>
                        <div className="profile-item">
                            <label>Email</label>
                            <span>{user.email}</span>
                        </div>
                        <div className="profile-item">
                            <label>Role</label>
                            <span>{getRoleTitle(user.role)}</span>
                        </div>
                        {staffData && (
                            <div className="profile-item">
                                <label>Department</label>
                                <span>{staffData.department}</span>
                            </div>
                        )}
                    </div>
                </section>

                {(user.role === 'supervisor' || user.role === 'graduate_program_assistant' || user.role === 'graduate_program_director') && (
                    <section className="forms-section">
                        <h2>
                            {user.role === 'supervisor' && 'Assigned Progress Forms'}
                            {user.role === 'graduate_program_assistant' && 'Forms Pending GPA Review'}
                            {user.role === 'graduate_program_director' && 'Forms Pending GPD Review'}
                        </h2>
                        
                        {assignedForms.length > 0 ? (
                            <ul className="forms-list">
                                {assignedForms.map((form) => (
                                    <li key={form.id} className="form-card">
                                        <div className="form-header">
                                            <div className="form-info">
                                                <h3>{form.term}</h3>
                                                <span className="form-date">
                                                    Submitted: {new Date(form.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span className={getStatusBadgeClass(form.review_status)}>
                                                {form.review_status || 'Pending'}
                                            </span>
                                        </div>

                                        <div className="form-actions">
                                            <div className="status-select">
                                                <label>Review Status</label>
                                                <select
                                                    value={form.review_status || ''}
                                                    onChange={async (e) => {
                                                        try {
                                                            const { error } = await supabase
                                                                .from('progress_form')
                                                                .update({ review_status: e.target.value })
                                                                .eq('id', form.id);
                                                            
                                                            if (error) throw error;
                                                            window.location.reload();
                                                        } catch (error) {
                                                            console.error('Error updating status:', error);
                                                            alert('Failed to update status');
                                                        }
                                                    }}
                                                >
                                                    {user.role === 'supervisor' ? (
                                                        <>
                                                            <option value="in_progress">In Progress</option>
                                                            <option value="disapproved">Disapproved</option>
                                                            <option value="approved">Approved</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="disapproved">Disapproved</option>
                                                            <option value="approved">Approved</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>

                                            <div className="button-group">
                                                <button
                                                    onClick={() => router.push(`/dashboard_staff/${userId}/feedback/${form.id}`)}
                                                    className="primary-button"
                                                >
                                                    {user.role === 'supervisor' ? 'Provide Feedback' : 'Review Form'}
                                                </button>

                                                {user.role === 'supervisor' && form.review_status === 'approved' && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const { error } = await supabase
                                                                    .from('progress_form')
                                                                    .update({ status: 'submitted_by_supervisor' })
                                                                    .eq('id', form.id);
                                                                
                                                                if (error) throw error;
                                                                alert('Successfully submitted to GPA');
                                                                window.location.reload();
                                                            } catch (error) {
                                                                console.error('Error:', error);
                                                                alert('Failed to submit to GPA');
                                                            }
                                                        }}
                                                        className="success-button"
                                                    >
                                                        Submit to GPA
                                                    </button>
                                                )}

                                                {user.role === 'graduate_program_assistant' && form.review_status === 'approved' && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const { error } = await supabase
                                                                    .from('progress_form')
                                                                    .update({ status: 'approved_by_gpa' })
                                                                    .eq('id', form.id);
                                                                
                                                                if (error) throw error;
                                                                alert('Successfully submitted to GPD');
                                                                window.location.reload();
                                                            } catch (error) {
                                                                console.error('Error:', error);
                                                                alert('Failed to submit to GPD');
                                                            }
                                                        }}
                                                        className="success-button"
                                                    >
                                                        Submit to GPD
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="no-forms">
                                <p>No forms requiring your attention.</p>
                            </div>
                        )}
                    </section>
                )}

                {user?.role && (
                    <section className="staff-select-section">
                        <StaffSelect role={user.role} userId={userId} />
                    </section>
                )}
            </div>
        </div>
    );
}