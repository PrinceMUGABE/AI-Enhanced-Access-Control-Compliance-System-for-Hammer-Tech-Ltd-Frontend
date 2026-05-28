import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Eye, EyeOff, Loader2, Clock, Home, ShieldOff, AlertTriangle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ─── Time Gate Config ───────────────────────────────────────────────
const OTP_WINDOW_START = { hour: 8, minute: 30 };  // 08:30
const OTP_WINDOW_END = { hour: 17, minute: 0 };  // 17:00

/**
 * Returns true if the current local time is within the allowed OTP window.
 */
function isWithinOtpWindow() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = OTP_WINDOW_START.hour * 60 + OTP_WINDOW_START.minute;
  const endMinutes = OTP_WINDOW_END.hour * 60 + OTP_WINDOW_END.minute;
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Returns a human-readable string of when OTP requests next become available.
 */
function getNextAvailableMessage() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = OTP_WINDOW_START.hour * 60 + OTP_WINDOW_START.minute;

  if (currentMinutes < startMinutes) {
    return `Login is available from 08:30 AM. Please try again then.`;
  }
  // Past 17:00 — next availability is tomorrow morning
  return `Login is only available between 08:30 AM and 5:00 PM. Please try again tomorrow.`;
}

// ─── Account Lock Modal Component ───────────────────────────────────
const AccountLockModal = ({ isOpen, onClose, message, remainingSeconds, onRetry }) => {
  const [countdown, setCountdown] = useState(remainingSeconds);

  useEffect(() => {
    if (isOpen && remainingSeconds > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, remainingSeconds]);

  useEffect(() => {
    setCountdown(remainingSeconds);
  }, [remainingSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeString = minutes > 0 
    ? `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`
    : `${seconds} second${seconds !== 1 ? 's' : ''}`;

  const handleRetry = () => {
    onClose();
    if (onRetry) onRetry();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Account Temporarily Locked</h3>
          <p className="text-gray-600 mb-2">{message || "Too many failed login attempts."}</p>
          
          {countdown > 0 && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-orange-600 animate-pulse" />
                <span className="text-lg font-semibold text-orange-600">
                  Unlock in: {timeString}
                </span>
              </div>
              <div className="mt-2 w-full bg-orange-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${(countdown / remainingSeconds) * 100}%`,
                    transition: 'width 1s linear'
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleRetry}
            disabled={countdown > 0}
            className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg transition-all ${
              countdown > 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-700'
            }`}
          >
            {countdown > 0 ? 'Please Wait...' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Login Component ───────────────────────────────────────────
export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState("credentials");
  const [otpExpiry, setOtpExpiry] = useState(120);
  const [otpExpiryActive, setOtpExpiryActive] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Account lock states
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [showAttemptsWarning, setShowAttemptsWarning] = useState(false);

  // Live clock state — re-evaluated every minute so the UI updates automatically
  const [withinWindow, setWithinWindow] = useState(isWithinOtpWindow());

  const navigate = useNavigate();
  const { loginWithOTPRequest, loginWithOTPVerify, setAuthTokens, setUser } = useAuth();

  // ── Re-check the time window every 30 seconds ──────────────────────
  useEffect(() => {
    const tick = () => setWithinWindow(isWithinOtpWindow());
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // ── OTP countdown timer ────────────────────────────────────────────
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

  // ── Auto-clear attempts warning after 5 seconds ────────────────────
  useEffect(() => {
    if (showAttemptsWarning) {
      const timer = setTimeout(() => setShowAttemptsWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAttemptsWarning]);

  // ── Check account lock status before login attempt ─────────────────
  const checkAccountLockStatus = async (emailToCheck) => {
    if (!emailToCheck) return null;
    
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/check-lock-status/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      });
      
      const data = await response.json();
      
      if (data.is_locked) {
        setLockMessage(data.message);
        setLockRemainingSeconds(data.remaining_seconds || 180);
        setLockModalOpen(true);
        setFailedAttempts(data.failed_attempts || 0);
        return data;
      }
      
      if (data.failed_attempts > 0) {
        setFailedAttempts(data.failed_attempts);
        const remaining = 3 - data.failed_attempts;
        setRemainingAttempts(remaining);
        if (remaining > 0) {
          setShowAttemptsWarning(true);
          setError(`Warning: ${data.failed_attempts} failed attempt(s) detected. ${remaining} attempt(s) remaining before account lock.`);
        }
      }
      
      return data;
    } catch (err) {
      console.error("Error checking lock status:", err);
      return null;
    }
  };

  // ── Step 1: Credentials → request OTP ─────────────────────────────
  const handleCredentialLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setShowAttemptsWarning(false);

    // ★ Time-gate check
    if (!isWithinOtpWindow()) {
      setError(getNextAvailableMessage());
      return;
    }

    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }

    // Check lock status before proceeding
    const lockStatus = await checkAccountLockStatus(email);
    if (lockStatus?.is_locked) {
      return; // Modal will handle the lock display
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login-with-otp/request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle account lock response
        if (response.status === 423 || data.is_locked) {
          setLockMessage(data.message || "Account is temporarily locked due to too many failed attempts.");
          setLockRemainingSeconds(data.remaining_seconds || 180);
          setLockModalOpen(true);
          setFailedAttempts(data.failed_attempts || 3);
          setError("");
        } else if (data.remaining_attempts !== undefined) {
          // Show remaining attempts warning
          setRemainingAttempts(data.remaining_attempts);
          setFailedAttempts(3 - data.remaining_attempts);
          setShowAttemptsWarning(true);
          setError(data.message || `Invalid credentials. ${data.remaining_attempts} attempt(s) remaining.`);
        } else {
          setError(data.message || "Login failed. Please check your credentials.");
        }
        setLoading(false);
        return;
      }

      const masked = maskEmail(data.email || email);
      setMaskedEmail(masked);
      setLoginStep("otp");
      setOtpExpiry(120);
      setOtpExpiryActive(true);
      setSuccessMessage("OTP has been sent to your email!");
      setShowAttemptsWarning(false);
      setError("");
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP verification ───────────────────────────────────────
  const handleOtpVerification = async (e) => {
    e?.preventDefault();
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log("OTP verification response:", data);

      if (!response.ok) {
        // Handle account lock from OTP verification
        if (response.status === 423 || data.is_locked) {
          setLockMessage(data.message || "Account is temporarily locked due to too many failed attempts.");
          setLockRemainingSeconds(data.remaining_seconds || 180);
          setLockModalOpen(true);
          setFailedAttempts(data.failed_attempts || 3);
          setError("");
          setLoginStep("credentials"); // Reset to credentials step
          setOtp("");
          setOtpExpiryActive(false);
        } else if (data.remaining_attempts !== undefined) {
          setRemainingAttempts(data.remaining_attempts);
          setFailedAttempts(3 - data.remaining_attempts);
          setShowAttemptsWarning(true);
          setError(data.message || `OTP verification failed. ${data.remaining_attempts} attempt(s) remaining.`);
        } else {
          setError(data.message || "OTP verification failed.");
        }
        setLoading(false);
        return;
      }

      if (data.tokens) {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        if (setAuthTokens) setAuthTokens({ access: data.tokens.access, refresh: data.tokens.refresh });
        if (setUser && data.user) setUser(data.user);
      }

      setSuccessMessage("Login successful! Redirecting...");
      
      // Reset all attempt-related states
      setFailedAttempts(0);
      setRemainingAttempts(3);
      setShowAttemptsWarning(false);

      const role = data.user?.role;
      console.log("User role:", role);

      if (role === "admin" || role === "hr_manager") {
        setTimeout(() => navigate("/dashboard"), 1500);
      } else if (role === "employee") {
        setTimeout(() => navigate("/training"), 1500);
      } else if (role === "security_analyst") {
        setTimeout(() => navigate("/incidents-reports"), 1500);
      } else if (role === "compliance_officer") {
        setTimeout(() => navigate("/assigned-incidents"), 1500);
      }

    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP — also time-gated ───────────────────────────────────
  const handleResendOtp = async () => {
    // ★ Time-gate check
    if (!isWithinOtpWindow()) {
      setError(getNextAvailableMessage());
      return;
    }

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 423 || data.is_locked) {
          setLockMessage(data.message || "Account is temporarily locked.");
          setLockRemainingSeconds(data.remaining_seconds || 180);
          setLockModalOpen(true);
          setLoginStep("credentials");
        } else {
          setError(data.message || "Failed to resend OTP.");
        }
        setLoading(false);
        return;
      }

      setOtpExpiry(120);
      setOtpExpiryActive(true);
      setOtp("");
      setSuccessMessage("New OTP sent successfully!");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const goBackToCredentials = () => {
    setLoginStep("credentials");
    setOtp("");
    setOtpExpiryActive(false);
    setOtpExpiry(120);
    setError("");
    setSuccessMessage("");
    setShowAttemptsWarning(false);
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    if (username.length <= 3) return `${"*".repeat(username.length)}@${domain}`;
    const visibleStart = username.substring(0, 2);
    const visibleEnd = username.substring(username.length - 1);
    return `${visibleStart}${"*".repeat(username.length - 3)}${visibleEnd}@${domain}`;
  };

  const handleLockModalClose = () => {
    setLockModalOpen(false);
    setLoginStep("credentials");
    setOtp("");
    setOtpExpiryActive(false);
    setError("");
  };

  const handleLockModalRetry = () => {
    setLockModalOpen(false);
    setLoginStep("credentials");
    setOtp("");
    setOtpExpiryActive(false);
    setError("");
    // Clear email and password to force re-entry
    setEmail("");
    setPassword("");
  };

  // ── Out-of-hours banner ────────────────────────────────────────────
  const OutOfHoursBanner = () => (
    <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl mb-6 flex items-start gap-3">
      <ShieldOff className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-800">Login Unavailable</p>
        <p className="text-sm text-amber-700 mt-0.5">
          Login is only permitted between <strong>08:30 AM</strong> and <strong>5:00 PM</strong>.
          Please return during business hours.
        </p>
      </div>
    </div>
  );

  // ── Attempts Warning Banner ────────────────────────────────────────
  const AttemptsWarningBanner = () => {
    if (!showAttemptsWarning) return null;
    
    return (
      <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Security Alert</p>
            <p className="text-sm text-orange-700 mt-1">
              {failedAttempts} failed attempt(s) detected. {remainingAttempts} attempt(s) remaining before account lock.
            </p>
            <div className="mt-2 w-full bg-orange-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-orange-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(failedAttempts / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
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
          <div
            className="text-2xl font-light text-gray-800 tracking-widest mb-2"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "0.3em" }}
          >
            HammerTech-Group
          </div>
          <p className="text-sm text-gray-600 mt-4">
            AI-Enhanced Access Control &amp; Compliance System
          </p>
        </div>

        {/* Back to Home */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/")}
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

          {/* Out-of-hours banner — shown on both steps */}
          {!withinWindow && <OutOfHoursBanner />}

          {/* Attempts Warning Banner */}
          <AttemptsWarningBanner />

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <p className="text-sm text-green-600 text-center">{successMessage}</p>
            </div>
          )}

          {/* ── Credentials Step ── */}
          {loginStep === "credentials" && (
            <form onSubmit={handleCredentialLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-700 placeholder:text-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={!withinWindow}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
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
                    disabled={!withinWindow}
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !withinWindow}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : !withinWindow ? (
                  <>
                    <Clock className="w-5 h-5" />
                    Available 08:30 AM – 5:00 PM
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* ── OTP Step ── */}
          {loginStep === "otp" && (
            <div className="space-y-6">
              {/* Timer */}
              {otpExpiryActive && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className={`text-sm font-semibold ${otpExpiry <= 10 ? "text-red-600" : "text-orange-600"}`}>
                      Expires in: {otpExpiry}s
                    </span>
                  </div>
                </div>
              )}

              {/* Read-only email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  value={email}
                  readOnly
                />
              </div>

              {/* OTP input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center text-3xl tracking-[0.5em] font-semibold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && otp.length === 6 && handleOtpVerification(e)}
                  autoFocus
                />
              </div>

              {/* Back / Verify */}
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

              {/* Resend */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResendOtp}
                  disabled={loading || otpExpiry > 0 || !withinWindow}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!withinWindow
                    ? "Resend unavailable outside business hours"
                    : otpExpiry > 0
                      ? `Resend OTP (${otpExpiry}s)`
                      : "Resend OTP"}
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

      {/* Account Lock Modal */}
      <AccountLockModal
        isOpen={lockModalOpen}
        onClose={handleLockModalClose}
        message={lockMessage}
        remainingSeconds={lockRemainingSeconds}
        onRetry={handleLockModalRetry}
      />
    </div>
  );
}