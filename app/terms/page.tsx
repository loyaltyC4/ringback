import type { Metadata } from "next";
import { Terms } from "@/components/legal";
import "../dashboard.css";
import "../legal.css";

export const metadata: Metadata = {
  title: "Terms · RingBack",
  description: "RingBack's terms of service, in language you can actually read.",
};

export default function TermsPage() {
  return <Terms />;
}
