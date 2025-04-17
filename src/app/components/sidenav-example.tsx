import Image from "next/image";
import React from "react";

export default function SidenavTest() {
	return (
		<aside
			className="p-3 fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200  bg-white border-0 shadow-xl dark:shadow-none dark:bg-slate-850 max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0"
			// className="fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200 -translate-x-full bg-white border-0 shadow-xl dark:shadow-none dark:bg-slate-850 max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0"
		>
			<div className="w-full h-auto flex items-center space-x-3 pb-2 justify-center ">
				<Image
					className="rounded-lg"
					src="/branding/Icon - White on Black BG.png"
					alt="logo"
					width={40}
					height={40}
				/>
				<Image
					className=""
					src="/branding/Whimco Black Rectangle.png"
					alt="logo"
					width={100}
					// width={125}
					height={40}
				/>
				{/* <p className="text-black text-xl font-bold">Whimco</p> */}
			</div>

			<div className="relative">
				<div aria-hidden="true" className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-gray-300" />
				</div>
				<div className="relative flex justify-center">
					<span className="bg-white px-2 text-sm text-gray-500">Home</span>
				</div>
			</div>
		</aside>
	);
}
