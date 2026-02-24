import { AnimatePresence } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import LoginForm from "../components/LoginForm";

export default function AuthPage() {
  return (
    <AuthLayout>
      <AuthCard>
        {/* Admin login only */}
        <AnimatePresence mode="wait">
          <LoginForm key="login" />
        </AnimatePresence>
      </AuthCard>
    </AuthLayout>
  );
}
