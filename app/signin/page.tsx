import type { Metadata } from "next";
import { SignIn } from "@/components/signin";
import "../dashboard.css";
import "../signin.css";

export const metadata: Metadata = {
  title: "Sign in · RingBack",
  description: "Sign in to RingBack - the AI receptionist for Australian trades.",
};

export default function SignInPage() {
  return <SignIn />;
}
