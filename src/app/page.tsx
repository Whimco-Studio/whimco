import Image from "next/image";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24 bg-custom-gradient">
			{/* Centered image container */}
			<div className="flex justify-center items-center w-full max-w-screen-xl mx-auto">
				<Image
					src="/White.png"
					alt="Whimco"
					width={500}
					height={100}
					layout="intrinsic"
				/>
			</div>

			<h1 className="text-resize mt-2">Turning Whims Into Wonders</h1>
		</main>
	);
}

{
	/* <h1 className="text-resize mt-20">Turning Whims into Wonders</h1> */
}
