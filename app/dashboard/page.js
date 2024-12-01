'use client'
import { supabase } from '../../lib/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Dashboard.css';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', program: '', degree: '', year: '' });

    useEffect(() => {
        async function checkUserAndRedirect() {
            try {
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
                
                console.log("Auth User:", authUser);
                
                if (authError || !authUser) {
                    console.log("No auth user found:", authError); 
                    setUser(null);
                    setLoading(false);
                    return;
                }
    
                const { data: dbUser, error: dbError } = await supabase
                    .from('user')
                    .select('id')
                    .eq('email', authUser.email)
                    .single();
    
                console.log("DB User:", dbUser); 
                console.log("DB Error:", dbError);
    
                if (dbUser) {
                    router.push(`/dashboard/${dbUser.id}`);
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
            console.log("Auth state changed:", event, session);
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    email: user.email
                })
            });
            
            if (!response.ok) {
                throw new Error('Something went wrong');
            }
            
            const data = await response.json();
            console.log('Success:', data);
            
            router.push(`/dashboard/${data.id}`);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    if (loading) return <div className="loading">Loading...</div>;

    if (!user) {
        return (
            <div className="container">
                <h1 className="error-title">Not Authorized</h1>
                <p className="error-message">Please sign in to view the dashboard</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <h1 className="title">Complete Your Profile</h1>
                <p className="welcome-text">Welcome {user.email}</p>
                
                <button 
                    onClick={handleSignOut}
                    className="sign-out-button"
                >
                    Sign Out
                </button>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label className="label">Please enter your information:</label>
                        <input 
                            name="name" 
                            placeholder="Name" 
                            value={formData.name} 
                            onChange={handleInputChange}
                            className="input"
                            required
                        />
                        <input 
                            name="program" 
                            placeholder="Program" 
                            value={formData.program} 
                            onChange={handleInputChange}
                            className="input"
                            required
                        />
                        <input 
                            name="degree" 
                            placeholder="Degree" 
                            value={formData.degree} 
                            onChange={handleInputChange}
                            className="input"
                            required
                        />
                        <input 
                            name="year" 
                            placeholder="Year of Study" 
                            value={formData.year} 
                            onChange={handleInputChange}
                            className="input"
                            required
                        />
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
    );
}