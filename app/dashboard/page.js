'use client'
import { supabase } from '../../lib/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Dashboard(){
    const router = useRouter();
    const [user, setUser] = useState(null); //hold user object
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', program: '', degree: '', year: ''})
    useEffect(() =>{
        async function getUser(){
            const {data : {user}} = await supabase.auth.getUser();
            if (!user){
                setUser(null);
            } else{
                setUser(user);
            }
            setLoading(false);
        }
        getUser();
    }, [])

    async function handleSignOut(event){
        await supabase.auth.signOut();
        router.push('/auth');
    }

    function handleInputChange(event){
        const {name, value} = event.target;
        setFormData((prev) => ({ // dynamically change the formData with the spread of the prev property values & the single change [name]
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(event){
        event.preventDefault();
        try{
            const response = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    email: user.email
                })
            });
            if(!response.ok){
                throw new Error('Something went wrong');
            }
            const data = await response.json();
            console.log('Success: ', data);
        }
        catch(error){
            console.error('Error: ', error)
        }
    }

    if (loading) return <>Loading...</>

    return(
        user ? (
            <div className="p-4">
            <h1 className="text-2xl mb-4">Dashboard</h1>
            <p>Welcome {user.email}</p>
            <button 
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
                Sign Out
            </button>
            <form onSubmit={handleSubmit}>
                <label>Please enter your information:</label>
                <input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange}/>
                <input name="program" placeholder="Program" value={formData.program} onChange={handleInputChange}/>
                <input name="degree" placeholder="Degree" value={formData.degree} onChange={handleInputChange}/>
                <input name="year" placeholder="Year of Study" value={formData.year} onChange={handleInputChange}/>
                <button type="submit">Create Account</button>
            </form>
        </div>
        ) : (
        <div>
            <h1 className="text-2xl mb-4">Not Authorized</h1>
            <p>Please sign in to view the dashboard</p>
        </div>
        )
    )
}