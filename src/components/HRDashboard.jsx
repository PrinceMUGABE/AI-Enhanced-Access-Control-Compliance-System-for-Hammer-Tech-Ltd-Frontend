import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, UserPlus, TrendingUp, Award, Clock, CheckCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from './ui/button';

export default function HRDashboard() {
  const stats = [
    { label: 'Total Employees', value: '2,847', change: '+12.5%', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Onboarding Pipeline', value: '24', change: '+8 this week', icon: UserPlus, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Avg. Engagement Score', value: '87%', change: '+5.2%', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { label: 'Certifications', value: '342', change: '+28 this month', icon: Award, color: 'text-orange-600', bgColor: 'bg-orange-100' }
  ];

  const retentionData = [
    { month: 'Jan', retention: 92, engagement: 78 },
    { month: 'Feb', retention: 93, engagement: 80 },
    { month: 'Mar', retention: 91, engagement: 82 },
    { month: 'Apr', retention: 94, engagement: 85 },
    { month: 'May', retention: 95, engagement: 87 },
    { month: 'Jun', retention: 96, engagement: 89 }
  ];

  const departmentPerformance = [
    { department: 'Engineering', completion: 92, satisfaction: 88 },
    { department: 'Sales', completion: 88, satisfaction: 85 },
    { department: 'Marketing', completion: 95, satisfaction: 92 },
    { department: 'Finance', completion: 85, satisfaction: 82 },
    { department: 'HR', completion: 98, satisfaction: 95 },
    { department: 'Operations', completion: 90, satisfaction: 87 }
  ];

  const onboardingStatus = [
    { name: 'Alex Thompson', role: 'Software Engineer', department: 'Engineering', progress: 85, daysLeft: 3, status: 'on-track' },
    { name: 'Maria Garcia', role: 'Product Manager', department: 'Product', progress: 65, daysLeft: 8, status: 'on-track' },
    { name: 'James Wilson', role: 'Sales Rep', department: 'Sales', progress: 45, daysLeft: 12, status: 'needs-attention' },
    { name: 'Lisa Chen', role: 'Designer', department: 'Design', progress: 92, daysLeft: 2, status: 'on-track' }
  ];

  const upcomingReviews = [
    { employee: 'Sarah Johnson', type: '90-Day Review', date: 'Dec 22', department: 'Engineering' },
    { employee: 'Michael Brown', type: 'Annual Review', date: 'Dec 24', department: 'Marketing' },
    { employee: 'Emily Davis', type: 'Performance Check-in', date: 'Dec 26', department: 'Sales' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900 mb-2">HR Dashboard</h1>
        <p className="text-gray-600">Monitor employee development, engagement, and organizational health.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Retention & Engagement Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Retention & Engagement Trends</CardTitle>
            <CardDescription>Employee retention and engagement scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="retention" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reviews</CardTitle>
            <CardDescription>Scheduled employee evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReviews.map((review, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-900 mb-1">{review.employee}</p>
                  <p className="text-xs text-gray-600 mb-2">{review.department}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600">{review.type}</span>
                    <span className="text-xs text-gray-600">{review.date}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                View All Reviews
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Training completion and satisfaction by department</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completion" fill="#3b82f6" name="Completion Rate %" />
              <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Onboarding Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Onboarding</CardTitle>
              <CardDescription>New hire onboarding progress tracking</CardDescription>
            </div>
            <Button size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingStatus.map((person, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-900 mb-1">{person.name}</p>
                    <p className="text-xs text-gray-600">{person.role} • {person.department}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      person.status === 'on-track' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <CheckCircle className="size-3" />
                      {person.status === 'on-track' ? 'On Track' : 'Needs Attention'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Onboarding Progress</span>
                    <span>{person.progress}% • {person.daysLeft} days left</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${person.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Send Reminder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}