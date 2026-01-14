import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, AlertCircle, Award, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = "http://127.0.0.1:8000";

export default function LoginPage() {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      console.log("=== LOGIN ATTEMPT STARTED ===");
      console.log("Attempting login with:", { email });

      const response = await fetch(`${BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          work_mail_address: email,
          password: password,
        }),
      });

      console.log("=== RESPONSE RECEIVED ===");
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log("=== RAW RESPONSE TEXT ===");
      console.log(responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("=== PARSED RESPONSE DATA ===");
        console.log(JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error("=== JSON PARSE ERROR ===");
        console.error(parseError);
        setError("Invalid response from server");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        console.log("=== LOGIN FAILED ===");
        console.log("Error details:", data);
        setError(data.error || data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      console.log("=== LOGIN SUCCESSFUL ===");

      // Store tokens
      console.log("=== STORING TOKENS ===");
      if (data.token) {
        console.log("Token structure:", {
          hasAccess: !!data.token.access,
          hasRefresh: !!data.token.refresh,
        });
        localStorage.setItem("access_token", data.token.access);
        localStorage.setItem("refresh_token", data.token.refresh);
        console.log("Tokens stored successfully");
      } else {
        console.warn("No token in response data");
      }

      // Map and store user data
      const mappedUser = {
        id: data.id?.toString() || '',
        full_name: data.full_name || '',
        name: data.full_name || '', // For compatibility
        email: data.email || '',
        work_mail_address: data.work_mail_address || '',
        role: data.role || 'mentee',
        department: data.department || '',
        phone_number: data.phone_number || '',
        avatar: data.avatar
      };

      console.log("=== MAPPED USER DATA ===");
      console.log(JSON.stringify(mappedUser, null, 2));
      console.log("User role:", mappedUser.role);

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(mappedUser));
      console.log("User data stored in localStorage");

      // Set user in context - setUser will handle navigation to appropriate dashboard
      console.log("Setting user in AuthContext...");
      setUser(mappedUser);
      console.log("User set in AuthContext - navigation will be handled by setUser");

    } catch (err) {
      console.error("=== LOGIN ERROR (CATCH BLOCK) ===");
      console.error("Error type:", err instanceof Error ? err.constructor.name : typeof err);
      console.error("Error message:", err instanceof Error ? err.message : String(err));
      console.error("Full error:", err);
      setError("Network error. Please check your connection and ensure the backend is running.");
    } finally {
      setLoading(false);
      console.log("=== LOGIN PROCESS COMPLETE ===");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="text-white w-9 h-9" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              BTSL Mentorship
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="your.work@email.com"
                  className="w-full pl-10 pr-3 py-2.5 h-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2.5 h-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Link
              to="/reset-password"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}