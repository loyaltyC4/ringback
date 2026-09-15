import type { Metadata } from "next";
import { Privacy } from "@/components/legal";
import "../dashboard.css";
import "../legal.css";

export const metadata: Metadata = {
  title: "Privacy · RingBack",
  description: "What RingBack knows about you and your callers, and exactly what happens to it.",
};

export default function PrivacyPage() {
  return <Privacy />;
}
