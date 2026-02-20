import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate("/admin/dashboard");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#0F172A]">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="flex h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-sm focus:ring-2 focus:ring-[#1A2744]"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-[#0F172A]">
            Password
          </label>
          <button
            type="button"
            className="text-xs text-[#1A2744] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="flex h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-sm pr-12 focus:ring-2 focus:ring-[#1A2744]"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="remember" />
        <label htmlFor="remember" className="text-sm text-[#64748B]">
          Remember me
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-11 bg-[#1A2744] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2744]/90 transition"
      >
        {loginMutation.isPending ? "Signing In..." : "Sign In"}
      </button>

      {/* Error */}
      {loginMutation.isError && (
        <p className="text-red-500 text-sm text-center">
          {loginMutation.error?.response?.data?.error?.message ||
            "Login failed"}
        </p>
      )}
    </form>
  );
}