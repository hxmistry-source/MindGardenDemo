import Link from "next/link";

const links = [
  { href: "/home", label: "Garden" },
  { href: "/action", label: "Today's Action" },
  { href: "/stats", label: "Progress" },
];

export default function TopNav() {
  return (
    <nav className="mt-8 flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 transition hover:border-leaf/60 hover:text-ink"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
