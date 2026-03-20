import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard title="Forgot Password" subtitle="Reset your admin account password">
        <ForgotPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}
