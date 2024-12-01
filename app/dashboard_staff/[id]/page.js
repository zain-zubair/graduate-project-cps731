'use client';
import { supabase } from '../../../lib/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import StaffSelect from '@/app/component/staffSelect';

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

                    // Fetch forms based on role
                    if (userData.role === 'supervisor' && staffData) {
                        const { data: forms, error: formsError } = await supabase
                            .from('progress_form')
                            .select('*')
                            .eq('supervisor_id', staffData.id);

                        if (formsError) {
                            console.error('Error fetching forms:', formsError);
                        } else {
                            console.log('Fetched forms:', forms);
                            setAssignedForms(forms || []);
                        }
                    } else if (userData.role === 'graduate_program_assistant') {
                        const { data: forms, error: formsError } = await supabase
                            .from('progress_form')
                            .select('*')
                            .eq('status', 'submitted_by_supervisor');

                        if (formsError) {
                            console.error('Error fetching forms:', formsError);
                        } else {
                            setAssignedForms(forms || []);
                        }
                    } else if (userData.role === 'graduate_program_director') {
                        const { data: forms, error: formsError } = await supabase
                            .from('progress_form')
                            .select('*')
                            .eq('status', 'approved_by_gpa');

                        if (formsError) {
                            console.error('Error fetching forms:', formsError);
                        } else {
                            setAssignedForms(forms || []);
                        }
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

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{getRoleTitle(user.role)} Dashboard</h1>
                    <button 
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Profile Section */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Name</p>
                            <p className="font-medium">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Role</p>
                            <p className="font-medium">{getRoleTitle(user.role)}</p>
                        </div>
                        {staffData && (
                            <div>
                                <p className="text-gray-600">Department</p>
                                <p className="font-medium">{staffData.department}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Forms Section */}
                {(user.role === 'supervisor' || user.role === 'graduate_program_assistant' || user.role === 'graduate_program_director') && (
                    <section className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {user.role === 'supervisor' && 'Assigned Progress Forms'}
                            {user.role === 'graduate_program_assistant' && 'Forms Pending GPA Review'}
                            {user.role === 'graduate_program_director' && 'Forms Pending GPD Review'}
                        </h2>
                        {assignedForms.length > 0 ? (
                            <ul className="space-y-4">
                                {assignedForms.map((form) => (
                                    <li key={form.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex flex-col gap-4">
                                            {/* Basic Form Info */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p><strong>Term:</strong> {form.term}</p>
                                                    <p><strong>Submitted At:</strong> {new Date(form.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/dashboard_staff/${userId}/feedback/${form.id}`)}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                >
                                                    {user.role === 'supervisor' ? 'Provide Feedback' : 'Review Form'}
                                                </button>
                                            </div>

                                            {/* Approval Status Indicators */}
                                            <div className="border-t pt-3">
                                                <h3 className="text-sm font-semibold mb-2">Approval Status</h3>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            form.supervisor_approved ? 'bg-green-500' : 'bg-gray-300'
                                                        }`} />
                                                        <span className="text-sm">Supervisor</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            form.gpa_approved ? 'bg-green-500' : 'bg-gray-300'
                                                        }`} />
                                                        <span className="text-sm">GPA</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            form.gpd_approved ? 'bg-green-500' : 'bg-gray-300'
                                                        }`} />
                                                        <span className="text-sm">GPD</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="border-t pt-3 flex justify-between items-center">
                                                {user.role === 'supervisor' && (
                                                    <button
                                                        onClick={async () => {
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
                                                                    .eq('id', form.id);
                                                                
                                                                if (error) throw error;
                                                                alert('Form approved and submitted to GPA');
                                                                window.location.reload();
                                                            } catch (error) {
                                                                console.error('Error:', error);
                                                                alert('Failed to approve');
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                    >
                                                        Submit to GPA
                                                    </button>
                                                )}

                                                {user.role === 'graduate_program_assistant' && form.supervisor_approved && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const { error } = await supabase
                                                                        .from('progress_form')
                                                                        .update({ 
                                                                            gpa_approved: true,
                                                                            status: 'approved_by_gpa'
                                                                        })
                                                                        .eq('id', form.id);
                                                                    
                                                                    if (error) throw error;
                                                                    alert('Form approved and submitted to GPD');
                                                                    window.location.reload();
                                                                } catch (error) {
                                                                    console.error('Error:', error);
                                                                    alert('Failed to approve');
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                        >
                                                            Submit to GPD
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const { error } = await supabase
                                                                        .from('progress_form')
                                                                        .update({ 
                                                                            status: 'pending',
                                                                            review_status: 'feedback_from_gpa',
                                                                            supervisor_approved: false,
                                                                            gpa_approved: false
                                                                        })
                                                                        .eq('id', form.id);
                                                                    
                                                                    if (error) throw error;
                                                                    alert('Feedback sent to supervisor');
                                                                    window.location.reload();
                                                                } catch (error) {
                                                                    console.error('Error:', error);
                                                                    alert('Failed to send feedback');
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                        >
                                                            Send Back for Review
                                                        </button>
                                                    </div>
                                                )}

                                                {user.role === 'graduate_program_director' && form.gpa_approved && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const { error } = await supabase
                                                                        .from('progress_form')
                                                                        .update({ 
                                                                            gpd_approved: true,
                                                                            status: 'approved_by_gpd',
                                                                            review_status: 'completed'
                                                                        })
                                                                        .eq('id', form.id);
                                                                    
                                                                    if (error) throw error;
                                                                    alert('Form approved');
                                                                    window.location.reload();
                                                                } catch (error) {
                                                                    console.error('Error:', error);
                                                                    alert('Failed to approve');
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const { error } = await supabase
                                                                        .from('progress_form')
                                                                        .update({ 
                                                                            status: 'pending',
                                                                            review_status: 'feedback_from_gpd',
                                                                            supervisor_approved: false,
                                                                            gpa_approved: false,
                                                                            gpd_approved: false
                                                                        })
                                                                        .eq('id', form.id);
                                                                    
                                                                    if (error) throw error;
                                                                    alert('Feedback sent to supervisor');
                                                                    window.location.reload();
                                                                } catch (error) {
                                                                    console.error('Error:', error);
                                                                    alert('Failed to send feedback');
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
                            <p className="text-gray-500">No forms requiring your attention.</p>
                        )}
                    </section>
                )}

                {/* Staff Select Section */}
                {user?.role && (
                    <div className="mt-8">
                        <StaffSelect role={user.role} userId={userId} />
                    </div>
                )}
            </div>
        </div>
    );
}