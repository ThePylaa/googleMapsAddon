"use client"
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import React from 'react'
import HeaderNavBar from "components/header";

// This is the page is the SignUp Page

const SignUpPage = () => {
  const router = useRouter()
  const standardInputFieldBackgroundColor = "#242B51"

  const [surname, setSurname] = useState("")
  const [forename, setForename] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")

  // This function signs up the user
  // It checks if the user has entered all the required information

  const handleSignUp = () => {
    let failedSignUp = false
    if (surname == "") {
      document.getElementById("surname").style.backgroundColor = "red"
      document.getElementById("noSurname").style.display = "block"
      failedSignUp = true
    }else{
      document.getElementById("surname").style.backgroundColor = standardInputFieldBackgroundColor
      document.getElementById("noSurname").style.display = "none"
    }
    if(forename == ""){
      document.getElementById("forename").style.backgroundColor = "red"
      document.getElementById("noForename").style.display = "block"
      failedSignUp = true
    }else{
      document.getElementById("forename").style.backgroundColor = standardInputFieldBackgroundColor 
      document.getElementById("noForename").style.display = "none"
    }
    if(username == ""){
      document.getElementById("username").style.backgroundColor = "red"
      document.getElementById("noUsername").style.display = "block"
      failedSignUp = true
    }else{
      document.getElementById("username").style.backgroundColor = standardInputFieldBackgroundColor
      document.getElementById("noUsername").style.display = "none"
    }
    if (email == "" | !email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      document.getElementById("email").style.backgroundColor = "red"
      document.getElementById("noEmail").style.display = "block"
      failedSignUp = true
    } else {
      document.getElementById("noEmail").style.display = "none"
      document.getElementById("email").style.backgroundColor = standardInputFieldBackgroundColor
    }
    if (!password.match(/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,}$/)) {
      document.getElementById("password").style.backgroundColor = "red"
      document.getElementById("repeatPassword").style.backgroundColor = "red"
      document.getElementById("noPassword").style.display = "block"
      failedSignUp = true
    } else if (password == "" | password != repeatPassword) {
      document.getElementById("password").style.backgroundColor = "red"
      document.getElementById("repeatPassword").style.backgroundColor = "red"
      document.getElementById("noPassword").style.display = "none"
      document.getElementById("noMatch").style.display = "block"
      failedSignUp = true
    } else {
      document.getElementById("password").style.backgroundColor = standardInputFieldBackgroundColor
      document.getElementById("repeatPassword").style.backgroundColor = standardInputFieldBackgroundColor
      document.getElementById("noPassword").style.display = "none"
      document.getElementById("noMatch").style.display = "none"
    }
    if (failedSignUp) {
      return
    }

    const url = process.env.NEXT_PUBLIC_API_IP + "/user/register"
    if (!url) {
      console.error("URL not found")
      return
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "email": email,
        "surname": surname,
        "forename": forename,
        "username": username,
        "password": password
      }),
    }).then(response => {
      if (response.ok) {
        const data = response.json();
        router.push("/signIn")
      } else {
        console.error('Sign-up failed:', response.status);
        document.getElementById("username").style.backgroundColor = "red"
        document.getElementById("email").style.backgroundColor = "red"
        document.getElementById("inUse").style.display = "block"
      }
    }).catch(rejected => {
      console.error("Connection rejected")
    });
  };


  return (
    <>
      <section className="relative overflow-hidden pb-16 md:pb-20 lg:pb-28">
        <header>
          <HeaderNavBar originPage="signUp"/>
        </header>
        <div className="-mx-4 flex items-center">
          <div className="relative mx-auto rounded-md bg-primary space-y-4 bg-opacity-5 py-10 px-6 dark:bg-dark sm:p-[60px]">
            <div className="flex place-content-center relative">
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
              Create your account
            </h3>
            <div id="formDiv">
              <form>
                
                <div className="mb-8">
                  <label
                    htmlFor="surname"
                    className="mb-3 block text-sm font-medium text-dark dark:text-white"
                  >
                    Your Surname
                  </label>
                  <input
                    type="text"
                    name="surname"
                    id="surname"
                    placeholder="Enter your Surname"
                    className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    required
                    value={surname}
                    onChange={(v) => setSurname(v.target.value)}
                  />
                </div>
                <div id="noSurname" className="mb-8 hidden">
                  <p className="mb-3 text-sm font-medium text-red-500">No Surname given</p>
                </div>
                <div className="mb-8">
                  <label
                    htmlFor="forename"
                    className="mb-3 block text-sm font-medium text-dark dark:text-white"
                  >
                    Your Forename
                  </label>
                  <input
                    type="text"
                    name="forename"
                    id="forename"
                    placeholder="Enter your Forename"
                    className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    required
                    value={forename}
                    onChange={(v) => setForename(v.target.value)}
                  />
                </div>
                <div id="noForename" className="mb-8 hidden">
                  <p className="mb-3 text-sm font-medium text-red-500">No Forename given</p>
                </div>
                <div className="mb-8 hidden" id="inUse" >
                <p className="mb-3 text-sm font-medium text-red-500">Email or Username already in Use</p>
                </div>
                <div className="mb-8">
                  <label
                    htmlFor="username"
                    className="mb-3 block text-sm font-medium text-dark dark:text-white"
                  >
                    Your Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Enter your Username"
                    className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    required
                    value={username}
                    onChange={(v) => setUsername(v.target.value)}
                  />
                </div>
                <div id="noUsername" className="mb-8 hidden">
                  <p className="mb-3 text-sm font-medium text-red-500">No Username given</p>
                </div>
                <div className="mb-8">
                  <label
                    htmlFor="email"
                    className="mb-3 block text-sm font-medium text-dark dark:text-white"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your Email"
                    className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    required
                    value={email}
                    onChange={(v) => setEmail(v.target.value)}
                  />
                </div>
                <div id="noEmail" className="mb-8 hidden">
                  <p className="mb-3 text-sm font-medium text-red-500">No Email given</p>
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
                    id="password"
                    placeholder="Enter your Password"
                    className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    required
                    value={password}
                    onChange={(v) => setPassword(v.target.value)}
                  />
                </div>
                <div id="noPassword" className="mb-8 hidden">
                  <p className="mb-3 text-sm font-medium text-red-500">
                  Password has to contain:
                  <br />-At least 8 characters
                  <br />Password can contain:
                  <br />-Characters A-Z, a-z
                  <br />-Numbers
                  <br />-Special Characters .!@#$%^&*()_+-= </p>
                </div>
                <div id="noMatch" className="mb-8 hidden">
                  <p className="mb-3 text-sm font-medium text-red-500">
                  Passwords don&apost match</p>
                </div>
                <div className="mb-8">
                  <label
                    htmlFor="repeatPassword"
                    className="mb-3 block text-sm font-medium text-dark dark:text-white"
                  >
                    Repeat Your Password
                  </label>
                  <input
                    type="password"
                    name="repeatPassword"
                    id="repeatPassword"
                    placeholder="Repeat your Password"
                    className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    required
                    value={repeatPassword}
                    onChange={(v) => setRepeatPassword(v.target.value)}
                  />
                </div>
              </form>
              <div className="container flex flex-col items-center">
                <button
                  onClick={handleSignUp}
                  className="flex text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
                >
                  Submit
                </button>
              </div>
              <div className="text-center pt-4 text-base font-medium text-body-color">
                Already hava an account?
              </div>
              <div className="text-center transition hover:scale-125 delay-100">
                <Link href="/signIn" className=" ext-primary font-black hover:underline cursor-pointer">
                  Sign in!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignUpPage;
