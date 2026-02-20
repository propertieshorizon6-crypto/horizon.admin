export default function StatsCard({ label, value, growth }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-green-500 text-sm">{growth}%</p>
    </div>
  );
}