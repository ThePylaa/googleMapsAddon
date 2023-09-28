"use client";
import HeaderNavBar from "components/header";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SigninPage = () => {
  const router = useRouter();
  function handleSignIn() {
    router.push("/signIn");
  }
  function handleHomePage() {
    router.push("/");
  }

  return (
    <>
      <section className="relative overflow-hidden pb-16 md:pb-20 lg:pb-28">
        <header>
          <HeaderNavBar originPage="notSignedIn" />
        </header>
        <div className="-mx-4 flex items-center">
          <div className="mx-auto max-w-[500px] rounded-md bg-primary space-y-4 bg-opacity-5 py-10 px-6 dark:bg-dark sm:p-[60px]">
            <div className="flex place-content-center">
              <Link href="/">
                <Image
                  className="transition duration-500 hover:rotate-90"
                  src="/logo.svg"
                  alt="gMapsAddon Logo"
                  width={50}
                  height={50}
                />
              </Link>
            </div>
            <h3 className="mb-3 text-center underline text-2xl font-bold text-black dark:text-white sm:text-3xl">
              You successfully signed out!
            </h3>
            <div className="text-center text-base font-medium text-body-color">
              Sign in again:
            </div>
            <div className="container flex flex-col items-center">
              <button
                onClick={handleSignIn}
                className="flex text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
              >
                Sign In
              </button>
            </div>
            <div className="text-center text-base font-medium text-body-color">
              Go to Home Page:
            </div>
            <div className="container flex flex-col items-center">
              <button
                onClick={handleHomePage}
                className="flex text-center hover:underline bg-blue-500 px-8 py-4 font-bold text-white duration-300 ease-in-out hover:bg-opacity-80 rounded-full transition hover:scale-125 delay-100 cursor-pointer"
              >
                Home Page
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SigninPage;