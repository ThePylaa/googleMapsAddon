"use client";

import { useState } from "react";
import { getCookie } from "cookies-next";
import HeaderNavBar from "components/header";

const UserPage = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [repeatNewEmail, setRepeatNewEmail] = useState("");

  // This function shows the change password form
  function showChangePwd() {
    if (document.getElementById("passwordChange").style.display == "block") {
      document.getElementById("passwordChange").style.display = "none";
      return;
    }
    if (document.getElementById("emailChange").style.display == "block") {
      document.getElementById("emailChange").style.display = "none";
    }
    document.getElementById("passwordChange").style.display = "block";
  }

  // This function shows the change email form
  function showChangeEmail() {
    if (document.getElementById("emailChange").style.display == "block") {
      document.getElementById("emailChange").style.display = "none";
      return;
    }
    if (document.getElementById("passwordChange").style.display == "block") {
      document.getElementById("passwordChange").style.display = "none";
    }
    document.getElementById("emailChange").style.display = "block";
  }

  // This function changes the password
  // It checks if the new password is valid
  // It checks if the new password matches the repeated new password
  // It sends the request to the server
  async function changePassword() {
    let validChange = true;
    if (newPassword != repeatNewPassword) {
      document.getElementById("noPasswordMatch").style.display = "block";
      validChange = false;
    } else {
      document.getElementById("noPasswordMatch").style.display = "none";
    }
    if (!newPassword.match(/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,}$/)) {
      document.getElementById("noPassword").style.display = "block";
      validChange = false;
    } else {
      document.getElementById("noPassword").style.display = "none";
    }
    if (!validChange) {
      return;
    }

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_IP + "/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: "bearer " + getCookie("access_token"),
        },
        body: JSON.stringify({
          password_old: password,
          password_new: newPassword,
        }),
      });
      if (res.ok) {
        alert("Password changed");
      }
    } catch (error) {
      alert("Old Email is false");
    }
  }

  // This function changes the email
  // It checks if the new email is valid
  // It checks if the new email matches the repeated new email
  // It sends the request to the server
  async function changeEmail() {
    let validChange = true;
    if (newEmail != repeatNewEmail) {
      document.getElementById("noEmailMatch").style.display = "block";
      validChange = false;
    } else {
      document.getElementById("noEmailMatch").style.display = "none";
    }
    if (
      (newEmail == "") |
      !newEmail.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      document.getElementById("noEmail").style.display = "block";
      validChange = false;
    } else {
      document.getElementById("noEmail").style.display = "none";
    }
    if (!validChange) {
      return;
    }

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_IP + "/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: "bearer " + getCookie("access_token"),
        },
        body: JSON.stringify({
          email_old: email,
          email_new: newEmail,
        }),
      });
      if (res.ok) {
        alert("Email changed");
      }
    } catch (error) {
      alert("Old Email is false");
    }
  }

  return (
    <main className="flex-auto">

      <header>
        <HeaderNavBar originPage="changeUserData" />
      </header>
        <div className="m-4">
          <button
            className="p-4 bg-slate-600 rounded-xl"
            onClick={showChangePwd}
          >
            Change Password
          </button>
          <div
            id="passwordChange"
            className="hidden w-1/2 p-4 bg-slate-600 rounded-xl m-4"
          >
            <form>
              <div className="mb-8">
                <label
                  htmlFor="password"
                  className="mb-3 block text-sm font-medium text-dark dark:text-white"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Your Old Password"
                  className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  required
                  value={password}
                  onChange={(v) => setPassword(v.target.value)}
                />
              </div>
              <div className="mb-8">
                <label
                  htmlFor="password"
                  className="mb-3 block text-sm font-medium text-dark dark:text-white"
                >
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Your New Password"
                  className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  required
                  value={newPassword}
                  onChange={(v) => setNewPassword(v.target.value)}
                />
              </div>
              <div id="noPassword" className="mb-8 hidden">
                <p className="mb-3 text-sm font-medium text-red-500">
                  Password has to contain:
                  <br />
                  -At least 8 characters
                  <br />
                  Password can contain:
                  <br />
                  -Characters A-Z, a-z
                  <br />
                  -Numbers
                  <br />
                  -Special Characters .!@#$%^&*()_+-={" "}
                </p>
              </div>
              <div id="noPasswordMatch" className="mb-8 hidden">
                <p className="mb-3 text-sm font-medium text-red-500">
                  Passwords don&apost match
                </p>
              </div>
              <div className="mb-8">
                <label
                  htmlFor="password"
                  className="mb-3 block text-sm font-medium text-dark dark:text-white"
                >
                  Repeat New Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Repeat Your New Password"
                  className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  required
                  value={repeatNewPassword}
                  onChange={(v) => setRepeatNewPassword(v.target.value)}
                />
              </div>
            </form>
            <div className="container flex flex-col items-center">
              <button
                onClick={changePassword}
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
            onClick={showChangeEmail}
          >
            Change Email
          </button>
          <div
            id="emailChange"
            className="w-1/2 p-4 m-4 bg-slate-600 rounded-xl hidden"
          >
            <form>
              <div className="mb-8">
                <label
                  htmlFor="email"
                  className="mb-3 block text-sm font-medium text-dark dark:text-white"
                >
                  Current Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Your Old Email"
                  className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  required
                  value={email}
                  onChange={(v) => setEmail(v.target.value)}
                />
              </div>
              <div className="mb-8">
                <label
                  htmlFor="email"
                  className="mb-3 block text-sm font-medium text-dark dark:text-white"
                >
                  New Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Your New Email"
                  className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  required
                  value={newEmail}
                  onChange={(v) => setNewEmail(v.target.value)}
                />
              </div>
              <div id="noEmail" className="mb-8 hidden">
                <p className="mb-3 text-sm font-medium text-red-500">
                  No Valid Email
                </p>
              </div>
              <div id="noEmailMatch" className="mb-8 hidden">
                <p className="mb-3 text-sm font-medium text-red-500">
                  Emails don&apost match
                </p>
              </div>
              <div className="mb-8">
                <label
                  htmlFor="email"
                  className="mb-3 block text-sm font-medium text-dark dark:text-white"
                >
                  Repeat New Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Repeat Your New Email"
                  className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  required
                  value={repeatNewEmail}
                  onChange={(v) => setRepeatNewEmail(v.target.value)}
                />
              </div>
            </form>
            <div className="container flex flex-col items-center">
              <button
                onClick={changeEmail}
                className="flex text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </main>
  );
};

export default UserPage;
