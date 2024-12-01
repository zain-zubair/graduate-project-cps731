'use client'
import { supabase } from '../../lib/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Dashboard.css'

export default function DashboardStaff() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [staffData, setStaffData] = useState({ name: '', department: '', role: '' });

    useEffect(() => {
        async function checkUserAndRedirect() {
            try {
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
                
                if (authError || !authUser) {
                    setUser(null);
                    setLoading(false);
                    return;
                }
    
                const { data: dbUser, error: dbError } = await supabase
                    .from('user')
                    .select('id')
                    .eq('email', authUser.email)
                    .single();
    
                if (dbUser) {
                    router.push(`/dashboard_staff/${dbUser.id}`);
                } else {
                    setUser(authUser);
                }
            } catch (error) {
                console.error('Error in checkUserAndRedirect:', error);
            }
            setLoading(false);
        }
    
        checkUserAndRedirect();
        
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                checkUserAndRedirect();
            }
        });
    
        return () => {
            subscription?.unsubscribe();
        };
    }, [router]);

    async function handleSignOut(event) {
        await supabase.auth.signOut();
        router.push('/auth');
    }

    function handleInputChange(event) {
        const { name, value } = event.target;
        setStaffData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...staffData,
                    email: user.email
                })
            });
            
            if (!response.ok) {
                throw new Error('Something went wrong');
            }
            
            const data = await response.json();
            router.push(`/dashboard_staff/${data.id}`);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    if (loading) return <div className="loading-state">Loading...</div>;

    if (!user) {
        return (
            <div className="error-state">
                <h1>Not Authorized</h1>
                <p>Please sign in to view the dashboard</p>
            </div>
        );
    }
    
    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Complete Your Profile</h1>
                    <button 
                        onClick={handleSignOut}
                        className="sign-out-button"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="profile-form">
                    <p className="welcome-message">Welcome {user.email}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="form-label">Please enter your information:</label>
                            <input 
                                type="text"
                                name="name" 
                                placeholder="Name" 
                                value={staffData.name} 
                                onChange={handleInputChange}
                            />
                            <input 
                                type="text"
                                name="department" 
                                placeholder="Department" 
                                value={staffData.department} 
                                onChange={handleInputChange}
                            />
                            <select 
                                name="role" 
                                value={staffData.role}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Role</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="graduateprogramassistant">Graduate Program Assistant</option>
                                <option value="graduateprogramdirector">Graduate Program Director</option>
                            </select>
                        </div>
                        <button 
                            type="submit"
                            className="submit-button"
                        >
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}