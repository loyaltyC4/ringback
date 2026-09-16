import type { Metadata } from "next";
import { Suspense } from "react";
import { DashShell } from "@/components/dashboard/shell";
import "../dashboard.css";

export const metadata: Metadata = {
  title: "RingBack - dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashShell>
      {/* pages read ?state=empty via useSearchParams to preview their day-one
          state, which needs a CSR bailout boundary at build time */}
      <Suspense fallback={null}>{children}</Suspense>
    </DashShell>
  );
}
