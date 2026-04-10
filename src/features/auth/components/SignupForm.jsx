import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSignup } from "../hooks/useSignup";

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useSignup(() => {
    alert("Signup successful! Please login.");
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ fullName, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2D368E]">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          className="flex h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-sm"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2D368E]">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="flex h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-sm"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2D368E]">
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="flex h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-sm pr-12"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full h-11 bg-[#1A2744] text-white rounded-lg text-sm font-semibold"
      >
        {mutation.isPending ? "Creating..." : "Create Account"}
      </button>

      {mutation.isError && (
        <p className="text-red-500 text-sm">
          {mutation.error?.response?.data?.message || mutation.error?.message || "Signup failed. Please try again."}
        </p>
      )}

    </form>
  );
}
