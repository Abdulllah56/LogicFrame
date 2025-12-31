import DashboardClient from "./DashboardClient";
import { storage } from "../server/storage";

export default async function Dashboard() {
  // Server-side fetch: get all data in parallel
  const DEMO_USER_ID = 1;
  await storage.initializeDefaults();

  const summary = await storage.getDashboardSummary(DEMO_USER_ID);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Pass server-fetched lightweight summary to the client wrapper for fast navigation */}
        <DashboardClient summary={summary} />
      </div>
    </div>
  );
}