import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import ResetPasswordForm from "../components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard title="Reset Password" subtitle="Set a new password for your account">
        <ResetPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}
