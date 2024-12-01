import { supabase } from '@/lib/client';
import React, { useState, useEffect } from 'react';

export default function StaffSelect({ role, userId }) {
    const [assignees, setAssignees] = useState([]);
    const [assignedPeople, setAssignedPeople] = useState([]);
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssignedPeople = async (roleId) => {
        try {
            let query;
            switch (role) {
                case 'supervisor':
                    query = await supabase
                        .from('student_supervisor_relationship')
                        .select(`
                            student:student_id (
                                id,
                                studentUser:user!student_user_id_fkey (
                                    name,
                                    email
                                )
                            )
                        `)
                        .eq('supervisor_id', roleId)
                        .eq('status', 'active');
                    break;

                case 'graduate_program_assistant':
                    query = await supabase
                        .from('gpa_supervisor_relationship')
                        .select(`
                            supervisor:supervisor_id (
                                id,
                                supervisorUser:user!supervisor_user_id_fkey (
                                    name,
                                    email
                                )
                            )
                        `)
                        .eq('gpa_id', roleId)
                        .eq('status', 'active');
                    break;

                case 'graduate_program_director':
                    query = await supabase
                        .from('gpd_gpa_relationship')
                        .select(`
                            gpa:gpa_id (
                                id,
                                gpaUser:user!graduate_program_assistant_user_id_fkey (
                                    name,
                                    email
                                )
                            )
                        `)
                        .eq('gpd_id', roleId)
                        .eq('status', 'active');
                    break;
            }

            if (query.error) throw query.error;
            
            const assignedData = query.data.map(row => {
                const person = role === 'supervisor' ? row.student : 
                             role === 'graduate_program_assistant' ? row.supervisor : 
                             row.gpa;
                return {
                    id: person.id,
                    name: person.studentUser?.name || person.supervisorUser?.name || person.gpaUser?.name,
                    email: person.studentUser?.email || person.supervisorUser?.email || person.gpaUser?.email
                };
            });
            
            setAssignedPeople(assignedData);
            return assignedData.map(person => person.id);
        } catch (err) {
            console.error('Error fetching assigned people:', err);
            return [];
        }
    };

    const fetchAssignees = async () => {
        try {
            console.log('Fetching assignees for role:', role);
    
            let roleQuery;
            switch (role) {
                case 'supervisor':
                    roleQuery = await supabase
                        .from('supervisor')
                        .select('id')
                        .eq('user_id', userId)
                        .single();
                    break;
                case 'graduate_program_assistant':
                    roleQuery = await supabase
                        .from('graduate_program_assistant')
                        .select('id')
                        .eq('user_id', userId)
                        .single();
                    break;
                case 'graduate_program_director':
                    roleQuery = await supabase
                        .from('graduate_program_director')
                        .select('id')
                        .eq('user_id', userId)
                        .single();
                    break;
                default:
                    throw new Error('Invalid role');
            }
    
            if (roleQuery.error) throw roleQuery.error;
    
            const roleId = roleQuery.data.id;
            const assignedIds = await fetchAssignedPeople(roleId); // Capture assigned IDs
    
            let allAssigneeQuery;
            switch (role) {
                case 'supervisor':
                    allAssigneeQuery = await supabase
                        .from('student')
                        .select(`
                            id, 
                            studentUser:user!student_user_id_fkey (
                                name, 
                                email
                            )
                        `);
                    break;
                case 'graduate_program_assistant':
                    allAssigneeQuery = await supabase
                        .from('supervisor')
                        .select(`
                            id, 
                            supervisorUser:user!supervisor_user_id_fkey (
                                name, 
                                email
                            )
                        `);
                    break;
                case 'graduate_program_director':
                    allAssigneeQuery = await supabase
                        .from('graduate_program_assistant')
                        .select(`
                            id, 
                            gpaUser:user!graduate_program_assistant_user_id_fkey (
                                name, 
                                email
                            )
                        `);
                    break;
            }
    
            if (allAssigneeQuery.error) throw allAssigneeQuery.error;
    
            const allAssignees = allAssigneeQuery.data.map(item => ({
                id: item.id,
                user: {
                    name: item.studentUser?.name || item.supervisorUser?.name || item.gpaUser?.name,
                    email: item.studentUser?.email || item.supervisorUser?.email || item.gpaUser?.email
                }
            }));
    
            const unassignedAssignees = allAssignees.filter(assignee => !assignedIds.includes(assignee.id)); // Assigned IDs are now valid
    
            setAssignees(unassignedAssignees);
    
        } catch (err) {
            setError(err.message);
            console.error('Error in fetchAssignees:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignment = async () => {
        if (!selectedAssignee) return;

        try {
            const { data: roleData, error: roleError } = await supabase
                .from(role === 'supervisor' ? 'supervisor' :
                     role === 'graduate_program_assistant' ? 'graduate_program_assistant' :
                     'graduate_program_director')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (roleError) throw roleError;
            if (!roleData) throw new Error(`${role} record not found`);

            let insertQuery;
            switch (role) {
                case 'supervisor':
                    insertQuery = await supabase
                        .from('student_supervisor_relationship')
                        .insert({
                            supervisor_id: roleData.id,
                            student_id: selectedAssignee,
                            status: 'active'
                        });
                    break;

                case 'graduate_program_assistant':
                    insertQuery = await supabase
                        .from('gpa_supervisor_relationship')
                        .insert({
                            gpa_id: roleData.id,
                            supervisor_id: selectedAssignee,
                            status: 'active'
                        });
                    break;

                case 'graduate_program_director':
                    insertQuery = await supabase
                        .from('gpd_gpa_relationship')
                        .insert({
                            gpd_id: roleData.id,
                            gpa_id: selectedAssignee,
                            status: 'active'
                        });
                    break;
            }

            if (insertQuery.error) throw insertQuery.error;

            setSelectedAssignee('');
            await fetchAssignees();
            alert('Assignment successful!');
        } catch (err) {
            setError(err.message);
            alert('Failed to make assignment: ' + err.message);
        }
    };

    useEffect(() => {
        if (role && userId) {
            console.log('StaffSelect mounted with:', { role, userId });
            fetchAssignees();
        }
    }, [role, userId]);

    const getPromptText = () => {
        switch (role) {
            case 'supervisor':
                return 'Select a student to supervise:';
            case 'graduate_program_assistant':
                return 'Select a supervisor to assist:';
            case 'graduate_program_director':
                return 'Select a Graduate Program Assistant to oversee:';
            default:
                return 'Select an assignee:';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-500 rounded border border-red-200">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-lg font-medium">{getPromptText()}</h2>
                <div className="flex gap-4">
                    <select
                        value={selectedAssignee}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        className="flex-1 p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select...</option>
                        {assignees.map((assignee) => (
                            <option key={assignee.id} value={assignee.id}>
                                {assignee.user.name} ({assignee.user.email})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAssignment}
                        disabled={!selectedAssignee}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Assign
                    </button>
                </div>
            </div>

            {assignedPeople.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Currently Assigned:</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {assignedPeople.map((person) => (
                            <div key={person.id} className="flex justify-between items-center p-2 bg-white rounded shadow">
                                <div>
                                    <span className="font-medium">{person.name}</span>
                                    <span className="text-gray-500 ml-2">({person.email})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}