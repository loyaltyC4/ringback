import type { Metadata } from "next";
import { DashShell } from "@/components/dashboard/shell";
import "../dashboard.css";

export const metadata: Metadata = {
  title: "RingBack — dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashShell>{children}</DashShell>;
}
