import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			keyframes: {
				"slide-right": {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(400%)" },
				},
			},
			animation: {
				"slide-right": "slide-right 2s ease-in-out infinite",
			},
			backgroundImage: {
				"custom-gradient":
					"linear-gradient(45deg, rgba(255,134,255,1) 0%, rgba(132,134,240,1) 50%, rgba(0,255,255,1) 100%)",

				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
};
export default config;
