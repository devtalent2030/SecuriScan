"use client";
import Image from "next/image";
import {useEffect, useState} from "react";
import Dropdown from "../components/Dropdown";

export default function help() {

 	return (
		<div className=" justify-items-center min-h-screen w-full font-[family-name:var(--font-geist-sans)]">
			<main className="w-2/5 min-h-screen flex flex-col items-center text-black border border-gray-900 dark:border-slate-300 dark:text-white bg-orange-500 dark:bg-orange-900">
				<div className="min-h-screen w-full bg-gray-600 dark:bg-gray-900 bg-opacity-25 dark:bg-opacity-50 p-3">
					
					<Dropdown title="SQLInjection">
					aaaaaaaaa
					</Dropdown>
					
					<Dropdown title="Cralwer">
					aaaaaaaaa
					</Dropdown>
					
					<Dropdown title="XSS">
					aaaaaaaaa
					</Dropdown>
				</div>
			</main>
		</div>
  	);
}
