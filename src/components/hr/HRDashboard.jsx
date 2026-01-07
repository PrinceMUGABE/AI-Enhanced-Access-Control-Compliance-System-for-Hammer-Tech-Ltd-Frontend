import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera, Mail, Phone, MapPin, Briefcase, Award, Save, Edit } from 'lucide-react';

export default function HRDashboard() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.full_name || user?.name || '',
    email: user?.email || '',
    work_mail_address: user?.work_mail_address || '',
    phone: user?.phone_number || '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    department: user?.department || '',
    role: user?.role || 'mentee',
    bio: 'Passionate software engineer with 5 years of experience in full-stack development. Currently focusing on React and Node.js.',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
    interests: ['Machine Learning', 'Leadership', 'Product Management']
  });

  const handleSave = () => {
    // In production, this would call an API
    setIsEditing(false);
    // Here you would update the user data in the backend
    console.log('Saving profile data:', formData);
  };

  const achievements = [
    { title: 'First Session Complete', description: 'Completed your first mentorship session', icon: Award, date: 'Dec 2024' },
    { title: 'Knowledge Contributor', description: 'Added 10 articles to knowledge base', icon: Award, date: 'Nov 2024' },
    { title: 'Early Adopter', description: 'One of the first 100 users on the platform', icon: Award, date: 'Oct 2024' }
  ];

  const activityHistory = [
    { action: 'Completed mentorship session with Dr. Amanda Foster', date: '2 hours ago' },
    { action: 'Uploaded article: "React Best Practices"', date: '1 day ago' },
    { action: 'Achieved learning goal: Master React Hooks', date: '3 days ago' },
    { action: 'Started new mentorship with Robert Martinez', date: '1 week ago' },
    { action: 'Completed skill assessment: TypeScript', date: '2 weeks ago' }
  ];

  // Function to handle user data from backend
  const getUserDisplayInfo = () => {
    return {
      displayName: user?.full_name || user?.name || 'User',
      displayEmail: user?.work_mail_address || user?.email || '',
      displayRole: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User',
      displayDepartment: user?.department || 'Not specified'
    };
  };

  const { displayName, displayEmail, displayRole, displayDepartment } = getUserDisplayInfo();

  return (
    <div className="space-y-6 max-w-5xl p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b">
        <div className="flex space-x-4">
          <button className="px-4 py-2 font-medium border-b-2 border-blue-500 text-blue-600">
            Profile
          </button>
          <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">
            Activity
          </button>
          <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">
            Achievements
          </button>
          <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">
            Settings
          </button>
        </div>
      </div>

      {/* Profile Tab Content */}
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-600">Update your profile details and public information</p>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="size-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="size-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">
                    {displayName.charAt(0)}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center p-0">
                    <Camera className="size-4" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{displayName}</h3>
                <p className="text-sm text-gray-600 mb-2">{displayRole}</p>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                  {displayDepartment || 'No department'}
                </span>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="work_mail_address" className="text-sm font-medium text-gray-700">Work Email Address</label>
                <div className="relative">
                  <Mail className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="work_mail_address"
                    type="email"
                    value={formData.work_mail_address}
                    onChange={(e) => setFormData({ ...formData, work_mail_address: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-gray-700">Location</label>
                <div className="relative">
                  <MapPin className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium text-gray-700">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">Role Type</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={true} // Role cannot be changed by user
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
                >
                  <option value="mentee">Mentee</option>
                  <option value="mentor">Mentor</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Skills</label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
                {isEditing && (
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    + Add Skill
                  </button>
                )}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Interests</label>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <span key={index} className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-full">
                    {interest}
                  </span>
                ))}
                {isEditing && (
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    + Add Interest
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity History Card (would be conditionally rendered based on active tab) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Activity History</h2>
          <p className="text-gray-600">Your recent platform activity and interactions</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activityHistory.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Achievements & Badges</h2>
          <p className="text-gray-600">Your accomplishments and milestones</p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <achievement.icon className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{achievement.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                    <p className="text-xs text-gray-500">{achievement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-gray-600">Manage your account preferences and security</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Change Password</h4>
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="Current password" 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="password" 
                placeholder="New password" 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="password" 
                placeholder="Confirm new password" 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Update Password
              </button>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Preferences</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span className="text-sm text-gray-700">Email notifications for new messages</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span className="text-sm text-gray-700">Reminders for upcoming sessions</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-blue-600" />
                <span className="text-sm text-gray-700">Weekly progress reports</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h4 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
            <p className="text-sm text-gray-600 mb-4">Once you delete your account, there is no going back.</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}