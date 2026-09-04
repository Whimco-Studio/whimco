"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experiences", label: "Experiences" },
  { href: "/tools", label: "Tools" },
  { href: "/spotlight", label: "Spotlight" },
  // { href: "/admin", label: "Admin" },
];

// /lab/creator is deliberately absent from this list. It is a workbench
// that renders one creator's real portfolio four different ways, kept
// reachable by typing the URL and linked from nowhere, so it never
// appears in the nav on any build.

export default function GlassNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4">
      <div className="glass-nav-container">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`glass-nav-link ${isActive(link.href) ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
