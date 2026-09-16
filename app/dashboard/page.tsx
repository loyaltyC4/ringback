import { Today } from "@/components/dashboard/today";
import { getTodayView } from "@/lib/view";

/**
 * Server component: reads the owner's real rows when the install is wired,
 * hands null through otherwise and Today renders its fixtures.
 */
export default async function DashboardHome() {
  const live = await getTodayView();
  return <Today live={live} />;
}
