// 📁 src/features/settings/components/SecurityTab.jsx

import { useState }    from "react";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../api/settingsApi";

export default function SecurityTab() {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: ({ current, newPass }) =>
      changePassword({ currentPassword: current, newPassword: newPass }),
    onSuccess: () => {
      setForm({ current: "", newPass: "", confirm: "" });
      setFormError("");
    },
    onError: (err) => {
      const apiErr = err?.response?.data?.error;
      const detail = apiErr?.details?.[0]?.message;
      setFormError(detail ?? apiErr?.message ?? "Failed to update password. Please try again.");
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.current)                   { setFormError("Current password is required."); return; }
    if (!form.newPass)                   { setFormError("New password is required."); return; }
    if (form.newPass !== form.confirm)   { setFormError("Passwords don't match."); return; }
    if (form.newPass.length < 8)         { setFormError("New password must be at least 8 characters."); return; }

    mutation.mutate({ current: form.current, newPass: form.newPass });
  };

  return (
    <div className="space-y-8">

      {/* Change Password */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Change Password</h3>
        <p className="text-xs text-slate-400 mb-5">Use a strong password you don't use elsewhere</p>

        {/* Error / Success banners */}
        {formError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {formError}
          </div>
        )}
        {mutation.isSuccess && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            ✅ Password updated successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {[
            { key: "current", label: "Current Password" },
            { key: "newPass", label: "New Password"     },
            { key: "confirm", label: "Confirm Password" },
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
            disabled={mutation.isPending}
            className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            {mutation.isPending ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Active Sessions — static (no session revoke API) */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Active Sessions</h3>
        <p className="text-xs text-slate-400 mb-5">Devices currently signed into your account</p>

        <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
          Session management not available
        </div>
      </div>
    </div>
  );
}
