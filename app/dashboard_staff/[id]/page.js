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

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{getRoleTitle(user.role)} Dashboard</h1>
                    <button 
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                </div>

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

                {/* Display Progress Forms for all staff roles */}
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
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-3 flex-grow">
                                                <div>
                                                    <p><strong>Term:</strong> {form.term}</p>
                                                    <p><strong>Submitted At:</strong> {new Date(form.created_at).toLocaleDateString()}</p>
                                                </div>
                                                
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-grow">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                                                            className="w-full border rounded p-2"
                                                            disabled={user.role === 'student'}
                                                        >
                                                            {user.role === 'supervisor' && (
                                                                <>
                                                                    <option value="in_progress">In Progress</option>
                                                                    <option value="disapproved">Disapproved</option>
                                                                    <option value="approved">Approved</option>
                                                                </>
                                                            )}
                                                            {(user.role === 'graduate_program_assistant' || user.role === 'graduate_program_director') && (
                                                                <>
                                                                    <option value="disapproved">Disapproved</option>
                                                                    <option value="approved">Approved</option>
                                                                </>
                                                            )}
                                                        </select>
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => router.push(`/dashboard_staff/${userId}/feedback/${form.id}`)}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
                                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
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
                                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                            >
                                                                Submit to GPD
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
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

                {user?.role && (
                    <div className="mt-8">
                        <StaffSelect role={user.role} userId={userId} />
                    </div>
                )}
            </div>
        </div>
    );
}