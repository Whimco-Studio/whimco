import type { Metadata } from "next";
import LegalPage from "../legal";

export const metadata: Metadata = {
	title: "Privacy Policy | Whimco",
	description: "Privacy Policy for Whimco and the Spotlight network.",
};

export default function PrivacyPage() {
	return (
		<LegalPage title="Privacy Policy" updated="July 20, 2026">
			<p>
				This policy describes what Whimco collects through the Spotlight
				Discord app and the whimco.com website, and what we do with it. The
				short version: we store what you share through Spotlight so we can
				broadcast and showcase it, we store your Discord ID to attribute it,
				and we sell nothing to anyone.
			</p>

			<h2>What we collect</h2>
			<ul>
				<li>
					<b>Shared creations:</b> when you post in a Spotlight-connected
					channel we store the message content, media attachments, your
					Discord user ID, and your username. Media is archived to private
					cloud storage (AWS S3) so broadcasts and the showcase keep
					working if the original message disappears.
				</li>
				<li>
					<b>Reactions:</b> hearts and flags on broadcast copies, with the
					reacting user&apos;s Discord ID, to rank and moderate content.
				</li>
				<li>
					<b>Claimed profiles:</b> if you claim your portfolio, we receive
					your Discord ID, username, and avatar via Discord OAuth (the
					&quot;identify&quot; scope — we cannot see your email, messages,
					or servers), plus whatever bio, links, and contact info you
					choose to add.
				</li>
				<li>
					<b>Operational logs:</b> standard server logs and delivery
					records needed to run the service.
				</li>
			</ul>

			<h2>How it&apos;s used</h2>
			<ul>
				<li>
					Broadcasting your creation to participating Discord servers and
					publishing it on the public showcase and your portfolio page.
				</li>
				<li>
					<b>Automated moderation:</b> media you share is scanned by AWS
					Rekognition before broadcast to block NSFW content. Content that
					fails is held for human review instead of being distributed.
				</li>
				<li>Attribution — your username appears with your work.</li>
			</ul>

			<h2>What&apos;s public</h2>
			<p>
				Content you share through Spotlight, your username, and any claimed
				profile fields are public — visible on participating Discord servers
				and on whimco.com. Do not put anything in a bio, link, or contact
				field you don&apos;t want published.
			</p>

			<h2>What we don&apos;t do</h2>
			<ul>
				<li>No selling or renting data. No advertising profiles.</li>
				<li>No reading of Discord messages outside connected channels.</li>
				<li>
					No third-party sharing beyond the processors that run the service
					(AWS for storage and moderation, our hosting provider).
				</li>
			</ul>

			<h2>Removal &amp; contact</h2>
			<ul>
				<li>
					Flag any broadcast copy with 🚩 or contact us on Discord to have
					content removed from the network and the showcase.
				</li>
				<li>
					To unpublish a claimed profile or delete its data, use the
					contact above — removal is honored promptly.
				</li>
			</ul>

			<p>
				We may update this policy as the service evolves; the date above
				reflects the latest revision. See also our{" "}
				<a href="/terms">Terms of Service</a>.
			</p>
		</LegalPage>
	);
}
