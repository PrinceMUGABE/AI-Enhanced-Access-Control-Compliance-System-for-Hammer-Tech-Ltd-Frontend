// import React, { useState, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { TrendingUp, Users, BookOpen, Award, Target, Activity } from 'lucide-react';
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// export default function LearningAnalytics() {
//   const engagementData = [
//     { month: 'Jan', users: 420, sessions: 680, articles: 1240 },
//     { month: 'Feb', users: 580, sessions: 920, articles: 1680 },
//     { month: 'Mar', users: 720, sessions: 1150, articles: 2120 },
//     { month: 'Apr', users: 890, sessions: 1420, articles: 2580 },
//     { month: 'May', users: 1050, sessions: 1680, articles: 3120 },
//     { month: 'Jun', users: 1247, sessions: 1980, articles: 3680 }
//   ];

//   const departmentEngagement = [
//     { department: 'Engineering', engagement: 92 },
//     { department: 'Product', engagement: 88 },
//     { department: 'Design', engagement: 85 },
//     { department: 'Marketing', engagement: 90 },
//     { department: 'Sales', engagement: 82 },
//     { department: 'HR', engagement: 95 }
//   ];

//   const learningCategories = [
//     { name: 'Technical Skills', value: 35 },
//     { name: 'Leadership', value: 25 },
//     { name: 'Soft Skills', value: 20 },
//     { name: 'Career Development', value: 15 },
//     { name: 'Other', value: 5 }
//   ];

//   const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

//   const completionRates = [
//     { week: 'Week 1', rate: 72 },
//     { week: 'Week 2', rate: 78 },
//     { week: 'Week 3', rate: 85 },
//     { week: 'Week 4', rate: 88 }
//   ];

//   const stats = [
//     { label: 'Total Learners', value: '2,847', change: '+12.5%', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
//     { label: 'Active Sessions', value: '1,980', change: '+23.1%', icon: Activity, color: 'text-green-600', bgColor: 'bg-green-100' },
//     { label: 'Completion Rate', value: '88%', change: '+5.2%', icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-100' },
//     { label: 'Avg. Engagement', value: '4.7/5', change: '+0.3', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100' }
//   ];

//   const topPerformers = [
//     { name: 'Sarah Johnson', department: 'Engineering', completions: 24, score: 4.9 },
//     { name: 'Michael Chen', department: 'Product', completions: 22, score: 4.8 },
//     { name: 'Emily Rodriguez', department: 'Marketing', completions: 21, score: 4.8 },
//     { name: 'David Kim', department: 'IT', completions: 20, score: 4.7 },
//     { name: 'Lisa Anderson', department: 'Design', completions: 19, score: 4.7 }
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl text-gray-900 mb-2">Learning Analytics</h1>
//         <p className="text-gray-600">Comprehensive insights into organizational learning and development</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <Card key={index}>
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
//                   <p className="text-3xl text-gray-900 mb-1">{stat.value}</p>
//                   <p className="text-sm text-green-600">{stat.change}</p>
//                 </div>
//                 <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
//                   <stat.icon className={`size-6 ${stat.color}`} />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Engagement Trends */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Engagement Trends</CardTitle>
//           <CardDescription>User activity, sessions, and article views over time</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={350}>
//             <AreaChart data={engagementData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
//               <Area type="monotone" dataKey="sessions" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
//               <Area type="monotone" dataKey="articles" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
//             </AreaChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>

//       <div className="grid lg:grid-cols-2 gap-6">
//         {/* Department Engagement */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Department Engagement</CardTitle>
//             <CardDescription>Engagement scores by department</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={departmentEngagement} layout="vertical">
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" domain={[0, 100]} />
//                 <YAxis dataKey="department" type="category" width={100} />
//                 <Tooltip />
//                 <Bar dataKey="engagement" fill="#3b82f6" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Learning Categories */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Learning Categories</CardTitle>
//             <CardDescription>Distribution of learning content by category</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={learningCategories}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={100}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {learningCategories.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* Completion Rates */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Weekly Completion Rates</CardTitle>
//             <CardDescription>Goal completion trends over the past month</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={250}>
//               <LineChart data={completionRates}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="week" />
//                 <YAxis domain={[0, 100]} />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} name="Completion Rate %" />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Top Performers */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Top Performers</CardTitle>
//             <CardDescription>Most engaged learners</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {topPerformers.map((performer, index) => (
//                 <div key={index} className="flex items-center gap-3">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                     <span className="text-sm text-blue-600">{index + 1}</span>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm text-gray-900 truncate">{performer.name}</p>
//                     <p className="text-xs text-gray-600">{performer.department}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-900">{performer.completions}</p>
//                     <div className="flex items-center gap-1">
//                       <Award className="size-3 text-yellow-500" />
//                       <span className="text-xs text-gray-600">{performer.score}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }