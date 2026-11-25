import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Inter, JetBrains_Mono, Lexend, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SessionSync from "@/components/SessionSync";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const lexend = Lexend({ subsets: ["latin"], variable: "--font-reading" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["italic"],
  variable: "--font-serif-signature",
});

export const metadata: Metadata = {
  title: "Dassah's Prism Engine | Prism Focus, Play, Forge & Word",
  description: "Dassah's Prism Engine powered by The Prism Engine. Refract dense documents in Prism Focus, turn study dread into play in Prism Play, melt scary tech & formula jargon in Prism Forge, and reflect deeply in Prism Word.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dassahs-prism.vercel.app"),
  alternates: {
    canonical: "https://dassahs-prism.vercel.app",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  verification: {
    google: [
      "e6jGjBArh4BltMG2MGWLqlH9-b8-sRuEfMF_dyceQ4w",
      "YEfuEJS5zA9GRMvseo0Dp0HU70i_1fJdsXf0kmLuMQ0",
    ],
  },
  openGraph: {
    title: "Dassah's Prism Engine | Prism Focus, Play, Forge & Word",
    description: "Built for how your brain actually works — Prism Focus, Prism Play, Prism Forge, and Prism Word.",
    url: "https://dassahs-prism.vercel.app",
    siteName: "Dassah's Prism Engine",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Dassah's Prism Engine",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dassah's Prism Engine",
    description: "Refract the Noise. Unlock Your Mind. Powered by The Prism Engine.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${lexend.variable} ${jetbrainsMono.variable} ${cormorant.variable} h-full antialiased`}>
      <body className={`${inter.className} h-full`}>
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-P9WZRQB6"
          strategy="afterInteractive"
        />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GTM-P9WZRQB6');
          `}
        </Script>
        <SessionSync />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
