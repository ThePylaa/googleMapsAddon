import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

// This is the header for the website
// It is used in every page
// It checks if the user is signed in and then renders the correct buttons
// If the user is not signed in, it renders the sign in and sign up buttons
function HeaderNavBar({ originPage }) {
  const router = useRouter();
  var currentPage = originPage;

  function setVisible(id) {
    document.getElementById(id).style.display = "block";
  }

  function setInvisible(id) {
    document.getElementById(id).style.display = "none";
  }

  useEffect(() => {
    modifyHeader();
    (async () => {
      const validUser = await getUser();
      const validAdmin = await getAdmin();
      if (validAdmin) {
        setVisible("adminPanel");
        setVisible("logout");
        setInvisible("signIn");
        setInvisible("signUp");
      } else if (validUser) {
        setVisible("changeUserData");
        setVisible("logout");
        setInvisible("signIn");
        setInvisible("signUp");
        return;
      }
    })();
  });

  function modifyHeader() {
    if (currentPage == "home") {
      setVisible("signIn");
      setVisible("signUp");
    } else if (currentPage == "signIn") {
      setVisible("home");
      setVisible("signUp");
    } else if (currentPage == "signUp") {
      setVisible("home");
      setVisible("signIn");
    } else if (currentPage == "notSignedIn") {
      setVisible("home");
      setVisible("signIn");
      setVisible("signUp");
    } else if (currentPage == "changeUserData") {
      setVisible("home");
      setVisible("logout");
    } else if (currentPage == "adminPanel") {
      setVisible("home");
      setVisible("logout");
    }
  }

  async function getUser() {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_IP + "/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: "bearer " + getCookie("access_token"),
        },
      });
      if (res.ok) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  async function getAdmin() {
    try{
      const res = await fetch(process.env.NEXT_PUBLIC_API_IP + "/admin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: "bearer " + getCookie("access_token"),
        },
      });
      if (res.ok) {
        return true;
      } else {
        return false;
      }
    }
    catch(e){
      return false;
    }
  }

  function logout() {
    deleteCookie("access_token");
    router.push("/logout");
  }

  return (
    <nav className="border-gray-200 px-4 lg:px-6 py-2.5 bg-gray-800">
      <div className="flex flex-wrap justify-between">
        <Link className="flex items-center" href="/">
          <Image
            className="transition duration-500 hover:rotate-90 mr-3"
            src="/logo.svg"
            alt="gMapsAddon Logo"
            width={50}
            height={50}
          />
          <span className="self-center text-xl font-semibold whitespace-nowrap text-white">
            gMapsAddon
          </span>
        </Link>
        <div className="flex items-center">
          <ul className="flex mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            <li id="home" className="hidden">
              <a
                href="/"
                className="flex items-center pr-4 lg:border-0 lg:hover:text-primary-700 text-gray-400 lg:hover:text-white hover:bg-gray-700 hover:text-white lg:hover:bg-transparent border-gray-700"
              >
                Home
              </a>
            </li>
            <li id="changeUserData" className="hidden">
              <a
                href="/changeUserData"
                className="flex pr-4 lg:border-0 lg:hover:text-primary-700 text-gray-400 lg:hover:text-white hover:bg-gray-700 hover:text-white lg:hover:bg-transparent border-gray-700"
              >
                User Page
              </a>
            </li>
            <li id="signUp" className="hidden">
              <a
                href="/signUp"
                className="flex items-center pr-4 lg:border-0 lg:hover:text-primary-700 text-gray-400 lg:hover:text-white hover:bg-gray-700 hover:text-white lg:hover:bg-transparent border-gray-700"
              >
                Register
              </a>
            </li>
            <li id="signIn" className="hidden">
              <a
                href="/signIn"
                className="flex items-center pr-4 lg:border-0 lg:hover:text-primary-700 text-gray-400 lg:hover:text-white hover:bg-gray-700 hover:text-white lg:hover:bg-transparent border-gray-700"
              >
                Sign In
              </a>
            </li>
            <li id="logout" className="hidden">
              <button
                onClick={logout}
                className="flex items-center pr-4 lg:border-0 lg:hover:text-primary-700 text-gray-400 lg:hover:text-white hover:bg-gray-700 hover:text-white lg:hover:bg-transparent border-gray-700"
              >
                Logout
              </button>
            </li>
            <li id="adminPanel" className="hidden">
              <a
                href="/adminPanel"
                className="flex items-center pr-4 lg:border-0 lg:hover:text-primary-700 text-gray-400 lg:hover:text-white hover:bg-gray-700 hover:text-white lg:hover:bg-transparent border-gray-700"
              >
                Admin Panel
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default HeaderNavBar;
