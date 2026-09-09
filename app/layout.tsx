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
  title: "RingBack — never miss a job because you couldn't pick up",
  description:
    "RingBack is the AI receptionist for Australian trades. Answers every call in two seconds, books the job into your calendar, texts you the details, and follows up so quotes don't go cold.",
  openGraph: {
    title: "RingBack — every call answered",
    description:
      "The AI receptionist for Australian trades. Picks up in two seconds, books the job, follows up.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2efe7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body>
        <div className="page-grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
