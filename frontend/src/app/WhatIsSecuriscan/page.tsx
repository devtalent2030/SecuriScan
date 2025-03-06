import Image from "next/image";

export default function WhatIsSecuriscan() {



 	return (
		<div className=" justify-items-center min-h-screen w-full font-[family-name:var(--font-geist-sans)]">
			<main className="w-2/5 min-h-screen flex flex-col items-center text-black border bg-gray-400 dark:bg-gray-900 dark:border-slate-300 dark:text-white bg-gray-400 dark:bg-gray-800">
				<div className="min-h-screen w-full bg-gray-200 dark:bg-gray-800 bg-opacity-25 dark:bg-opacity-50 p-3">
					<div className="w-full p-8 pb-10 h-1/4 flex flex-col items-center text-black dark:text-white">
						<p className="w-full mx-auto items-center text-center">
							Securiscan scans website for basic vulnerbilities and produces a report on the results.
						</p>
					</div>
					<div className="w-full p-8 pb-20 h-1/4 flex flex-col items-center text-black dark:text-white">
						<h2 className="h-1/2">How does it work?</h2>
						<p className="w-full mx-auto items-center">
							
						</p>
					</div>
					<div className="w-full p-8 pb-20 h-1/4 flex flex-col items-center text-black dark:text-white">
						<h2 className="h-1/2">Will there be more scans added soon?</h2>
						<p className="w-full mx-auto items-center">
							
						</p>
					</div>
					<div className="w-full p-8 pb-20 h-1/4 flex flex-col items-center text-black dark:text-white">
						<h2 className="h-1/2">Will it harm the scanned website?</h2>
						<p className="w-full mx-auto items-center">
							
						</p>
					</div>
				</div>
			</main>
		</div>
  	);
}
