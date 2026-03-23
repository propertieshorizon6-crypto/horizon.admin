import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useLogin from "../hooks/useLogin";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password, rememberMe });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#0F172A]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm outline-none transition focus:border-[#1A2744] focus:ring-2 focus:ring-[#1A2744]/20"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-[#0F172A]">Password</label>
          <Link to="/auth/forgot-password" className="text-xs text-[#1A2744] hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 pr-12 text-sm outline-none transition focus:border-[#1A2744] focus:ring-2 focus:ring-[#1A2744]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 rounded border-[#E2E8F0] accent-[#1A2744]"
        />
        <label htmlFor="remember" className="text-sm text-[#64748B]">
          Remember me
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-11 bg-[#1A2744] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2744]/90 active:scale-[0.98] transition-all"
      >
        {loginMutation.isPending ? "Signing In..." : "Sign In"}
      </button>

      {/* Error */}
      {loginMutation.isError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {loginMutation.error?.response?.data?.error?.message ||
            loginMutation.error?.message ||
            "Login failed. Please try again."}
        </div>
      )}
    </form>
  );
}
