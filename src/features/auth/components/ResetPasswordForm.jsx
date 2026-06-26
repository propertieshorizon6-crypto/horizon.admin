import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import useResetPassword from '../hooks/useResetPassword';

export default function ResetPasswordForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [matchError, setMatchError] = useState('');

  const mutation = useResetPassword();

  useEffect(() => {
    if (mutation.isSuccess) {
      const timer = setTimeout(
        () => navigate('/auth', { replace: true }),
        2000,
      );
      return () => clearTimeout(timer);
    }
  }, [mutation.isSuccess, navigate]);

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-[#2D368E] mb-1">
            Invalid reset link
          </h4>
          <p className="text-sm text-[#64748B]">
            This password reset link is missing or invalid. Please request a new
            one.
          </p>
        </div>
        <Link
          to="/auth/forgot-password"
          className="mt-2 text-sm font-medium text-[#1A2744] hover:underline"
        >
          Request a new link
        </Link>
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
          <h4 className="text-base font-semibold text-[#2D368E] mb-1">
            Password reset!
          </h4>
          <p className="text-sm text-[#64748B]">
            Your password has been updated. Redirecting you to login…
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMatchError('Passwords do not match.');
      return;
    }
    setMatchError('');
    mutation.mutate({ token, newPassword });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <p className="text-sm text-[#64748B] -mt-2">
        Choose a strong new password for your account.
      </p>

      {/* New Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#2D368E]">
          New Password
        </label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter Your New Password"
            required
            minLength={8}
            className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 pr-12 text-sm outline-none transition focus:border-[#1A2744] focus:ring-2 focus:ring-[#1A2744]/20"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#2D368E]">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Your New Password"
            required
            className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 pr-12 text-sm outline-none transition focus:border-[#1A2744] focus:ring-2 focus:ring-[#1A2744]/20"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {matchError && <p className="text-red-500 text-sm">{matchError}</p>}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full h-11 bg-[#1A2744] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2744]/90 active:scale-[0.98] transition-all"
      >
        {mutation.isPending ? 'Resetting...' : 'Reset Password'}
      </button>

      {mutation.isError && (
        <p className="text-red-500 text-sm text-center">
          {mutation.error?.response?.data?.message ||
            'Reset failed. The link may have expired.'}
        </p>
      )}
    </form>
  );
}
