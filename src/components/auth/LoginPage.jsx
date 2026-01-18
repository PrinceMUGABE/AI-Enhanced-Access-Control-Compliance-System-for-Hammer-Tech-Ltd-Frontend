import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, AlertCircle, Award, Eye, EyeOff, ArrowLeft, X, Clock, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = "http://127.0.0.1:8000";

export default function LoginPage() {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    type: "",
    title: "",
    message: "",
    icon: null
  });

  const getModalContent = (status, isActive) => {
    if (!isActive) {
      return {
        type: "inactive",
        title: "Account Inactive",
        message: "Your account is currently inactive. Please contact the administrator to reactivate your account.",
        icon: <XCircle className="w-16 h-16 text-red-500" />
      };
    }

    switch (status) {
      case "pending":
        return {
          type: "pending",
          title: "Account Pending Approval",
          message: "Your account is awaiting administrator approval. You will be notified once your account has been reviewed and approved.",
          icon: <Clock className="w-16 h-16 text-yellow-500" />
        };
      case "rejected":
        return {
          type: "rejected",
          title: "Account Rejected",
          message: "Your account registration has been rejected. Please contact the administrator for more information or to request reconsideration.",
          icon: <XCircle className="w-16 h-16 text-red-500" />
        };
      default:
        return null;
    }
  };

  const handleContactAdmin = () => {
    // Create email content based on modal type
    let subject = "";
    let body = "";

    if (modalContent.type === "rejected") {
      subject = "Request for Account Activation - BTSL Mentorship";
      body = `Dear Administrator,

I am writing to request the activation of my account on the BTSL Digital Mentorship System.

Account Details:
- Work Email: ${email}
- Status: Rejected

I would appreciate it if you could review my account and provide information on why it was rejected, or reconsider my application.

If there are any additional steps or information required from my side, please let me know.

Thank you for your time and consideration.

Best regards,
[Your Name]`;
    } else if (modalContent.type === "inactive") {
      subject = "Request for Account Reactivation - BTSL Mentorship";
      body = `Dear Administrator,

I am writing to request the reactivation of my account on the BTSL Digital Mentorship System.

Account Details:
- Work Email: ${email}
- Status: Rejected

I would like to regain access to the system. Please let me know if there are any requirements or steps I need to complete.

Thank you for your assistance.

Best regards,
[Your Name]`;
    } else {
      subject = "Account Activation Request - BTSL Mentorship";
      body = `Dear Administrator,

I am writing to inquire about the status of my account on the BTSL Digital Mentorship System.

Account Details:
- Work Email: ${email}

I would appreciate any information you can provide regarding my account status.

Thank you for your time.

Best regards,
[Your Name]`;
    }

    // Encode the subject and body for URL
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    // Create Gmail compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=princemugabe567@gmail.com&su=${encodedSubject}&body=${encodedBody}`;

    // Open in new tab
    window.open(gmailUrl, '_blank');
  };

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
        
        const errorMsg = data.error || data.message || "Login failed. Please try again.";
        
        if (errorMsg.includes("pending approval")) {
          const content = getModalContent("pending", true);
          setModalContent(content);
          setShowModal(true);
        } else if (errorMsg.includes("rejected")) {
          const content = getModalContent("rejected", true);
          setModalContent(content);
          setShowModal(true);
        } else if (errorMsg.includes("inactive")) {
          const content = getModalContent("", false);
          setModalContent(content);
          setShowModal(true);
        } else {
          setError(errorMsg);
        }
        
        setLoading(false);
        return;
      }

      console.log("=== LOGIN SUCCESSFUL ===");

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

      const mappedUser = {
        id: data.id?.toString() || '',
        full_name: data.full_name || '',
        name: data.full_name || '',
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

      localStorage.setItem("user", JSON.stringify(mappedUser));
      console.log("User data stored in localStorage");

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

  const closeModal = () => {
    setShowModal(false);
    setModalContent({
      type: "",
      title: "",
      message: "",
      icon: null
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

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

          <div className="mt-6 text-center">
            <Link
              to="/reset-password"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-6">
              {modalContent.icon}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              {modalContent.title}
            </h2>

            <p className="text-gray-600 text-center mb-8">
              {modalContent.message}
            </p>

            <div className="space-y-3">
              <button
                onClick={closeModal}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Got It
              </button>
              
              {(modalContent.type === "rejected" || modalContent.type === "inactive") && (
                <button
                  onClick={handleContactAdmin}
                  className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all hover:bg-gray-50"
                >
                  Contact Administrator
                </button>
              )}
            </div>

            <p className="text-sm text-gray-500 text-center mt-6">
              {modalContent.type === "pending" && "You will receive an email notification once your account is approved."}
              {modalContent.type === "rejected" && "Need help? Our support team is here to assist you."}
              {modalContent.type === "inactive" && "Contact your administrator to restore access to your account."}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}