import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StaysAfrica - never miss a booking because you couldn't pick up",
  description:
    "StaysAfrica is the AI receptionist for South African guest houses, lodges and B&Bs. Answers every call in two seconds, books the room, WhatsApps you the details, and follows up so enquiries don't go cold.",
  openGraph: {
    title: "StaysAfrica - every call answered",
    description:
      "The AI receptionist for South African guest houses and lodges. Picks up in two seconds, books the room, follows up.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2efe7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body>
        <div className="page-grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
