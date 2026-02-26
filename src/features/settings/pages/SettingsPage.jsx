// 📁 src/features/settings/pages/SettingsPage.jsx

import { useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { getInitials }  from "../../../utils/formatters";
import PreferencesTab   from "../components/PreferencesTab";
import ActivityTab      from "../components/ActivityTab";
import SecurityTab      from "../components/SecurityTab";

const TABS = ["Preferences", "Activity", "Security"];

const ACTIVITY_STATS = [
  { icon: "👥", value: 12, label: "Leads Assigned"   },
  { icon: "📅", value: 8,  label: "Tours Scheduled"  },
  { icon: "💬", value: 24, label: "Conversations"    },
  { icon: "📄", value: 3,  label: "Exports (30d)"    },
];

export default function SettingsPage() {
  const { user }        = useAuthStore();
  const [activeTab, setActiveTab] = useState("Preferences");

  return (
    <div className="p-8 min-h-full bg-slate-50">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-6 items-start">

        {/* ── Left Column ── */}
        <div className="flex flex-col gap-5">

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-md">
              {getInitials(user?.name ?? "Akash")}
            </div>

            <h2 className="text-lg font-bold text-slate-900">{user?.name ?? "Akash"}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{user?.email ?? "akash@gmail.com"}</p>

            {/* Role badge */}
            <span className="mt-2 inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
              {user?.role ?? "Agent"}
            </span>

            {/* Info rows */}
            <div className="w-full mt-5 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="text-slate-400">✉</span>
                <span>{user?.email ?? "akash@gmail.com"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="text-slate-400">🕐</span>
                <span>Last login: Never</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="text-slate-400">◎</span>
                <span>Status:
                  <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                </span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button className="mt-5 w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              <span>⚙</span> Edit Profile
            </button>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Activity Summary (7 days)</h3>
            <div className="grid grid-cols-2 gap-3">
              {ACTIVITY_STATS.map(({ icon, value, label }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-lg mb-1">{icon}</div>
                  <div className="text-2xl font-black text-slate-900">{value}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right Column ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-slate-100">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
                {/* Active underline */}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-slate-900 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "Preferences" && <PreferencesTab />}
            {activeTab === "Activity"    && <ActivityTab />}
            {activeTab === "Security"    && <SecurityTab />}
          </div>
        </div>

      </div>
    </div>
  );
}