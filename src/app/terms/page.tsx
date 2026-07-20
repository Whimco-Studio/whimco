import type { Metadata } from "next";
import LegalPage from "../legal";

export const metadata: Metadata = {
	title: "Terms of Service | Whimco",
	description: "Terms of Service for Whimco and the Spotlight network.",
};

export default function TermsPage() {
	return (
		<LegalPage title="Terms of Service" updated="July 20, 2026">
			<p>
				These terms cover the Whimco website (whimco.com) and the Spotlight
				service — the Discord app that broadcasts creations across partner
				servers and publishes them to the public showcase and creator
				portfolios. By using either, you agree to these terms.
			</p>

			<h2>What Spotlight does</h2>
			<p>
				When you share a creation in a Spotlight-connected channel, you are
				asking Spotlight to redistribute it: your post (content, media, and
				your Discord username) is rebroadcast to other participating Discord
				servers and may be published on the public showcase at
				whimco.com/spotlight and on your creator portfolio page. If you do
				not want a creation redistributed, do not post it in a
				Spotlight-connected channel.
			</p>

			<h2>Your content</h2>
			<ul>
				<li>
					You keep all rights to what you create. By sharing through
					Spotlight you grant Whimco a non-exclusive license to store,
					moderate, redistribute, and publicly display that content through
					the Spotlight network and the whimco.com showcase.
				</li>
				<li>Only share work you have the right to share.</li>
				<li>
					To have content removed, flag it with the 🚩 reaction on any
					broadcast copy, or contact us on Discord — removal requests are
					honored across the network and the showcase.
				</li>
			</ul>

			<h2>Acceptable use</h2>
			<ul>
				<li>
					No illegal content, NSFW content, harassment, impersonation, or
					spam. Automated moderation reviews media before broadcast, and
					anything can be removed after the fact.
				</li>
				<li>
					Repeated violations lead to a network-wide ban of your account.
				</li>
			</ul>

			<h2>Claimed portfolios</h2>
			<ul>
				<li>
					Claiming a portfolio requires signing in with Discord; it proves
					you own the Discord account the work was shared from.
				</li>
				<li>
					Profile fields you add (bio, links, contact) are public. You are
					responsible for what you publish there, including complying with
					the laws that apply to you in your country — for example,
					disclosure obligations that may apply if you promote commercial
					services.
				</li>
				<li>
					We may hide profiles or portfolios that violate these terms.
				</li>
			</ul>

			<h2>The service</h2>
			<ul>
				<li>
					Spotlight and the showcase are provided as-is, without warranty.
					We may change, suspend, or discontinue features at any time.
				</li>
				<li>
					We may update these terms; continued use after an update means
					you accept the revised terms.
				</li>
			</ul>

			<p>
				Questions? Reach us on Discord — The_Pr0fessor — or through any
				Spotlight-connected server. See also our{" "}
				<a href="/privacy">Privacy Policy</a>.
			</p>
		</LegalPage>
	);
}
