import { Search, UserPlus, Shield, Lock, Unlock, MoreVertical, AlertCircle } from "lucide-react";
import React, { useState } from "react";

// Mock data since mockUsers is not available
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    avatar: "JD",
    role: "Administrator",
    department: "IT",
    lastLogin: "2 hours ago",
    riskScore: 15,
    status: "active"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    avatar: "JS",
    role: "Manager",
    department: "Finance",
    lastLogin: "1 day ago",
    riskScore: 65,
    status: "active"
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.j@company.com",
    avatar: "RJ",
    role: "Employee",
    department: "Marketing",
    lastLogin: "3 days ago",
    riskScore: 35,
    status: "active"
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.w@company.com",
    avatar: "SW",
    role: "Contractor",
    department: "HR",
    lastLogin: "1 week ago",
    riskScore: 72,
    status: "suspended"
  },
  {
    id: 5,
    name: "Mike Brown",
    email: "mike.b@company.com",
    avatar: "MB",
    role: "Employee",
    department: "Operations",
    lastLogin: "4 hours ago",
    riskScore: 18,
    status: "active"
  },
  {
    id: 6,
    name: "Emily Davis",
    email: "emily.d@company.com",
    avatar: "ED",
    role: "Manager",
    department: "Sales",
    lastLogin: "Yesterday",
    riskScore: 42,
    status: "active"
  }
];

export function AccessControl() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskBadge = (score) => {
    if (score < 20) return (
      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
        Low Risk
      </div>
    );
    if (score < 50) return (
      <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
        Medium Risk
      </div>
    );
    return (
      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
        High Risk
      </div>
    );
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
          Active
        </div>
      );
    }
    return (
      <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
        Suspended
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Access Control Management</h1>
            <p className="text-gray-600">Manage user permissions and access levels</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center font-medium transition-colors">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
        
        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-800">Module Requirements:</p>
              <p className="text-gray-700">
                <strong>Access Control Management:</strong> Granular permission management system implementing 
                role-based access control (RBAC) with multi-level authorization. Features include user permission 
                matrices, resource-level access controls, temporary access grants, access review workflows, and 
                automated provisioning/de-provisioning. Tracks all access modifications with comprehensive audit 
                trails, supports least-privilege principles, and includes access certification campaigns for 
                compliance. Integrates with Active Directory/LDAP for centralized identity management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <h3 className="text-2xl font-bold">2,847</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Unlock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Access Granted</p>
              <h3 className="text-2xl font-bold">1,245</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <h3 className="text-2xl font-bold">23</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <h3 className="text-2xl font-bold">45</h3>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">User Directory</h2>
              <p className="text-gray-600">Manage user access and permissions</p>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search users..."
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Risk Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4">{user.department}</td>
                    <td className="py-3 px-4">{user.lastLogin}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{user.riskScore}</span>
                        {getRiskBadge(user.riskScore)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-3 px-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Multi-Factor Authentication</h2>
            <p className="text-gray-600">MFA adoption across organization</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Enabled</span>
              <span className="font-medium">2,421 users (85%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Not Enabled</span>
              <span>426 users (15%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Access Permissions</h2>
            <p className="text-gray-600">Permission levels distribution</p>
          </div>
          <div className="space-y-3">
            {[
              { level: "Administrator", count: 12, color: "bg-red-500" },
              { level: "Manager", count: 145, color: "bg-blue-500" },
              { level: "Employee", count: 2467, color: "bg-blue-500" },
              { level: "Contractor", count: 223, color: "bg-gray-500" }
            ].map((item) => (
              <div key={item.level} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="flex-1">{item.level}</span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}