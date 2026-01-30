import React, { useState } from "react";
import {
  Shield,
  Lock,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Users,
  FileCheck,
  Brain,
  Globe,
  Zap,
  AlertTriangle,
  Award,
} from "lucide-react";

export function LoginScreen({ onLogin }) {
  const [step, setStep] = useState("role");
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const roles = [
    {
      id: "admin",
      name: "System Administrator",
      icon: Shield,
      description: "Full system access with administrative privileges",
    },
    {
      id: "compliance",
      name: "Compliance Officer",
      icon: FileCheck,
      description: "Compliance & audit oversight",
    },
    {
      id: "security",
      name: "Security Analyst",
      icon: Brain,
      description: "Security monitoring and threat detection",
    },
    {
      id: "user",
      name: "Regular User",
      icon: Users,
      description: "Standard user access",
    },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep("credentials");
  };

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      setStep("mfa");
    }
  };

  const handleMfaSubmit = (e) => {
    e.preventDefault();
    if (mfaCode.length === 6) {
      setStep("success");
      setTimeout(() => {
        onLogin(selectedRole);
      }, 1500);
    }
  };

  const getRoleDisplayName = (roleId) => {
    switch(roleId) {
      case "admin": return "Administrator";
      case "compliance": return "Compliance Officer";
      case "security": return "Security Analyst";
      default: return "User";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(37, 99, 235, 0.2) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 mb-4 shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hammer Tech Security
          </h1>
          <p className="text-gray-600">
            AI-Enhanced Access Control System
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-sm font-medium">
            <Globe className="h-4 w-4" />
            <span>Powered by Hammer Group Rwanda</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="border border-gray-200 bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {step === "role" && "Select Your Role"}
              {step === "credentials" && "Sign In"}
              {step === "mfa" && "Two-Factor Authentication"}
              {step === "success" && "Authentication Successful"}
            </h2>
            <p className="text-gray-600 text-sm">
              {step === "role" && "Choose your role to continue"}
              {step === "credentials" && "Enter your credentials to continue"}
              {step === "mfa" && "Enter the 6-digit code from your authenticator app"}
              {step === "success" && "Redirecting to dashboard..."}
            </p>
          </div>
          <div className="p-6">
            {step === "role" && (
              <div className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all text-left group hover:shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {role.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {role.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                  );
                })}
              </div>
            )}

            {step === "credentials" && (
              <form
                onSubmit={handleCredentialsSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-gray-900 text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="j.habineza@hammertech.rw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-gray-900 text-sm font-medium"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg flex items-center justify-center font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Continue to MFA
                </button>
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="w-full text-sm text-gray-500 hover:text-blue-600 text-center transition-colors"
                >
                  ← Back to role selection
                </button>
              </form>
            )}

            {step === "mfa" && (
              <form
                onSubmit={handleMfaSubmit}
                className="space-y-4"
              >
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <Smartphone className="h-8 w-8 text-blue-600 mr-3" />
                  <div className="text-left">
                    <p className="text-gray-900 text-sm font-medium">
                      Authenticator App
                    </p>
                    <p className="text-gray-600 text-xs">
                      Enter the code from your device
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="mfa" className="block text-gray-900 text-sm font-medium">
                    Authentication Code
                  </label>
                  <input
                    id="mfa"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) =>
                      setMfaCode(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full bg-white border border-gray-300 text-gray-900 text-center text-2xl tracking-widest px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg flex items-center justify-center font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify & Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="w-full text-sm text-gray-500 hover:text-blue-600 text-center transition-colors"
                >
                  ← Back to credentials
                </button>
              </form>
            )}

            {step === "success" && (
              <div className="py-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <p className="text-gray-900 font-medium text-lg">
                  Authentication successful!
                </p>
                <p className="text-gray-600 text-sm">
                  Welcome back, {getRoleDisplayName(selectedRole)}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>Loading dashboard</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Demo Credentials Helper */}
        {step === "credentials" && (
          <div className="mt-4 border border-blue-200 bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-700 font-medium mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>Email: <span className="font-mono">j.uwimana@hammertech.rw</span></p>
              <p>Password: <span className="font-mono">Any password works</span></p>
              <p>MFA Code: <span className="font-mono">Any 6 digits</span></p>
            </div>
          </div>
        )}

        {/* Security Features */}
        <div className="mt-6 grid grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Shield className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700">
              256-bit Encryption
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Lock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700">
              MFA Protected
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700">
              AI Monitored
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Award className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700">
              ISO Certified
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Hammer Tech Ltd. Powered by Hammer Group Rwanda
          </p>
          <p className="mt-1">
            Secured by AI-Enhanced Access Control System v2.1.0
          </p>
        </div>
      </div>
    </div>
  );
}