// components/admin/MentorshipDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// API
import { getMentorship, getMentorshipProgress } from '../../services/api';

// Icons can be kept or removed. If you want to keep them, install lucide-react
// If you want to remove icon dependencies, replace with text or emojis
import { 
  ArrowLeft, Calendar, MessageCircle, Video, Phone, 
  FileText, Users, Target, Star, Clock, TrendingUp,
  Edit, Trash2, RefreshCw, ExternalLink, Download, MoreVertical
} from 'lucide-react';

export default function MentorshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentorship, setMentorship] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMentorship();
  }, [id]);

  const fetchMentorship = async () => {
    try {
      setLoading(true);
      const [mentorshipData, progressData] = await Promise.all([
        getMentorship(id),
        getMentorshipProgress(id)
      ]);
      setMentorship(mentorshipData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching mentorship:', error);
      // Toast replacement
      alert('Failed to load mentorship details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderBottom: '2px solid #2563eb',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#4b5563', fontWeight: '500' }}>
            Loading mentorship details...
          </p>
        </div>
      </div>
    );
  }

  if (!mentorship) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Users style={{ height: '48px', width: '48px', color: '#d1d5db', margin: '0 auto 16px auto' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
          Mentorship Not Found
        </h3>
        <p style={{ color: '#4b5563', marginBottom: '24px' }}>
          The mentorship you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/admin/mentorships')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <ArrowLeft style={{ height: '16px', width: '16px', marginRight: '8px' }} />
          Back to Mentorships
        </button>
      </div>
    );
  }

  // Helper function for badges
  const Badge = ({ children, variant = 'default', className = '' }) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '14px',
      fontWeight: '500',
    };

    const styles = {
      default: {
        backgroundColor: '#e5e7eb',
        color: '#374151',
        border: '1px solid #d1d5db'
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#374151',
        border: '1px solid #d1d5db'
      },
      blue: {
        backgroundColor: '#dbeafe',
        color: '#1e40af'
      }
    };

    return (
      <span style={{ ...baseStyle, ...styles[variant === 'outline' ? 'outline' : 'default'] }} className={className}>
        {children}
      </span>
    );
  };

  // Progress bar component
  const ProgressBar = ({ value, className = '' }) => {
    return (
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginTop: '16px'
      }}>
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    );
  };

  // Card components
  const Card = ({ children, className = '' }) => {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }} className={className}>
        {children}
      </div>
    );
  };

  const CardHeader = ({ children }) => {
    return (
      <div style={{ padding: '24px 24px 0 24px' }}>
        {children}
      </div>
    );
  };

  const CardTitle = ({ children }) => {
    return (
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
        {children}
      </h3>
    );
  };

  const CardDescription = ({ children }) => {
    return (
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
        {children}
      </p>
    );
  };

  const CardContent = ({ children, className = '' }) => {
    return (
      <div style={{ padding: '24px' }} className={className}>
        {children}
      </div>
    );
  };

  // Button component
  const Button = ({ children, variant = 'default', size = 'default', onClick, className = '' }) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: size === 'sm' ? '6px 12px' : '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s'
    };

    const styles = {
      default: {
        backgroundColor: '#3b82f6',
        color: 'white'
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#374151',
        border: '1px solid #d1d5db'
      }
    };

    return (
      <button
        style={{ ...baseStyle, ...styles[variant] }}
        onClick={onClick}
        className={className}
      >
        {children}
      </button>
    );
  };

  // Tabs components
  const Tabs = ({ children, defaultValue }) => {
    return <div>{children}</div>;
  };

  const TabsList = ({ children }) => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '24px'
      }}>
        {children}
      </div>
    );
  };

  const TabsTrigger = ({ children, value, onClick }) => {
    const isActive = activeTab === value;
    return (
      <button
        onClick={() => {
          setActiveTab(value);
          if (onClick) onClick();
        }}
        style={{
          padding: '8px 16px',
          backgroundColor: isActive ? '#3b82f6' : 'transparent',
          color: isActive ? 'white' : '#374151',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center'
        }}
      >
        {children}
      </button>
    );
  };

  const TabsContent = ({ children, value }) => {
    if (activeTab !== value) return null;
    return <div>{children}</div>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/mentorships')}>
            <ArrowLeft style={{ height: '16px', width: '16px' }} />
          </Button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              {mentorship.mentor.full_name} → {mentorship.mentee.full_name}
            </h1>
            <p style={{ color: '#4b5563' }}>{mentorship.program.name}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={() => navigate(`/chat/mentorship/${id}`)}>
            <MessageCircle style={{ height: '16px', width: '16px', marginRight: '8px' }} />
            Open Chat
          </Button>
          <Button onClick={() => navigate(`/admin/mentorships/${id}/edit`)}>
            <Edit style={{ height: '16px', width: '16px', marginRight: '8px' }} />
            Edit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px'
      }}>
        <Card>
          <CardContent style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>Progress</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {mentorship.progress_percentage}%
                </p>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '9999px' }}>
                <TrendingUp style={{ height: '24px', width: '24px', color: '#2563eb' }} />
              </div>
            </div>
            <ProgressBar value={mentorship.progress_percentage} />
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>Sessions</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {mentorship.sessions_completed}/{mentorship.program.total_sessions}
                </p>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#d1fae5', borderRadius: '9999px' }}>
                <Calendar style={{ height: '24px', width: '24px', color: '#059669' }} />
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              {mentorship.remaining_sessions} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>Rating</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Star style={{ height: '20px', width: '20px', color: '#f59e0b', fill: '#f59e0b', marginRight: '8px' }} />
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                    {mentorship.rating ? mentorship.rating.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '9999px' }}>
                <Star style={{ height: '24px', width: '24px', color: '#d97706' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>Duration</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {mentorship.duration_days} days
                </p>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f3e8ff', borderRadius: '9999px' }}>
                <Clock style={{ height: '24px', width: '24px', color: '#7c3aed' }} />
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              Started: {new Date(mentorship.start_date).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" onClick={() => setActiveTab('overview')}>Overview</TabsTrigger>
          <TabsTrigger value="sessions" onClick={() => setActiveTab('sessions')}>Sessions</TabsTrigger>
          <TabsTrigger value="goals" onClick={() => setActiveTab('goals')}>Goals</TabsTrigger>
          <TabsTrigger value="activity" onClick={() => setActiveTab('activity')}>Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Participants Card */}
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>Mentor and mentee information</CardDescription>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Mentor */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: '600', fontSize: '18px' }}>
                      {mentorship.mentor.full_name.charAt(0)}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: '600', color: '#111827' }}>{mentorship.mentor.full_name}</h3>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>
                      {mentorship.mentor.role} • {mentorship.mentor.department}
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{mentorship.mentor.email}</p>
                  </div>
                  <Badge variant="outline">Mentor</Badge>
                </div>

                {/* Mentee */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#d1fae5',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#059669', fontWeight: '600', fontSize: '18px' }}>
                      {mentorship.mentee.full_name.charAt(0)}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: '600', color: '#111827' }}>{mentorship.mentee.full_name}</h3>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>
                      {mentorship.mentee.role} • {mentorship.mentee.department}
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{mentorship.mentee.email}</p>
                  </div>
                  <Badge variant="outline">Mentee</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Program Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Program Details</CardTitle>
                <CardDescription>{mentorship.program.name}</CardDescription>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>Department</p>
                    <p style={{ fontWeight: '500', color: '#111827' }}>{mentorship.program.department}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>Duration</p>
                    <p style={{ fontWeight: '500', color: '#111827' }}>{mentorship.program.total_days} days</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>Total Sessions</p>
                    <p style={{ fontWeight: '500', color: '#111827' }}>{mentorship.program.total_sessions}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>Status</p>
                    <Badge className="bg-blue-100 text-blue-700">
                      {mentorship.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Description</p>
                  <p style={{ color: '#111827' }}>{mentorship.program.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* You can add other tab contents here for Sessions, Goals, Activity */}
        <TabsContent value="sessions">
          <Card>
            <CardContent>
              <p>Sessions content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals">
          <Card>
            <CardContent>
              <p>Goals content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardContent>
              <p>Activity content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (min-width: 768px) {
          div[style*="gridTemplateColumns: '1fr'"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (min-width: 1024px) {
          div[style*="gridTemplateColumns: '1fr'"] {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}