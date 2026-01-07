// import React, { useState, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Progress } from './ui/progress';
// import { Badge } from './ui/badge';
// import { Target, TrendingUp, Plus } from 'lucide-react';

// export default function SkillTracking() {
//   const mySkills = [
//     { name: 'React Development', level: 85, category: 'Technical', trend: 'up' },
//     { name: 'Leadership', level: 70, category: 'Soft Skills', trend: 'up' },
//     { name: 'Project Management', level: 60, category: 'Management', trend: 'stable' },
//     { name: 'Public Speaking', level: 45, category: 'Communication', trend: 'up' },
//     { name: 'Data Analysis', level: 55, category: 'Technical', trend: 'up' }
//   ];

//   const skillGaps = [
//     { skill: 'Machine Learning', importance: 'high', recommendedBy: 'Dr. Amanda Foster' },
//     { skill: 'Strategic Planning', importance: 'medium', recommendedBy: 'Robert Martinez' },
//     { skill: 'Team Building', importance: 'high', recommendedBy: 'HR Team' }
//   ];

//   const certifications = [
//     { name: 'AWS Solutions Architect', status: 'completed', date: '2024-11-15', provider: 'Amazon Web Services' },
//     { name: 'Scrum Master Certification', status: 'in-progress', date: 'Expected: 2025-01-30', provider: 'Scrum Alliance' },
//     { name: 'Leadership Excellence', status: 'planned', date: 'Planned for Q1 2025', provider: 'Internal Training' }
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl text-gray-900 mb-2">Skills & Competencies</h1>
//           <p className="text-gray-600">Track your skills, identify gaps, and plan development</p>
//         </div>
//         <Button className="bg-blue-600 hover:bg-blue-700">
//           <Plus className="size-4 mr-2" />
//           Add Skill
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid sm:grid-cols-4 gap-6">
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Total Skills</p>
//             <p className="text-3xl text-gray-900">{mySkills.length}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Avg. Proficiency</p>
//             <p className="text-3xl text-gray-900">
//               {Math.round(mySkills.reduce((sum, s) => sum + s.level, 0) / mySkills.length)}%
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Skill Gaps</p>
//             <p className="text-3xl text-gray-900">{skillGaps.length}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Certifications</p>
//             <p className="text-3xl text-gray-900">{certifications.length}</p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">
//         {/* My Skills */}
//         <Card>
//           <CardHeader>
//             <CardTitle>My Skills</CardTitle>
//             <CardDescription>Current skill levels and proficiency</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {mySkills.map((skill, index) => (
//                 <div key={index} className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm text-gray-900">{skill.name}</span>
//                       {skill.trend === 'up' && (
//                         <TrendingUp className="size-4 text-green-600" />
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
//                       <span className="text-sm text-gray-600">{skill.level}%</span>
//                     </div>
//                   </div>
//                   <Progress value={skill.level} className="h-2" />
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Skill Gaps */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Identified Skill Gaps</CardTitle>
//             <CardDescription>Skills recommended for your development</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {skillGaps.map((gap, index) => (
//                 <div key={index} className="p-4 border border-gray-200 rounded-lg">
//                   <div className="flex items-start justify-between mb-2">
//                     <h4 className="text-sm text-gray-900">{gap.skill}</h4>
//                     <Badge variant={gap.importance === 'high' ? 'destructive' : 'secondary'}>
//                       {gap.importance}
//                     </Badge>
//                   </div>
//                   <p className="text-xs text-gray-600 mb-3">Recommended by {gap.recommendedBy}</p>
//                   <Button size="sm" variant="outline" className="w-full">
//                     Start Learning
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Certifications */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Certifications & Credentials</CardTitle>
//               <CardDescription>Track your professional certifications</CardDescription>
//             </div>
//             <Button size="sm">Add Certification</Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="grid md:grid-cols-3 gap-4">
//             {certifications.map((cert, index) => (
//               <div key={index} className="p-4 border border-gray-200 rounded-lg">
//                 <Badge className={
//                   cert.status === 'completed' ? 'bg-green-100 text-green-700' :
//                   cert.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
//                   'bg-gray-100 text-gray-700'
//                 } variant="secondary">
//                   {cert.status}
//                 </Badge>
//                 <h4 className="text-sm text-gray-900 mt-3 mb-2">{cert.name}</h4>
//                 <p className="text-xs text-gray-600 mb-1">{cert.provider}</p>
//                 <p className="text-xs text-gray-500">{cert.date}</p>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }