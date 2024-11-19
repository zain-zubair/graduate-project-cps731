'use client'
import { redirect } from 'next/navigation'
export default function RegisterPage(){
    

    async function handleRegister(event){
        event.preventDefault();
        const email = event.formData.get("email");
        const password = event.formData.get("password");

        try{
            const response = await fetch("api/auth/register", {
                method: "POST",
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            })
            if(response.ok){
                console.log('ok');
            }

        }
        catch(error){
            console.log("Error: ", error);
        }

    }

    return(
        <>
            <h1>This is a Sign Up page</h1>
            <form onSubmit={handleRegister}>
                <input name="email" type="email" required/>
                <input name="password" type="password" required/>
                <button type="submit">Submit</button>
            </form>
        </>
    )
}