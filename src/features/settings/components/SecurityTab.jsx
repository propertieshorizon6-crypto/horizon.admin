// 📁 src/features/settings/components/SecurityTab.jsx

import { useState } from "react";

const SESSIONS = [
  { id: 1, device: "Chrome on Windows",  location: "Mumbai, IN",    time: "Active now",     current: true  },
  { id: 2, device: "Safari on iPhone",   location: "Mumbai, IN",    time: "2 hours ago",    current: false },
  { id: 3, device: "Firefox on MacOS",   location: "Delhi, IN",     time: "3 days ago",     current: false },
];

export default function SecurityTab() {
  const [form, setForm]   = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow]   = useState({ current: false, newPass: false, confirm: false });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) return alert("Passwords don't match");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setForm({ current: "", newPass: "", confirm: "" });
  };

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Change Password</h3>
        <p className="text-xs text-slate-400 mb-5">Use a strong password you don't use elsewhere</p>

        <form onSubmit={handleSave} className="space-y-4">
          {[
            { key: "current", label: "Current Password"  },
            { key: "newPass", label: "New Password"      },
            { key: "confirm", label: "Confirm Password"  },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-slate-400 bg-slate-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                >
                  {show[key] ? "🙈" : "👁"}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            {saved ? "✅ Password Updated!" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Active Sessions */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Active Sessions</h3>
        <p className="text-xs text-slate-400 mb-5">Devices currently signed into your account</p>

        <div className="space-y-3">
          {SESSIONS.map(({ id, device, location, time, current }) => (
            <div key={id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-base shadow-sm">
                  💻
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{device}</p>
                    {current && (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{location} · {time}</p>
                </div>
              </div>
              {!current && (
                <button className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}