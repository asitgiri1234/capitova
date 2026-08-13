import type { Metadata } from "next";
import { Gloock, Inter, Instrument_Serif, Martian_Mono } from "next/font/google";
import { SITE } from "@/lib/constants";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Hud from "@/components/chrome/Hud";
import "./globals.css";

// Display tier. Gloock ships a single weight — never ask for 500+ or the
// browser synthesises a fake bold.
const gloock = Gloock({
  variable: "--font-gloock",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Body tier.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Chrome tier.
const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Retained only for the About accent words.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${gloock.variable} ${inter.variable} ${martianMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="bg-void text-bone antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-mint focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:tracking-widest focus:text-void focus:uppercase"
        >
          Skip to content
        </a>
        <noscript>
          <div className="container-page py-6 font-mono text-xs tracking-widest text-bone uppercase">
            CAPITOVA runs its motion and 3D layers with JavaScript. The full
            content of this page is available without it — only the animation
            is missing.
          </div>
        </noscript>

        <Hud />
        <SmoothScroll>
          <main id="main">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
