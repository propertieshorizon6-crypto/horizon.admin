import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#0F172A] text-white flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-8">Horizon</h1>

      <nav className="space-y-4">
        <NavLink to="/admin/dashboard" className="block hover:text-yellow-400">
          Dashboard
        </NavLink>
        <NavLink to="/admin/leads" className="block hover:text-yellow-400">
          Leads
        </NavLink>
        <NavLink to="/admin/properties" className="block hover:text-yellow-400">
          Properties
        </NavLink>
        <NavLink to="/admin/users" className="block hover:text-yellow-400">
          Users
        </NavLink>
      </nav>

      <div className="mt-auto">
        <button className="text-red-400 mt-10">Sign Out</button>
      </div>
    </div>
  );
}