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
  const { data, isLoading } = useDashboardData();
  const dashboardData = data || EMPTY_DASHBOARD_DATA;

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-5 gap-6">
        {toList(dashboardData.stats).map((item) => (
          <StatsCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <LeadsSourceChart data={toList(dashboardData.leadsSource)} />
        <LeadsStatusChart data={toList(dashboardData.leadsStatus)} />
        <AgentLoadChart data={toList(dashboardData.agentLoad)} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <LiveAlerts alerts={toList(dashboardData.liveAlerts)} />
        <OperationalQueue queue={toList(dashboardData.queue)} />
      </div>
    </div>
  );
}
