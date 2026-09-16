import type { Metadata } from "next";
import { Trust } from "@/components/legal";
import "../dashboard.css";
import "../legal.css";

export const metadata: Metadata = {
  title: "Trust · RingBack",
  description: "What RingBack has actually done to protect you - and what it hasn't done yet.",
};

export default function TrustPage() {
  return <Trust />;
}
