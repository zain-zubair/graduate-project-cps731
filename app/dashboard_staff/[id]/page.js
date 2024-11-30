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

                // Log user data for debugging
                console.log('Fetched user data:', userData);

                // Ensure the authenticated user matches the requested user
                if (userData.email !== authUser.email) {
                    console.error('User email mismatch. Unauthorized access.');
                    router.push('/auth');
                    return;
                }

                setUser(userData);

                // Debug log for role
                console.log('User role:', userData.role);

                // Map roles to staff tables using full names
                const staffTableMap = {
                    'supervisor': 'supervisor',
                    'graduate_program_assistant': 'graduate_program_assistant',
                    'graduate_program_director': 'graduate_program_director'
                };

                // Debug log for staff table mapping
                console.log('Looking up staff table for role:', userData.role);
                console.log('Available mappings:', staffTableMap);

                const staffTable = staffTableMap[userData.role];
                if (!staffTable) {
                    console.error(`Invalid staff role: ${userData.role}`);
                    console.error('Valid roles are:', Object.keys(staffTableMap));
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
                    console.log('Staff data:', staffData);
                    setStaffData(staffData);
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
        
        console.log('Getting title for role:', role);
        console.log('Available titles:', roleTitles);
        
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
                {user?.role && (
                    <div className="mt-8">
                        <StaffSelect role={user.role} userId={userId} />
                    </div>
                )}
            </div>
        </div>
    );
}