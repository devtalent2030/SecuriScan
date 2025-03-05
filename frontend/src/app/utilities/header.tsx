// code based on Flowbite navbar example: https://flowbite.com/docs/components/navbar/ 
"use client";

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


    return (
        <>
            <nav className="bg-orange-500 dark:bg-orange-900 border border-gray-900 dark:border-slate-300">
                <div className="flex flex-row">
                    <a href="/" className="flex items-center pr-8 pl-8">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap text-black dark:text-white">
                            Logo
                        </span>
                    </a>
                    <div className="max-w-screen-xl flex flex-wrap items-center justify-between  p-4 ">
                        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                            <span className="self-center text-2xl font-semibold whitespace-nowrap text-black dark:text-white">
                                Securiscan
                            </span>
                        </a>
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
                            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-900 rounded-lg bg-orange-500 dark:bg-orange-900 
                            md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-orange-500 dark:bg-orange-800 md:dark:bg-orange-900 
                            dark:border-orange-700">
                                <li>
                                    <a href="/" className={`${pathname == '/' ? 'text-blue-500 dark:text-blue-400' : 'text-black dark:text-white'} 
                                    block py-2 px-3 rounded hover:bg-gray-100 
                                    md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0
                                    md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white 
                                    md:dark:hover:bg-transparent`}
                                    >
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a href="/WhatIsSecuriscan" className={`${pathname == '/WhatIsSecuriscan' ? 'text-blue-500 dark:text-blue-400' : 'text-black dark:text-white'} 
                                    block py-2 px-3 rounded hover:bg-gray-100 
                                    md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0
                                    md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white 
                                    md:dark:hover:bg-transparent`}
                                    >
                                        What Is Securiscan
                                    </a>
                                </li>
                                <li>
                                    <a href="/help" className={`${pathname == '/help' ? 'text-blue-500 dark:text-blue-400' : 'text-black dark:text-white'} 
                                    block py-2 px-3 rounded hover:bg-gray-100 
                                    md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0
                                    md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white 
                                    md:dark:hover:bg-transparent`}
                                    >
                                        Help
                                    </a>
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

