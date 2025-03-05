import Image from "next/image";
import Dropdown from "./components/Dropdown";

export default function Home() {

 	return (
		<div className=" justify-items-center min-h-screen w-full font-[family-name:var(--font-geist-sans)]">
			<main className="w-2/5 min-h-screen flex flex-col items-center text-black border border-gray-900 dark:border-slate-300 dark:text-white bg-orange-500 dark:bg-orange-900">
				<div className="min-h-screen w-full bg-gray-600 dark:bg-gray-900 bg-opacity-25 dark:bg-opacity-50 p-3">
					<div className="w-full p-8 pb-20 h-1/4 flex flex-col items-center text-black dark:text-white">
						<h2 className="text-center h-1/2">Scan websites for basic vulnerbilities.</h2>
					</div>
					<Dropdown title="Scans">
						<ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownScan">
							<li>
								<div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
									<input defaultChecked id="checkbox-item-crawler" type="checkbox" 
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
									<label htmlFor="checkbox-item-crawler" 
									className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">
										Crawler
									</label>
								</div>
							</li>
							<li>
								<div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
									<input id="checkbox-item-crawler" type="checkbox" 
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
									<label htmlFor="checkbox-item-SQLInjection" 
									className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">
										SQL Injection
									</label>
								</div>
							</li>
							<li>
								<div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
									<input id="checkbox-item-XSS" type="checkbox" 
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
									<label htmlFor="checkbox-item-XSS" 
									className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">
										XSS
									</label>
								</div>
							</li>
						</ul>
					</Dropdown>
					<div className="w-full p-2 h-1/4 flex flex-row items-center sm:items-start text-black dark:text-white border-slate-300 border border-gray-900 rounded-lg bg-orange-500 dark:bg-orange-900">
						<input type="url" placeholder="Enter website URL here"
						className="w-3/4 p-3 h-3/4 flex border-slate-300 border border-gray-900 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"/>
						<button className="size-12 pl-3 flex border-slate-300 border border-gray-900 rounded-lg bg-gray-200 dark:bg-gray-700"/>
					</div>
					<div className="w-full mx-auto p-5 h-1/4 flex items-center sm:items-start text-black dark:text-white border-slate-300 border border-gray-900 rounded-lg bg-orange-500 dark:bg-orange-900">
						<p className="w-full mx-auto items-center text-center">
							The report will start here &darr;
						</p>
					</div>
				</div>
			</main>
		</div>
  	);
}
