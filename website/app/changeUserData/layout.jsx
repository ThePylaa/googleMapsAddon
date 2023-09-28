"use client"
import { getCookie } from "cookies-next";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

// This is the layout for the every page that requires the user to be signed in
// It checks if the user is signed in and then renders the children
// If the user is not signed in, it redirects to the notSignedIn page

export default function Handler(props){
    const router = useRouter()
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        (async () => {
            const valid = await getUser()
            if (!valid) {
                console.error("Not Authenticated")
                router.push('/notSignedIn')
                return
            }
            setIsSuccess(true)
        })();
    }, [router]);

    if (!isSuccess) {
        return <p>Loading...</p>
    }
    
    return(
        <main>
        {props.children}
        </main>
    )
}

async function getUser() {
    try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_IP + "/user/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                authorization: "bearer " + getCookie("access_token") 
            }, 
        })
        if (res.ok) {
          return (true)
        }else{
          return (false)
        }
    } catch (e) {
        console.error(e)
        return (false)
    }
  }  