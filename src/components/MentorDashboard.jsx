// import React, { useState, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Calendar, Users, Clock, Star, MessageCircle, Video, CheckCircle, AlertCircle } from 'lucide-react';
// import { Badge } from './ui/badge';

// export default function MentorDashboard() {
//   const stats = [
//     { label: 'Active Mentees', value: '8', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
//     { label: 'Sessions This Month', value: '24', icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100' },
//     { label: 'Hours Contributed', value: '36', icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-100' },
//     { label: 'Average Rating', value: '4.8', icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
//   ];

//   const upcomingSessions = [
//     {
//       mentee: 'Sarah Johnson',
//       avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
//       topic: 'Career Development Planning',
//       date: 'Today',
//       time: '2:00 PM - 3:00 PM',
//       type: 'video'
//     },
//     {
//       mentee: 'Michael Chen',
//       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
//       topic: 'Technical Skills Assessment',
//       date: 'Tomorrow',
//       time: '10:00 AM - 11:00 AM',
//       type: 'video'
//     },
//     {
//       mentee: 'Emily Rodriguez',
//       avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
//       topic: 'Leadership Workshop',
//       date: 'Dec 23',
//       time: '3:00 PM - 4:00 PM',
//       type: 'in-person'
//     }
//   ];

//   const activeMentees = [
//     {
//       name: 'Sarah Johnson',
//       avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
//       department: 'Engineering',
//       progress: 75,
//       nextSession: 'Today at 2:00 PM',
//       status: 'on-track'
//     },
//     {
//       name: 'Michael Chen',
//       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
//       department: 'Product',
//       progress: 60,
//       nextSession: 'Tomorrow at 10:00 AM',
//       status: 'on-track'
//     },
//     {
//       name: 'Emily Rodriguez',
//       avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
//       department: 'Marketing',
//       progress: 45,
//       nextSession: 'Dec 23 at 3:00 PM',
//       status: 'needs-attention'
//     },
//     {
//       name: 'David Kim',
//       avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
//       department: 'Sales',
//       progress: 85,
//       nextSession: 'Dec 24 at 11:00 AM',
//       status: 'on-track'
//     }
//   ];

//   const pendingActions = [
//     { text: 'Review session feedback from Sarah Johnson', urgent: true },
//     { text: 'Prepare materials for tomorrow\'s technical assessment', urgent: true },
//     { text: 'Update mentee progress reports', urgent: false },
//     { text: 'Schedule next month\'s sessions', urgent: false }
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl text-gray-900 mb-2">Mentor Dashboard</h1>
//         <p className="text-gray-600">Manage your mentees and track your mentorship impact.</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <Card key={index}>
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
//                   <p className="text-3xl text-gray-900">{stat.value}</p>
//                 </div>
//                 <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
//                   <stat.icon className={`size-6 ${stat.color}`} />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* Upcoming Sessions */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Upcoming Sessions</CardTitle>
//                 <CardDescription>Your scheduled mentorship sessions</CardDescription>
//               </div>
//               <Button size="sm">Schedule New</Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {upcomingSessions.map((session, index) => (
//                 <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
//                   <img
//                     src={session.avatar}
//                     alt={session.mentee}
//                     className="w-12 h-12 rounded-full"
//                   />
//                   <div className="flex-1">
//                     <div className="flex items-start justify-between mb-1">
//                       <div>
//                         <p className="text-sm text-gray-900">{session.mentee}</p>
//                         <p className="text-sm text-gray-600">{session.topic}</p>
//                       </div>
//                       <Badge variant={session.type === 'video' ? 'default' : 'secondary'} className="ml-2">
//                         {session.type === 'video' ? <Video className="size-3 mr-1" /> : <Users className="size-3 mr-1" />}
//                         {session.type}
//                       </Badge>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       {session.date} • {session.time}
//                     </p>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button size="sm" variant="outline">
//                       <MessageCircle className="size-4" />
//                     </Button>
//                     <Button size="sm">Join</Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Pending Actions */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Pending Actions</CardTitle>
//             <CardDescription>Tasks requiring your attention</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {pendingActions.map((action, index) => (
//                 <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${action.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
//                   {action.urgent ? (
//                     <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
//                   ) : (
//                     <CheckCircle className="size-5 text-gray-400 flex-shrink-0 mt-0.5" />
//                   )}
//                   <p className="text-sm text-gray-900">{action.text}</p>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Active Mentees */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Active Mentees</CardTitle>
//           <CardDescription>Monitor progress and engagement of your mentees</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid md:grid-cols-2 gap-4">
//             {activeMentees.map((mentee, index) => (
//               <div key={index} className="p-4 border border-gray-200 rounded-lg">
//                 <div className="flex items-start gap-3 mb-3">
//                   <img
//                     src={mentee.avatar}
//                     alt={mentee.name}
//                     className="w-12 h-12 rounded-full"
//                   />
//                   <div className="flex-1">
//                     <div className="flex items-center justify-between mb-1">
//                       <p className="text-sm text-gray-900">{mentee.name}</p>
//                       <Badge variant={mentee.status === 'on-track' ? 'default' : 'destructive'}>
//                         {mentee.status === 'on-track' ? 'On Track' : 'Needs Attention'}
//                       </Badge>
//                     </div>
//                     <p className="text-xs text-gray-600">{mentee.department}</p>
//                   </div>
//                 </div>
                
//                 <div className="space-y-2">
//                   <div>
//                     <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
//                       <span>Progress</span>
//                       <span>{mentee.progress}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div 
//                         className="bg-blue-600 h-2 rounded-full" 
//                         style={{ width: `${mentee.progress}%` }}
//                       ></div>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-gray-600">Next Session:</span>
//                     <span className="text-gray-900">{mentee.nextSession}</span>
//                   </div>
//                 </div>

//                 <div className="flex gap-2 mt-3">
//                   <Button size="sm" variant="outline" className="flex-1">
//                     <MessageCircle className="size-4 mr-1" />
//                     Message
//                   </Button>
//                   <Button size="sm" variant="outline" className="flex-1">
//                     View Profile
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
