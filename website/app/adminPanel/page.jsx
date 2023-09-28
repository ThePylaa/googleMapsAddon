"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getCookie } from "cookies-next";


const UserPage = () => {
  const [deleteEmail, setDeleteEmail] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  
  // This function shows the delete user form
  function showDeleteUser() {
    if (document.getElementById("deleteUserChange").style.display == "block") {
      document.getElementById("deleteUserChange").style.display = "none";
      return;
    }
    if (document.getElementById("adminChange").style.display == "block") {
      document.getElementById("adminChange").style.display = "none";
    }
    document.getElementById("deleteUserChange").style.display = "block";
  }

  // This function shows the make admin form
  function showMakeAdmin() {
    if (document.getElementById("adminChange").style.display == "block") {
      document.getElementById("adminChange").style.display = "none";
      return;
    }
    if (document.getElementById("deleteUserChange").style.display == "block") {
      document.getElementById("deleteUserChange").style.display = "none";
    }
    document.getElementById("adminChange").style.display = "block";
  }

  // This function deletes a user
  async function deleteUser() {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_IP + "/admin/user", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            authorization: "bearer " + getCookie("access_token")
        },
        body: JSON.stringify({
          info: deleteEmail
        })
      })

      if (res.ok) {
        alert("User : " + deleteEmail + " deleted")
      }else{
        alert("User : " + deleteEmail + " could not be deleted")
      }
    } catch (e) {
      console.error(e)
      alert("User : \"" + deleteEmail + "\" could not be deleted")
    }
  }

  // This function makes a user an admin
  async function makeAdmin(state) {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_IP + "/admin/setAdmin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: "bearer " + getCookie("access_token") 
        }, 
        body: JSON.stringify({
          info: adminEmail,
          value: state
        })
      
    })
    if (res.ok) {
      alert("User : " + adminEmail + " is Admin: " + state)
    }else{
      alert("User : " + adminEmail + " could not change Admin status to: " + state)
    }
    } catch (e) {
      console.error("Set Admin failed:" + e)
    }
  }
  

  return (
    <div className="flex flex-row h-screen">
      <div className="p-4 bg-slate-600">
        <Link className="flex items-center" href="/">
          <Image
            className="transition duration-500 hover:rotate-90 mr-3"
            src="/logo.svg"
            alt="gMapsAddon Logo"
            width={50}
            height={50}
          />
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            gMapsAddon
          </span>
        </Link>
        <ul className="mt-6 text-center text-xl">
            <li className="mb-2 bg-slate-900 underline font-bold">
              Admin Panel
            </li>          
        </ul>
      </div>
      <main className="flex-auto">
        <div className="m-4">
          <button
            className="p-4 bg-slate-600 rounded-xl"
            onClick={showDeleteUser}
          >
            Delete User
          </button>
          <div
            id="deleteUserChange"
            className="hidden w-1/2 p-4 bg-slate-600 rounded-xl m-4"
          >
            <form>
              <div className="mb-8">
                <label
                  htmlFor="text"
                  className="mb-3 block text-sm font-medium text-dark dark:text-white"
                >
                  Username or Email of User
                </label>
                <input
                  type="text"
                  name="deleteEmail"
                  placeholder="Enter the User you want to delete"
                  className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  required
                  value={deleteEmail}
                  onChange={(v) => setDeleteEmail(v.target.value)}
                />
              </div>
            </form>
            <div className="container flex flex-col items-center">
              <button
                onClick={deleteUser}
                className="flex text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
        <div className="m-4">
          <button
            className="p-4 bg-slate-600 rounded-xl"
            onClick={showMakeAdmin}
          >
            Make Someone Admin
          </button>
          <div id="adminChange"
            className="w-1/2 p-4 m-4 bg-slate-600 rounded-xl hidden"> 
          <form>
            <div className="mb-8">
              <label
                htmlFor="text"
                className="mb-3 block text-sm font-medium text-dark dark:text-white"
              >
                Username or Email of User
              </label>
              <input
                type="text"
                name="adminEmail"
                placeholder="Enter the User you want to make admin"
                className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                required
                value={adminEmail}
                onChange={(v) => setAdminEmail(v.target.value)}
              />
            </div>
          </form>
          <div className="container flex flex-col items-center">
              <button
                onClick={()=>makeAdmin(true)}
                className="flex text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
              >
                Make Admin
              </button>
              <button
                onClick={()=>makeAdmin(false)}
                className="flex mt-6 text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
              >
                Remove Admin
              </button>
            </div>
          </div>
         
        </div>
      </main>
    </div>
  );
};

export default UserPage;
