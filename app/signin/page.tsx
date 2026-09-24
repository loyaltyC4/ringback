import type { Metadata } from "next";
import { SignIn } from "@/components/signin";
import "../dashboard.css";
import "../signin.css";

export const metadata: Metadata = {
  title: "Sign in · RingBack",
  description: "Sign in to StaysAfrica - the AI receptionist for South African guest houses and lodges.",
};

export default function SignInPage() {
  return <SignIn />;
}
