import StatsCard from "../components/StatsCard";
import LeadsSourceChart from "../components/LeadsSourceChart";
import LeadsStatusChart from "../components/LeadsStatusChart";
import AgentLoadChart from "../components/AgentLoadChart";
import LiveAlerts from "../components/LiveAlerts";
import OperationalQueue from "../components/OperationalQueue";
import useDashboardData from "../hooks/useDashboardData";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardData();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-6">
        {data.stats.map((item) => (
          <StatsCard key={item.label} {...item} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        <LeadsSourceChart data={data.leadsSource} />
        <LeadsStatusChart data={data.leadsStatus} />
        <AgentLoadChart data={data.agentLoad} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-6">
        <LiveAlerts alerts={data.liveAlerts} />
        <OperationalQueue queue={data.queue} />
      </div>
    </div>
  );
}