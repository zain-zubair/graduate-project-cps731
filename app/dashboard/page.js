'use client'
import { supabase } from '../../lib/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', program: '', degree: '', year: '' });

    useEffect(() => {
        async function checkUserAndRedirect() {
            try {
                // Get authenticated user
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // Check if user exists in your users table
                const { data, error } = await supabase
                    .from('user')
                    .select('id')
                    .eq('email', user.email)
                    .single();

                if (error) {
                    console.error('Error checking user:', error);
                    setLoading(false);
                    return;
                }

                if (data) {
                    // User exists in the database, redirect to their dashboard
                    router.push(`/dashboard/${data.id}`);
                } else {
                    // User is authenticated but hasn't created an account yet
                    setUser(user);
                }
            } catch (error) {
                console.error('Error:', error);
            }
            setLoading(false);
        }

        checkUserAndRedirect();
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
            
            // After successful account creation, redirect to the user's dashboard
            router.push(`/dashboard/${data.id}`);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    if (loading) return <div className="p-4">Loading...</div>;

    if (!user) {
        return (
            <div className="p-4">
                <h1 className="text-2xl mb-4">Not Authorized</h1>
                <p>Please sign in to view the dashboard</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Complete Your Profile</h1>
            <p>Welcome {user.email}</p>
            <button 
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Sign Out
            </button>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Please enter your information:</label>
                    <input 
                        name="name" 
                        placeholder="Name" 
                        value={formData.name} 
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                    <input 
                        name="program" 
                        placeholder="Program" 
                        value={formData.program} 
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                    <input 
                        name="degree" 
                        placeholder="Degree" 
                        value={formData.degree} 
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                    <input 
                        name="year" 
                        placeholder="Year of Study" 
                        value={formData.year} 
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Create Account
                </button>
            </form>
        </div>
    );
}