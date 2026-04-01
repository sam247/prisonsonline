import Image from "next/image";
import { TrackedInlineLink } from "@/components/analytics/TrackedInlineLink";

const footerLinks = [
  {
    title: "Directory",
    links: [
      { label: "Prison Finder", href: "/prisons" },
      { label: "UK Prisons", href: "/prisons/uk" },
      { label: "US Prisons", href: "/prisons/united-states" },
      { label: "Global Directory", href: "/prisons" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Prison Guides", href: "/guides" },
      { label: "How Visits Work", href: "/guides/how-prison-visits-work" },
      { label: "Prison Sentences", href: "/guides/how-prison-sentences-work" },
      { label: "Articles", href: "/articles" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy Policy", href: "/about" },
      { label: "Contact", href: "/about" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-icon.png" alt="Prisons Online" width={32} height={32} className="h-8 w-auto" />
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              A global prison directory and information resource. Find prison information, learn about prison systems, and access guides for families.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-sm mb-4 text-primary-foreground/90">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <TrackedInlineLink
                      href={link.href}
                      itemId={link.href}
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </TrackedInlineLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <p className="text-sm text-primary-foreground/50 text-center">
            © {new Date().getFullYear()} Prisons Online. All rights reserved. Information is provided for educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
