"use client";
import {useTheme} from "next-themes";
import {useEffect, useState} from "react";

const Dropdown = ({title = "", children}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
  }, [show]);

  return (
      <div>
        <button id={`dropdown${title}`} data-dropdown-toggle="dropdown" 
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg 
            text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" 
            type="button"
            onClick={() => (setShow(!show))}>
            {title}
            <svg className="w-2.5 h-2.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
            </svg>
        </button>

        <div id={`dropdown${title}`} 
        className={`${show == false ? 'hidden' : ''} z-10 bg-gray-100 dark:bg-gray-700 divide-x divide-y divide-gray-100 rounded-lg shadow`}
        aria-labelledby={`dropdown${title}`}
        >
            {children}
        </div>

      </div>
  );
};

export default Dropdown;
