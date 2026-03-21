import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import VerifyEmailForm from "../components/VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <AuthCard title="Verify Email" subtitle="Confirming your email address">
        <VerifyEmailForm />
      </AuthCard>
    </AuthLayout>
  );
}
