import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import useLogin from "../hooks/useLogin";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const loginMutation = useLogin();

  const validateFields = () => {
    const errors = { email: "", password: "" };
    let valid = true;

    if (!email.trim()) {
      errors.email = "Email is required.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
      valid = false;
    }

    if (!password) {
      errors.password = "Password is required.";
      valid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    return { valid, errors };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { valid, errors } = validateFields();
    if (!valid) {
      setFieldErrors(errors);
      return;
    }
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
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
            if (loginMutation.isError) loginMutation.reset();
          }}
          placeholder="you@company.com"
          className={`h-11 w-full rounded-lg border bg-[#F8FAFC] px-4 text-sm outline-none transition focus:ring-2 ${
            fieldErrors.email
              ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
              : "border-[#E2E8F0] focus:border-[#1A2744] focus:ring-[#1A2744]/20"
          }`}
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
        )}
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
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
              if (loginMutation.isError) loginMutation.reset();
            }}
            placeholder="••••••••"
            className={`h-11 w-full rounded-lg border bg-[#F8FAFC] px-4 pr-12 text-sm outline-none transition focus:ring-2 ${
              fieldErrors.password
                ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                : "border-[#E2E8F0] focus:border-[#1A2744] focus:ring-[#1A2744]/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
        )}
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

      {/* Server Error */}
      {loginMutation.isError && (
        <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{loginMutation.error?.message || "Login failed. Please try again."}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-11 bg-[#1A2744] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2744]/90 active:scale-[0.98] transition-all"
      >
        {loginMutation.isPending ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
