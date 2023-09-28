"use client"
import Link from "next/link";
import Image from 'next/image'
import { useState } from "react";
import { setCookie } from "cookies-next";
import { useRouter } from 'next/navigation';
import HeaderNavBar from "components/header";

// This is the page that is shown when the user is not signed in
const SigninPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  var detailsAdminUser = {
    'username': email,
    'password': password,
    'scope': "admin"

  }

  var detailsUser = {
    'username': email,
    'password': password,
    'scope': ['user']
  }

  var formBodyAdminAndUser = [];

  // This function converts the details object to a form body
  for (var property in detailsAdminUser) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(detailsAdminUser[property]);
    formBodyAdminAndUser.push(encodedKey + "=" + encodedValue);
  }
  formBodyAdminAndUser = formBodyAdminAndUser.join("&");

  var formBodyUser = [];
  for (var property in detailsUser) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(detailsUser[property]);
    formBodyUser.push(encodedKey + "=" + encodedValue);
  }
  formBodyUser = formBodyUser.join("&");

  // This function signs in the user
  const handleSignIn = async () => {
    const url = process.env.NEXT_PUBLIC_API_IP + "/user/signIn"
    if (!url) {
      console.error("URL not found")
      return
    }
        // Try Admin Scope Sign in
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: formBodyAdminAndUser
      });
  
      if (response.ok) {
        const data = await response.json()
        await setCookie('access_token', data.access_token, {sameSite:true})
        router.push('/changeUserData')
        return
      } 
    } catch (error) {
      console.error('Cant sign in:', error)
    }
    // Try User Scope Sign in
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: formBodyUser
      });
  
      if (response.ok) {
        const data = await response.json()
        await setCookie('access_token', data.access_token, {sameSite:true})
        router.push('/changeUserData')
        return
      } else {
        document.getElementById("notVaild").classList.remove("hidden")
      }
      return
    } catch (error) {
      console.error('Cant sign in:', error)
    }
  };

  return (
    <>
      <section className="relative overflow-hidden pb-16 md:pb-20 lg:pb-28">
        <header>
          <HeaderNavBar originPage="signIn"/>
        </header>
        <div className="-mx-4 flex items-center">
          <div className="mx-auto max-w-[500px] rounded-md bg-primary space-y-4 bg-opacity-5 py-10 px-6 dark:bg-dark sm:p-[60px]">
            <div className="flex place-content-center">
              <Link href='/'>
                <Image
                  className="transition duration-500 hover:rotate-90"
                  src="/logo.svg"
                  alt="gMapsAddon Logo"
                  width={50}
                  height={50}
                />
              </Link>
            </div>
            <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
              Sign in to your account
            </h3>
            <form>
              <div className="mb-8">
                <label
                  htmlFor="email"
                  className="mb-3 block text-sm font-medium text-dark dark:text-white"
                >
                  Your Email
                </label>
                <input
                  type="text"
                  name="email"
                  placeholder="Enter your Email"
                  className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  required
                  value={email}
                  onChange={(v) => setEmail(v.target.value)}
                />
              </div>
              <div className="mb-8">
                <label
                  htmlFor="password"
                  className="mb-3 block text-sm font-medium text-dark dark:text-white"
                >
                  Your Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your Password"
                  className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  required
                  value={password}
                  onChange={(v) => setPassword(v.target.value)}
                />
              </div>
              <div id="notVaild" className="mb-8 hidden">
                  <p className="mb-3 text-sm font-medium text-red-500">Login not valid!</p>
                </div>
            </form>
            <div className="container flex flex-col items-center">
                <button
                  onClick={handleSignIn}
                  className="flex text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
                >
                  Submit
                </button>
              </div>
            <div className="text-center pt-4 text-base font-medium text-body-color">
              Don&apost you have an account?
            </div>
            <div className="text-center transition hover:scale-125 delay-100">
              <Link href="/signUp" className=" ext-primary font-black hover:underline cursor-pointer">
                Sign up!
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SigninPage;
