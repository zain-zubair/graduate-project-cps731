'use client';

import { supabase } from '../../../lib/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function UserDashboard({ params }) {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [supervisorInfo, setSupervisorInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Unwrap `params` with `React.use()`
    const unwrappedParams = React.use(params);
    const { id } = unwrappedParams || {};

    useEffect(() => {
        if (id) {
            setUserId(id);
        }
    }, [id]);

    useEffect(() => {
        async function fetchUserData() {
            if (!userId) return;

            try {
                // Check if user is authenticated
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (!authUser) {
                    router.push('/auth');
                    return;
                }

                // Fetch user and student data
                const { data: userData, error: userError } = await supabase
                    .from('user')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (userError || !userData) {
                    console.error('Error fetching user:', userError);
                    router.push('/dashboard');
                    return;
                }

                // Ensure the authenticated user can only view their own data
                if (userData.email !== authUser.email) {
                    router.push('/dashboard');
                    return;
                }

                const { data: studentData, error: studentError } = await supabase
                    .from('student')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (studentError) {
                    console.error('Error fetching student:', studentError);
                }

                // Fetch supervisor data if available
                if (studentData) {
                    const { data: supervisorRelation, error: relationError } = await supabase
                        .from('student_supervisor_relationship')
                        .select(`
                            supervisor:supervisor_id (
                                id,
                                user_id,
                                department,
                                user:user_id (
                                    name,
                                    email
                                )
                            )
                        `)
                        .eq('student_id', studentData.id)
                        .single();

                    if (!relationError && supervisorRelation) {
                        setSupervisorInfo(supervisorRelation.supervisor);
                    }
                }

                setUser(userData);
                setStudentData(studentData);
            } catch (error) {
                console.error('Error:', error);
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

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Student Dashboard</h1>
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
                    </div>
                </div>
                {studentData && (
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Academic Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600">Program</p>
                                    <p className="font-medium">{studentData.program}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Degree</p>
                                    <p className="font-medium">{studentData.degree}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Year of Study</p>
                                    <p className="font-medium">{studentData.year_of_study}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Supervisor Information</h2>
                            {supervisorInfo ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600">Supervisor Name</p>
                                        <p className="font-medium">{supervisorInfo.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Supervisor Email</p>
                                        <p className="font-medium">{supervisorInfo.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Department</p>
                                        <p className="font-medium">{supervisorInfo.department}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No supervisor assigned yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
