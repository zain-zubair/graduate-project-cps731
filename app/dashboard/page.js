'use client'
import { supabase } from '../../lib/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Dashboard(){
    const router = useRouter();
    const [user, setUser] = useState(null); //hold user object
    const [loading, setLoading] = useState(true);
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
        </div>
        ) : (
        <div>
            <h1 className="text-2xl mb-4">Not Authorized</h1>
            <p>Please sign in to view the dashboard</p>
        </div>
        )
    )
}