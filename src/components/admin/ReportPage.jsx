// import React, { useState, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { Button } from '../ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { FileText, Download, Calendar, Filter } from 'lucide-react';
// import { Badge } from '../ui/badge';

// export default function ReportsPage() {
//   const reports = [
//     { id: '1', name: 'Monthly Mentorship Report', type: 'Mentorship', generated: '2024-12-18', format: 'PDF', size: '2.4 MB' },
//     { id: '2', name: 'Employee Engagement Analytics', type: 'Analytics', generated: '2024-12-15', format: 'XLSX', size: '1.8 MB' },
//     { id: '3', name: 'Onboarding Progress Summary', type: 'Onboarding', generated: '2024-12-10', format: 'PDF', size: '1.2 MB' },
//     { id: '4', name: 'Knowledge Repository Metrics', type: 'Knowledge', generated: '2024-12-05', format: 'PDF', size: '3.1 MB' },
//     { id: '5', name: 'Skill Development Tracking', type: 'Skills', generated: '2024-12-01', format: 'XLSX', size: '2.7 MB' }
//   ];

//   const reportTemplates = [
//     { name: 'Mentorship Performance', description: 'Detailed analysis of mentorship programs', icon: '👥' },
//     { name: 'Learning Outcomes', description: 'Skills gained and certifications completed', icon: '📚' },
//     { name: 'Engagement Metrics', description: 'Platform usage and user activity', icon: '📊' },
//     { name: 'Department Breakdown', description: 'Performance by department', icon: '🏢' }
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl text-gray-900 mb-2">Reports & Analytics</h1>
//           <p className="text-gray-600">Generate and download custom reports</p>
//         </div>
//         <Button className="bg-blue-600 hover:bg-blue-700">
//           <FileText className="size-4 mr-2" />
//           Generate Report
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid sm:grid-cols-4 gap-6">
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Total Reports</p>
//             <p className="text-3xl text-gray-900">{reports.length}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">This Month</p>
//             <p className="text-3xl text-gray-900">12</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Downloads</p>
//             <p className="text-3xl text-gray-900">147</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Scheduled</p>
//             <p className="text-3xl text-gray-900">8</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Report Templates */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Report Templates</CardTitle>
//           <CardDescription>Quick access to commonly used report formats</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {reportTemplates.map((template, index) => (
//               <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
//                 <div className="text-4xl mb-3">{template.icon}</div>
//                 <h3 className="text-sm text-gray-900 mb-2">{template.name}</h3>
//                 <p className="text-xs text-gray-600 mb-3">{template.description}</p>
//                 <Button size="sm" variant="outline" className="w-full">
//                   Generate
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Filters */}
//       <Card>
//         <CardContent className="p-6">
//           <div className="grid md:grid-cols-4 gap-4">
//             <Select>
//               <SelectTrigger>
//                 <SelectValue placeholder="Report Type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Types</SelectItem>
//                 <SelectItem value="mentorship">Mentorship</SelectItem>
//                 <SelectItem value="analytics">Analytics</SelectItem>
//                 <SelectItem value="onboarding">Onboarding</SelectItem>
//                 <SelectItem value="knowledge">Knowledge</SelectItem>
//                 <SelectItem value="skills">Skills</SelectItem>
//               </SelectContent>
//             </Select>
//             <Select>
//               <SelectTrigger>
//                 <SelectValue placeholder="Format" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Formats</SelectItem>
//                 <SelectItem value="pdf">PDF</SelectItem>
//                 <SelectItem value="xlsx">Excel</SelectItem>
//                 <SelectItem value="csv">CSV</SelectItem>
//               </SelectContent>
//             </Select>
//             <Select>
//               <SelectTrigger>
//                 <SelectValue placeholder="Date Range" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="week">Last Week</SelectItem>
//                 <SelectItem value="month">Last Month</SelectItem>
//                 <SelectItem value="quarter">Last Quarter</SelectItem>
//                 <SelectItem value="year">Last Year</SelectItem>
//               </SelectContent>
//             </Select>
//             <Button variant="outline">
//               <Filter className="size-4 mr-2" />
//               Apply Filters
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Reports */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Reports</CardTitle>
//           <CardDescription>View and download previously generated reports</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-3">
//             {reports.map((report) => (
//               <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <FileText className="size-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-900 mb-1">{report.name}</p>
//                     <div className="flex items-center gap-2 text-xs text-gray-600">
//                       <Badge variant="secondary">{report.type}</Badge>
//                       <span>•</span>
//                       <Calendar className="size-3" />
//                       <span>{report.generated}</span>
//                       <span>•</span>
//                       <span>{report.size}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button size="sm" variant="outline">
//                     Preview
//                   </Button>
//                   <Button size="sm">
//                     <Download className="size-4 mr-1" />
//                     Download
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