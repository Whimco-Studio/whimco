"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ExplorePanel from "../components/explore-panel";

import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/20/solid'
import Sidenav from "../components/sidenav";
import Navbar from "../components/navbar";


export default function Admin() {
	const [showText, setShowText] = useState(false);

	useEffect(() => {
		// Start the text animation after 2s (assuming this is the duration of the image fade-in)
		const timer = setTimeout(() => {
			setShowText(true);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);


	// return <ExplorePanel/>;
	return (
		<main className="m-0 font-sans text-base antialiased font-normal leading-default text-slate-500 h-screen bg-gray-50 ">
			<div className="absolute w-full bg-custom-gradient min-h-72"/>
			<Navbar/>
			<Sidenav/>

		</main>
	);
}
