// import React, { useState, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Progress } from './ui/progress';
// import { Calendar, Target, BookOpen, TrendingUp, Award, Clock, Star } from 'lucide-react';
// import { Badge } from './ui/badge';

// export default function MenteeDashboard() {
//   const stats = [
//     { label: 'Learning Goals', value: '6/8', icon: Target, color: 'text-blue-600', bgColor: 'bg-blue-100' },
//     { label: 'Sessions Completed', value: '12', icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100' },
//     { label: 'Articles Read', value: '28', icon: BookOpen, color: 'text-purple-600', bgColor: 'bg-purple-100' },
//     { label: 'Skills Gained', value: '5', icon: Award, color: 'text-orange-600', bgColor: 'bg-orange-100' }
//   ];

//   const myMentors = [
//     {
//       name: 'Dr. Amanda Foster',
//       avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
//       role: 'Senior Engineering Manager',
//       specialties: ['Leadership', 'Technical Skills'],
//       rating: 4.9,
//       nextSession: 'Dec 22 at 2:00 PM'
//     },
//     {
//       name: 'Robert Martinez',
//       avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
//       role: 'Product Director',
//       specialties: ['Product Strategy', 'Agile'],
//       rating: 4.8,
//       nextSession: 'Dec 24 at 10:00 AM'
//     }
//   ];

//   const learningGoals = [
//     { title: 'Master React Advanced Patterns', progress: 85, dueDate: 'Dec 31, 2025', status: 'on-track' },
//     { title: 'Leadership Skills Development', progress: 60, dueDate: 'Jan 15, 2026', status: 'on-track' },
//     { title: 'Public Speaking Confidence', progress: 40, dueDate: 'Feb 1, 2026', status: 'needs-attention' },
//     { title: 'Project Management Certification', progress: 30, dueDate: 'Mar 1, 2026', status: 'on-track' }
//   ];

//   const recommendedResources = [
//     {
//       title: 'Advanced React Patterns and Best Practices',
//       type: 'Article',
//       author: 'Dr. Amanda Foster',
//       readTime: '12 min',
//       category: 'Technical'
//     },
//     {
//       title: 'Effective Communication in Tech Teams',
//       type: 'Video',
//       author: 'Robert Martinez',
//       readTime: '25 min',
//       category: 'Soft Skills'
//     },
//     {
//       title: 'Career Growth Framework for Engineers',
//       type: 'Guide',
//       author: 'HR Team',
//       readTime: '18 min',
//       category: 'Career Development'
//     }
//   ];

//   const upcomingSessions = [
//     {
//       mentor: 'Dr. Amanda Foster',
//       topic: 'React Architecture Review',
//       date: 'Dec 22, 2025',
//       time: '2:00 PM - 3:00 PM',
//       type: 'Video Call'
//     },
//     {
//       mentor: 'Robert Martinez',
//       topic: 'Product Roadmap Planning',
//       date: 'Dec 24, 2025',
//       time: '10:00 AM - 11:00 AM',
//       type: 'In-Person'
//     }
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl text-gray-900 mb-2">My Learning Journey</h1>
//         <p className="text-gray-600">Track your progress and continue your professional development.</p>
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
//         {/* My Mentors */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>My Mentors</CardTitle>
//             <CardDescription>Connect with your assigned mentors</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {myMentors.map((mentor, index) => (
//                 <div key={index} className="p-4 border border-gray-200 rounded-lg">
//                   <div className="flex items-start gap-4">
//                     <img
//                       src={mentor.avatar}
//                       alt={mentor.name}
//                       className="w-16 h-16 rounded-full"
//                     />
//                     <div className="flex-1">
//                       <div className="flex items-start justify-between mb-2">
//                         <div>
//                           <p className="text-sm text-gray-900 mb-1">{mentor.name}</p>
//                           <p className="text-xs text-gray-600">{mentor.role}</p>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Star className="size-4 text-yellow-500 fill-yellow-500" />
//                           <span className="text-sm text-gray-900">{mentor.rating}</span>
//                         </div>
//                       </div>
                      
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {mentor.specialties.map((specialty, i) => (
//                           <Badge key={i} variant="secondary" className="text-xs">
//                             {specialty}
//                           </Badge>
//                         ))}
//                       </div>

//                       <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
//                         <div className="flex items-center gap-1">
//                           <Clock className="size-3" />
//                           <span>Next: {mentor.nextSession}</span>
//                         </div>
//                       </div>

//                       <div className="flex gap-2">
//                         <Button size="sm" variant="outline" className="flex-1">
//                           Message
//                         </Button>
//                         <Button size="sm" className="flex-1">
//                           Schedule Session
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//               <Button variant="outline" className="w-full">
//                 Find More Mentors
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Upcoming Sessions */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Upcoming Sessions</CardTitle>
//             <CardDescription>Your scheduled meetings</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {upcomingSessions.map((session, index) => (
//                 <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-sm text-gray-900 mb-1">{session.topic}</p>
//                   <p className="text-xs text-gray-600 mb-2">{session.mentor}</p>
//                   <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
//                     <Calendar className="size-3" />
//                     <span>{session.date}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
//                     <Clock className="size-3" />
//                     <span>{session.time}</span>
//                   </div>
//                   <Badge variant="secondary" className="text-xs">{session.type}</Badge>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Learning Goals */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Learning Goals</CardTitle>
//               <CardDescription>Track your development objectives</CardDescription>
//             </div>
//             <Button size="sm">Add Goal</Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {learningGoals.map((goal, index) => (
//               <div key={index} className="p-4 border border-gray-200 rounded-lg">
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex-1">
//                     <p className="text-sm text-gray-900 mb-1">{goal.title}</p>
//                     <p className="text-xs text-gray-600">Due: {goal.dueDate}</p>
//                   </div>
//                   <Badge variant={goal.status === 'on-track' ? 'default' : 'destructive'}>
//                     {goal.status === 'on-track' ? 'On Track' : 'Needs Attention'}
//                   </Badge>
//                 </div>
//                 <div>
//                   <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
//                     <span>Progress</span>
//                     <span>{goal.progress}%</span>
//                   </div>
//                   <Progress value={goal.progress} className="h-2" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recommended Resources */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recommended for You</CardTitle>
//           <CardDescription>Curated learning resources based on your goals</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid md:grid-cols-3 gap-4">
//             {recommendedResources.map((resource, index) => (
//               <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
//                 <Badge variant="secondary" className="mb-3">{resource.type}</Badge>
//                 <h4 className="text-sm text-gray-900 mb-2">{resource.title}</h4>
//                 <p className="text-xs text-gray-600 mb-2">By {resource.author}</p>
//                 <div className="flex items-center justify-between text-xs text-gray-500">
//                   <span>{resource.readTime}</span>
//                   <span className="text-blue-600">{resource.category}</span>
//                 </div>
//                 <Button size="sm" variant="outline" className="w-full mt-3">
//                   View Resource
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }