import StatsCard from "../components/StatsCard";
import LeadsSourceChart from "../components/LeadsSourceChart";
import LeadsStatusChart from "../components/LeadsStatusChart";
import AgentLoadChart from "../components/AgentLoadChart";
import LiveAlerts from "../components/LiveAlerts";
import OperationalQueue from "../components/OperationalQueue";
import useDashboardData from "../hooks/useDashboardData";
import { EMPTY_DASHBOARD_DATA } from "../api/dashboardApi";

const toList = (value) => (Array.isArray(value) ? value : []);

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboardData();
  const dashboardData = data || EMPTY_DASHBOARD_DATA;

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-500 p-4">Failed to load dashboard data. Please refresh the page.</p>;

  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {toList(dashboardData.stats).map((item) => (
          <StatsCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <LeadsSourceChart data={toList(dashboardData.leadsSource)} />
        <LeadsStatusChart data={toList(dashboardData.leadsStatus)} />
        <AgentLoadChart data={toList(dashboardData.agentLoad)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <LiveAlerts alerts={toList(dashboardData.liveAlerts)} />
        <OperationalQueue queue={toList(dashboardData.queue)} />
      </div>
    </div>
  );
}
