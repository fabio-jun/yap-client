const LINKS = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Ads info", href: "/ads" },
  { label: "More...", href: "#" },
];

export default function SidebarFooter() {
  return (
    <div className="px-1 pt-1 text-[11px] leading-relaxed text-base-content/24">
      {LINKS.map((link, i) => (
        <span key={i}>
          <a href={link.href} className="transition-colors hover:text-primary">
            {link.label}
          </a>
          {i < LINKS.length - 1 && <span className="mx-1.5">&middot;</span>}
        </span>
      ))}
      <p className="mt-1.5">&copy; 2026 Yap, Inc.</p>
    </div>
  );
}
