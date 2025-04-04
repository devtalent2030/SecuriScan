// code based on Flowbite navbar example: https://flowbite.com/docs/components/navbar/ 
"use client";
import Link from "next/link";

import ThemeSwitcher from "../components/ThemeSwitcher";
import { usePathname } from "next/navigation";
import {useEffect, useState} from "react";

export default function Header() {
    const pathname = usePathname();
    const [hidden, setHidden] = useState(true);
    let hide = true;

    function handleHide() {
        setHidden(!hidden)
    }

    useEffect(() => {
    }, [])
/*
"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-bold cursor-pointer">SecuriScan</span>
        </Link>
        <div className="space-x-6">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/reports">Reports</Link>
        </div>
      </div>
    </nav>
  );
}
*/
    return (
        <>
            <nav className="bg-gray-200 dark:bg-gray-800 p-4">
                <div className="flex flex-row items-center max-w-screen-xl ">
                    <Link href="/" className="flex items-center pr-4 pl-4 float-left">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap text-black dark:text-white">
                            Logo
                        </span>
                    </Link>
                    <Link href="/" className="flex float-left">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap text-black dark:text-white">
                            Securiscan
                        </span>
                    </Link>
                    <div className="max-w-7xl flex mx-auto space-x-6 float-right">
                        
                        <button data-collapse-toggle="navbar-default" type="button" 
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg 
                        md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 
                        dark:hover:bg-gray-700 dark:focus:ring-gray-600" 
                        aria-controls="navbar-default" 
                        aria-expanded="false"
                        onClick={handleHide}>
                            <span className="sr-only">Open main menu</span>
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                            </svg>
                        </button>
                        <div className={`${hidden == true ? 'hidden' : ''} w-full md:block md:w-auto" id="navbar-default`}>
                            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-900 rounded-lg
                            md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 
                            dark:border-orange-700">
                                <li>
                                    <Link href="/dashboard" className={`${pathname == '/dashboard' ? 'text-blue-500 dark:text-blue-400' : 'text-black dark:text-white'} 
                                    block py-2 px-3 rounded hover:bg-gray-100 
                                    md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0
                                    md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white 
                                    md:dark:hover:bg-transparent`}
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/reports" className={`${pathname == '/reports' ? 'text-blue-500 dark:text-blue-400' : 'text-black dark:text-white'} 
                                    block py-2 px-3 rounded hover:bg-gray-100 
                                    md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0
                                    md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white 
                                    md:dark:hover:bg-transparent`}
                                    >
                                        Reports
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/WhatIsSecuriscan" className={`${pathname == '/WhatIsSecuriscan' ? 'text-blue-500 dark:text-blue-400' : 'text-black dark:text-white'} 
                                    block py-2 px-3 rounded hover:bg-gray-100 
                                    md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0
                                    md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white 
                                    md:dark:hover:bg-transparent`}
                                    >
                                        What Is Securiscan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/help" className={`${pathname == '/help' ? 'text-blue-500 dark:text-blue-400' : 'text-black dark:text-white'} 
                                    block py-2 px-3 rounded hover:bg-gray-100 
                                    md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0
                                    md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white 
                                    md:dark:hover:bg-transparent`}
                                    >
                                        Help
                                    </Link>
                                </li>
                                <li>
                                    <ThemeSwitcher />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                    
                
            </nav>
        </>
    );
}

