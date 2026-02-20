import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <AuthLayout>
      <AuthCard>

        {/* Tabs */}
        <div className="flex p-1 bg-[#F1F5F9] rounded-lg mb-8">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "login"
                ? "bg-white text-[#0F172A] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "signup"
                ? "bg-white text-[#0F172A] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <LoginForm key="login" />
          ) : (
            <SignupForm key="signup" />
          )}
        </AnimatePresence>

      </AuthCard>
    </AuthLayout>
  );
}
