// 📁 src/features/settings/components/PreferencesTab.jsx

import { useState, useEffect } from "react";
import { useMutation }         from "@tanstack/react-query";
import { useAuthStore }        from "../../../store/useAuthStore";
import { updateNotificationPrefs } from "../api/settingsApi";

const NOTIFICATIONS = [
  {
    key:   "inApp",
    title: "In-App Notifications",
    desc:  "Receive notifications within the admin portal",
  },
  {
    key:   "email",
    title: "Email Notifications",
    desc:  "Receive important updates via email",
  },
  {
    key:   "push",
    title: "Push Notifications",
    desc:  "Receive push notifications on this device",
  },
];

function Toggle({ enabled, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
        enabled ? "bg-slate-800" : "bg-slate-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
  const { user, updateUser } = useAuthStore();

  const [prefs, setPrefs] = useState({
    inApp: user?.notificationPreferences?.inApp ?? true,
    email: user?.notificationPreferences?.email ?? true,
    push:  user?.notificationPreferences?.push  ?? false,
  });

  // Keep in sync if user changes (e.g. profile refresh)
  useEffect(() => {
    if (user?.notificationPreferences) {
      setPrefs({
        inApp: user.notificationPreferences.inApp ?? true,
        email: user.notificationPreferences.email ?? true,
        push:  user.notificationPreferences.push  ?? false,
      });
    }
  }, [user?.notificationPreferences]);

  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState("");

  const mutation = useMutation({
    mutationFn: updateNotificationPrefs,
    onSuccess: (updatedUser) => {
      if (updatedUser?.notificationPreferences) {
        updateUser({ notificationPreferences: updatedUser.notificationPreferences });
      }
      setDirty(false);
      setSaveError("");
    },
    onError: (err) => {
      const apiErr = err?.response?.data?.error;
      setSaveError(apiErr?.message ?? "Failed to save preferences.");
    },
  });

  const toggle = (key, val) => {
    setPrefs((p) => ({ ...p, [key]: val }));
    setDirty(true);
  };

  const handleSave = () => {
    setSaveError("");
    mutation.mutate(prefs);
  };

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

      {/* Error banner */}
      {saveError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {saveError}
        </div>
      )}

      {/* Toggle rows */}
      <div className="space-y-1">
        {NOTIFICATIONS.map(({ key, title, desc }, i) => (
          <div key={key}>
            <div className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <Toggle
                enabled={prefs[key]}
                onChange={(val) => toggle(key, val)}
                disabled={mutation.isPending}
              />
            </div>
            {i < NOTIFICATIONS.length - 1 && <div className="h-px bg-slate-50" />}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!dirty || mutation.isPending}
          className="flex-1 py-3 bg-[#1e3a5f] hover:bg-[#162d4a] disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {mutation.isPending ? "Saving…" : mutation.isSuccess && !dirty ? "✅ Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
