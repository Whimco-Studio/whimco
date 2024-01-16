"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
	const [showText, setShowText] = useState(false);

	useEffect(() => {
		// Start the text animation after 2s (assuming this is the duration of the image fade-in)
		const timer = setTimeout(() => {
			setShowText(true);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24 bg-custom-gradient">
			<div className="fade-in">
				<Image
					src="/White.png"
					alt="Whimco"
					width={500}
					height={100}
					layout="intrinsic"
				/>
			</div>

			{/* Temporarily render the text without the conditional */}
			<div className="typewriter">
				<h1 className="text-resize mt-2">Turning Whims Into Wonders</h1>
			</div>
		</main>
	);
}
