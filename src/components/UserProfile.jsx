import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Shield,
  Save,
  Edit,
  CheckCircle,
  Calendar,
  Clock,
  Key,
} from "lucide-react";

export function UserProfile({ userRole }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [userData, setUserData] = useState({
    name: "Habineza Josue",
    email: "j.habineza@hammertech.rw",
    phone: "+250 788 123 456",
    location: "Kigali, Rwanda",
    role: userRole,
    department:
      userRole === "System Administrator"
        ? "IT Security"
        : userRole === "Compliance Officer"
          ? "Legal & Compliance"
          : userRole === "Security Analyst"
            ? "IT Security"
            : "Operations",
    joinDate: "January 15, 2023",
    lastLogin: "December 29, 2025 09:45 AM",
  });

  const handleSave = () => {
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleInputChange = (field, value) => {
    setUserData({
      ...userData,
      [field]: value
    });
  };

  const getInitials = (name) => {
    return name.split(" ").map((n) => n[0]).join("");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="h-8 w-8 text-blue-600" />
            My Profile
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage your personal information
          </p>
        </div>
        {!isEditing && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center font-medium transition-colors"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg">
          <div className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(userData.name)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-gray-600 mt-1">
                  {userData.role}
                </p>
              </div>
              <div className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 truncate">
                {userData.email}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {userData.department}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {userData.location}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                Joined {userData.joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Personal Information</h2>
              <p className="text-gray-600">
                Update your personal details
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block font-medium">Full Name</label>
                  <input
                    id="name"
                    value={userData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block font-medium">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block font-medium">Phone Number</label>
                  <input
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="block font-medium">Location</label>
                  <input
                    id="location"
                    value={userData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <button
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2 text-green-600 pt-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Profile updated successfully
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Work Information</h2>
              <p className="text-gray-600">
                Your role and department details
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Role
                    </p>
                    <p className="font-medium">
                      {userData.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Department
                    </p>
                    <p className="font-medium">
                      {userData.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Join Date
                    </p>
                    <p className="font-medium">
                      {userData.joinDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Last Login
                    </p>
                    <p className="font-medium text-sm">
                      {userData.lastLogin}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Security Settings</h2>
              <p className="text-gray-600">
                Manage your password and security preferences
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-500">
                      Last changed 30 days ago
                    </p>
                  </div>
                </div>
                <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
                  Change Password
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="text-green-600 font-medium">
                        Enabled
                      </span>{" "}
                      - Via Authenticator App
                    </p>
                  </div>
                </div>
                <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}