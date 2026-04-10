import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import useVerifyEmail from "../hooks/useVerifyEmail";

export default function VerifyEmailForm() {
  const { token } = useParams();
  const mutation = useVerifyEmail();

  useEffect(() => {
    if (token) {
      mutation.mutate({ token });
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-[#2D368E] mb-1">Invalid verification link</h4>
          <p className="text-sm text-[#64748B]">
            This verification link is missing or invalid.
          </p>
        </div>
      </div>
    );
  }

  if (mutation.isPending) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <Loader2 className="w-8 h-8 text-[#1A2744] animate-spin" />
        <p className="text-sm text-[#64748B]">Verifying your email…</p>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-[#2D368E] mb-1">Email verified!</h4>
          <p className="text-sm text-[#64748B]">
            Your email has been verified successfully.
          </p>
        </div>
        <Link
          to="/auth"
          className="mt-2 text-sm font-medium text-[#1A2744] hover:underline"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (mutation.isError) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-[#2D368E] mb-1">Verification failed</h4>
          <p className="text-sm text-[#64748B]">
            {mutation.error?.response?.data?.message || "This link may have expired or already been used."}
          </p>
        </div>
        <Link
          to="/auth"
          className="mt-2 text-sm font-medium text-[#1A2744] hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return null;
}
