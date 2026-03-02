import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Eye, EyeOff, Loader2, Clock, Home } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function LoginScreen() {
  const [email, setEmail] = useState(""); // User's email for login
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState("credentials");
  const [otpExpiry, setOtpExpiry] = useState(30);
  const [otpExpiryActive, setOtpExpiryActive] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Get auth functions from context
  const { loginWithOTPRequest, loginWithOTPVerify, setAuthTokens, setUser } = useAuth();

  useEffect(() => {
    if (!otpExpiryActive || otpExpiry <= 0) return;

    const timer = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setOtpExpiryActive(false);
          setError("OTP has expired. Please request a new one.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpExpiryActive, otpExpiry]);

  const handleCredentialLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login-with-otp/request/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email, // Changed from emp_number to email
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Mask the email for display
      const masked = maskEmail(data.email || email);
      setMaskedEmail(masked);
      setLoginStep("otp");
      setOtpExpiry(30);
      setOtpExpiryActive(true);
      setError("");
      setSuccessMessage("OTP has been sent to your email!");
      setLoading(false);

    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (otpExpiry <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login-with-otp/verify/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email, // Changed from emp_number to email
          otp: otp,
        }),
      });

      const data = await response.json();

      console.log("=== OTP Verification Result ===");
      console.log("Success:", data);
      console.log("===============================");

      if (!response.ok) {
        setError(data.message || "OTP verification failed.");
        setLoading(false);
        return;
      }

      // Store tokens and user data
      if (data.tokens) {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        
        // Update auth context
        if (setAuthTokens) {
          setAuthTokens({
            access: data.tokens.access,
            refresh: data.tokens.refresh,
          });
        }
        
        if (setUser && data.user) {
          setUser(data.user);
        }
      }

      setSuccessMessage("Login successful! Redirecting...");
      
      // Redirect after successful login
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

      setLoading(false);

    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || !password) {
      setError("Session expired. Please login again.");
      goBackToCredentials();
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login-with-otp/request/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to resend OTP.");
        setLoading(false);
        return;
      }

      setOtpExpiry(30);
      setOtpExpiryActive(true);
      setOtp("");
      setSuccessMessage("New OTP sent successfully!");
      setLoading(false);

    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  const goBackToCredentials = () => {
    setLoginStep("credentials");
    setOtp("");
    setOtpExpiryActive(false);
    setOtpExpiry(30);
    setError("");
    setSuccessMessage("");
  };

  const forgetPassword = () => {
    navigate("/reset-password");
  };

  const goBackToHome = () => {
    navigate("/");
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
      return `${'*'.repeat(username.length)}@${domain}`;
    }
    const visibleStart = username.substring(0, 2);
    const visibleEnd = username.substring(username.length - 1);
    return `${visibleStart}${'*'.repeat(username.length - 3)}${visibleEnd}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex flex-col gap-1.5">
              <div className="w-20 h-3.5 bg-gray-400 rounded-sm"></div>
              <div className="w-20 h-3.5 bg-gray-400 rounded-sm"></div>
            </div>
          </div>

          <div className="text-2xl font-light text-gray-800 tracking-widest mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.3em' }}>
            HammerTech-Group
          </div>

          <p className="text-sm text-gray-600 mt-4">
            AI-Enhanced Access Control & Compliance System
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={goBackToHome}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {loginStep === "credentials" ? "Login Page" : "Verify OTP"}
            </h2>
            <p className="text-sm text-gray-500">
              {loginStep === "credentials" 
                ? "Please enter your email and password to receive OTP" 
                : `Code sent to ${maskedEmail}`}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <p className="text-sm text-green-600 text-center">{successMessage}</p>
            </div>
          )}

          {/* Credentials Step */}
          {loginStep === "credentials" && (
            <form onSubmit={handleCredentialLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-700 placeholder:text-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={forgetPassword}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-700 placeholder:text-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">You will receive an OTP via email after submitting</p>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {loginStep === "otp" && (
            <div className="space-y-6">
              {/* OTP Timer */}
              {otpExpiryActive && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className={`text-sm font-semibold ${otpExpiry <= 10 ? 'text-red-600' : 'text-orange-600'}`}>
                      Expires in: {otpExpiry}s
                    </span>
                  </div>
                </div>
              )}

              {/* Email Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  value={email}
                  readOnly
                />
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center text-3xl tracking-[0.5em] font-semibold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleOtpVerification(e)}
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={goBackToCredentials}
                  className="flex-1 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleOtpVerification}
                  disabled={loading || otp.length !== 6 || otpExpiry <= 0}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>

            {/* Resend OTP */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResendOtp}
                disabled={loading || otpExpiry > 0}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpExpiry > 0 ? `Resend OTP (${otpExpiry}s)` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Hammer Tech Group Rwanda. All rights reserved.
        </p>
      </div>
    </div>
  </div>
  );
}