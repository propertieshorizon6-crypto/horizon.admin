// 📁 src/features/settings/components/PreferencesTab.jsx

import { useState } from "react";

const NOTIFICATIONS = [
  {
    key:     "inApp",
    title:   "In-App Notifications",
    desc:    "Receive notifications within the admin portal",
    default: true,
  },
  {
    key:     "email",
    title:   "Email Notifications",
    desc:    "Receive important updates via email",
    default: true,
  },
  {
    key:     "push",
    title:   "Push Notifications",
    desc:    "Receive push notifications on this device",
    default: false,
  },
];

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
        enabled ? "bg-slate-800" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function PreferencesTab() {
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, n.default]))
  );

  const toggle = (key, val) => setPrefs((p) => ({ ...p, [key]: val }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🔔</span>
        <div>
          <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
          <p className="text-xs text-slate-400 mt-0.5">Choose how you want to receive notifications</p>
        </div>
      </div>

      {/* Toggle rows */}
      <div className="space-y-1">
        {NOTIFICATIONS.map(({ key, title, desc }, i) => (
          <div key={key}>
            <div className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <Toggle enabled={prefs[key]} onChange={(val) => toggle(key, val)} />
            </div>
            {i < NOTIFICATIONS.length - 1 && (
              <div className="h-px bg-slate-50" />
            )}
          </div>
        ))}
      </div>

      {/* Send Test Notification */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <button className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <span>🔔</span> Send Test Notification
        </button>
      </div>
    </div>
  );
}