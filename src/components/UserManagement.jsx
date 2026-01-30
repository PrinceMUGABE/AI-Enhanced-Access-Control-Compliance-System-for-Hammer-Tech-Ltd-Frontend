import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  AlertCircle,
  X,
  CheckCircle,
  Mail,
  Briefcase,
  Building2
} from "lucide-react";

// Mock data since imports aren't available
const mockUsers = [
  { 
    id: 1,
    name: "John Doe", 
    email: "john.doe@company.com",
    role: "System Administrator",
    department: "IT Security",
    status: "active",
    lastLogin: "2 hours ago",
    riskScore: 15,
    avatar: "JD"
  },
  { 
    id: 2,
    name: "Jane Smith", 
    email: "jane.smith@company.com",
    role: "Compliance Officer",
    department: "Legal & Compliance",
    status: "active",
    lastLogin: "1 day ago",
    riskScore: 65,
    avatar: "JS"
  },
  { 
    id: 3,
    name: "Robert Johnson", 
    email: "robert.j@company.com",
    role: "Security Analyst",
    department: "IT Security",
    status: "active",
    lastLogin: "3 days ago",
    riskScore: 35,
    avatar: "RJ"
  },
  { 
    id: 4,
    name: "Sarah Williams", 
    email: "sarah.w@company.com",
    role: "HR Manager",
    department: "Human Resources",
    status: "suspended",
    lastLogin: "1 week ago",
    riskScore: 72,
    avatar: "SW"
  },
  { 
    id: 5,
    name: "Mike Brown", 
    email: "mike.b@company.com",
    role: "Senior Developer",
    department: "Engineering",
    status: "active",
    lastLogin: "4 hours ago",
    riskScore: 18,
    avatar: "MB"
  }
];

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const newUser = {
      id: users.length + 1,
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      department: formData.get('department'),
      status: "active",
      lastLogin: "Never",
      riskScore: 0,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
    };
    setUsers([...users, newUser]);
    setShowAddModal(false);
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Active</div>;
    }
    return <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Suspended</div>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header with Requirements */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage user accounts, roles, permissions, and access controls
            </p>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center font-medium transition-colors w-full md:w-auto"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
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
                <strong>User Management & Identity Administration:</strong> Centralized user lifecycle management 
                including user creation, modification, suspension, and deletion. Implements role-based access 
                control (RBAC) with granular permission management. Features include bulk user operations, 
                automated onboarding/offboarding workflows, user activity monitoring, and comprehensive audit 
                trails for all user-related changes ensuring compliance with identity governance policies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center font-medium transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-2xl font-bold">{users.filter(u => u.status === 'suspended').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administrators</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role.includes('Administrator')).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">All Users ({filteredUsers.length})</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{user.name}</p>
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{user.role}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{user.department}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    className="border border-red-200 hover:bg-red-50 text-red-600 px-3 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Add New User</h2>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => setShowAddModal(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1">Create a new user account</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block font-medium">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Uwimana Jean Claude"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block font-medium">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="j.uwimana@hammertech.rw"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="block font-medium">Role</label>
                  <select
                    id="role"
                    name="role"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="System Administrator">System Administrator</option>
                    <option value="Compliance Officer">Compliance Officer</option>
                    <option value="Security Analyst">Security Analyst</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Senior Developer">Senior Developer</option>
                    <option value="Project Manager">Project Manager</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="block font-medium">Department</label>
                  <select
                    id="department"
                    name="department"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="IT Security">IT Security</option>
                    <option value="Legal & Compliance">Legal & Compliance</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Edit User</h2>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => setSelectedUser(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1">Update user information</p>
            </div>
            <div className="p-6">
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                setSelectedUser(null);
              }}>
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="block font-medium">Full Name</label>
                  <input
                    id="edit-name"
                    defaultValue={selectedUser.name}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-email" className="block font-medium">Email</label>
                  <input
                    id="edit-email"
                    type="email"
                    defaultValue={selectedUser.email}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-role" className="block font-medium">Role</label>
                  <select
                    id="edit-role"
                    defaultValue={selectedUser.role}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="System Administrator">System Administrator</option>
                    <option value="Compliance Officer">Compliance Officer</option>
                    <option value="Security Analyst">Security Analyst</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Senior Developer">Senior Developer</option>
                    <option value="Project Manager">Project Manager</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-status" className="block font-medium">Status</label>
                  <select
                    id="edit-status"
                    defaultValue={selectedUser.status}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={() => setSelectedUser(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}