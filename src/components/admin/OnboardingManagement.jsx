import React, { useState, useEffect } from 'react';

const BASE_URL = "http://127.0.0.1:8000";

// Reuse the same UI components from above (or import them from a shared file)
// For brevity, I'll include just the essential ones here

const Card = ({ children, className = '' }) => (
  <div className={`border rounded-lg shadow-sm ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children }) => <h2 className="text-2xl font-bold">{children}</h2>;
const CardDescription = ({ children }) => <p className="text-gray-600">{children}</p>;

const Button = ({ children, onClick, variant = 'default', className = '', disabled }) => {
  const base = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  return (
    <button 
      className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = '' }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`border rounded-md px-3 py-2 w-full ${className}`}
  />
);

const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">{children}</table>
  </div>
);

const TableHeader = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr className="border-b">{children}</tr>;
const TableHead = ({ children }) => <th className="text-left p-3 font-medium">{children}</th>;
const TableCell = ({ children }) => <td className="p-3">{children}</td>;

const Progress = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-blue-600 h-2 rounded-full" 
      style={{ width: `${value}%` }}
    />
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Icons as text for simplicity
const BookOpen = () => <span>📚</span>;
const Users = () => <span>👥</span>;
const TrendingUp = () => <span>📈</span>;
const CalendarDays = () => <span>📅</span>;
const Plus = () => <span>+</span>;
const Trash2 = () => <span>🗑️</span>;
const Edit = () => <span>✏️</span>;
const SearchIcon = () => <span>🔍</span>;

export default function OnboardingManagement() {
  const [activeTab, setActiveTab] = useState('modules');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [menteesSummary, setMenteesSummary] = useState([]);

  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        alert("Please log in to access onboarding management");
        return;
      }

      const response = await fetch(`${BASE_URL}/onboarding/modules/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setModules(data || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      alert("Failed to load onboarding modules");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/onboarding/modules/statistics/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchMenteesSummary = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/onboarding/progress/all-summary/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMenteesSummary(data.mentees || []);
      }
    } catch (error) {
      console.error('Error fetching mentees summary:', error);
    }
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to deactivate this module?')) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/onboarding/modules/${moduleId}/delete/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert("Module deactivated successfully");
        fetchModules();
      }
    } catch (error) {
      alert("Failed to delete module");
    }
  };

  useEffect(() => {
    if (activeTab === 'modules') {
      fetchModules();
      fetchStatistics();
    } else if (activeTab === 'mentees') {
      fetchMenteesSummary();
    }
  }, [activeTab]);

  const filteredModules = modules.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && activeTab === 'modules') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">⟳</div>
        <span className="ml-2">Loading onboarding modules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Management</h1>
          <p className="text-gray-600">Manage onboarding modules, track mentee progress, and monitor deadlines</p>
        </div>
        {/* <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus />
          <span className="ml-2">Create Module</span>
        </Button> */}
      </div>

      {/* Statistics */}
      {activeTab === 'modules' && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Modules</p>
                  <h3 className="text-2xl font-bold">{statistics.total_modules}</h3>
                </div>
                <BookOpen />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mentees with Modules</p>
                  <h3 className="text-2xl font-bold">{statistics.mentees_with_modules}</h3>
                </div>
                <Users />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <h3 className="text-2xl font-bold">{statistics.completion_rate}%</h3>
                </div>
                <TrendingUp />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            className={`pb-2 ${activeTab === 'modules' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('modules')}
          >
            <BookOpen />
            <span className="ml-2">Modules ({modules.length})</span>
          </button>
          <button
            className={`pb-2 ${activeTab === 'mentees' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('mentees')}
          >
            <Users />
            {/* <span className="ml-2">Mentees ({menteesSummary.length})</span> */}
            <span className="ml-2">Mentees</span>
          </button>
        </div>
      </div>

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <SearchIcon />
                <Input
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Onboarding Modules ({filteredModules.length})</CardTitle>
              <CardDescription>Manage and customize onboarding modules</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredModules.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No modules found. Try adjusting your search.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{module.title}</p>
                            <p className="text-sm text-gray-600">{module.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={module.module_type === 'core' ? 'default' : 'secondary'}>
                            {module.module_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{module.duration_minutes} min</TableCell>
                        <TableCell>{module.total_mentees_assigned || 0} mentees</TableCell>
                        <TableCell>
                          <Badge variant={module.is_active ? 'default' : 'outline'}>
                            {module.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteModule(module.id)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mentees Tab */}
      {activeTab === 'mentees' && (
        <Card>
          <CardHeader>
            <CardTitle>Mentees Summary ({menteesSummary.length})</CardTitle>
            <CardDescription>Track overall onboarding progress by mentee</CardDescription>
          </CardHeader>
          <CardContent>
            {menteesSummary.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No mentees found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Overall Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menteesSummary.map((mentee) => (
                    <TableRow key={mentee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{mentee.full_name}</p>
                          <p className="text-sm text-gray-600">{mentee.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{mentee.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>Total: {mentee.total_modules}</p>
                          <p className="text-sm text-gray-600">
                            Completed: {mentee.completed_modules}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Progress value={mentee.overall_progress_percentage} />
                          <p className="text-sm">{mentee.overall_progress_percentage}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {mentee.overall_progress_percentage === 100 ? (
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}