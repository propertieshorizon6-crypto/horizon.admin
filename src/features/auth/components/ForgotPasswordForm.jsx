import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import useForgotPassword from "../hooks/useForgotPassword";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const mutation = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email });
  };

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-[#0F172A] mb-1">Check your inbox</h4>
          <p className="text-sm text-[#64748B]">
            We sent a password reset link to <span className="font-medium text-[#0F172A]">{email}</span>.
            It may take a few minutes to arrive.
          </p>
        </div>
        <Link
          to="/auth"
          className="mt-2 text-sm font-medium text-[#1A2744] hover:underline inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-[#64748B] -mt-2">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#0F172A]">Email</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 text-sm outline-none transition focus:border-[#1A2744] focus:ring-2 focus:ring-[#1A2744]/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full h-11 bg-[#1A2744] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2744]/90 active:scale-[0.98] transition-all"
      >
        {mutation.isPending ? "Sending..." : "Send Reset Link"}
      </button>

      {mutation.isError && (
        <p className="text-red-500 text-sm text-center">
          {mutation.error?.response?.data?.message || "Something went wrong. Please try again."}
        </p>
      )}

      <Link
        to="/auth"
        className="flex items-center justify-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A2744] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to login
      </Link>
    </form>
  );
}
