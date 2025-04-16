"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ExplorePanel from "../components/explore-panel";
import LoginIn from "../components/login-in";
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/20/solid'


export default function Login() {

	// return <ExplorePanel/>;
	return <div className="bg-custom-gradient flex justify-center items-center h-screen">
		<LoginIn/>
	</div>
}
