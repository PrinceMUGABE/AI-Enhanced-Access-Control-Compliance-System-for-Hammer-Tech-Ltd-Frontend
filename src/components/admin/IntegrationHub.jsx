
// import React, { useState, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { Button } from '../ui/button';
// import { Badge } from '../ui/badge';
// import { CheckCircle, AlertCircle, Settings, ExternalLink } from 'lucide-react';

// export default function IntegrationHub() {
//   const integrations = [
//     { id: '1', name: 'Slack', description: 'Team communication and notifications', status: 'connected', icon: '💬', lastSync: '2 minutes ago' },
//     { id: '2', name: 'Microsoft Teams', description: 'Video conferencing and collaboration', status: 'connected', icon: '📹', lastSync: '5 minutes ago' },
//     { id: '3', name: 'Google Calendar', description: 'Automated session scheduling', status: 'connected', icon: '📅', lastSync: '10 minutes ago' },
//     { id: '4', name: 'Zoom', description: 'Virtual mentorship sessions', status: 'connected', icon: '🎥', lastSync: '15 minutes ago' },
//     { id: '5', name: 'HRIS System', description: 'Employee data synchronization', status: 'disconnected', icon: '👥', lastSync: 'Never' },
//     { id: '6', name: 'LinkedIn Learning', description: 'Training content integration', status: 'available', icon: '🎓', lastSync: 'Not connected' }
//   ];

//   const apiStats = [
//     { label: 'API Calls Today', value: '12,847' },
//     { label: 'Success Rate', value: '99.9%' },
//     { label: 'Avg Response Time', value: '124ms' },
//     { label: 'Active Webhooks', value: '8' }
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl text-gray-900 mb-2">Integration Hub</h1>
//         <p className="text-gray-600">Connect and manage third-party integrations</p>
//       </div>

//       {/* API Stats */}
//       <div className="grid sm:grid-cols-4 gap-6">
//         {apiStats.map((stat, index) => (
//           <Card key={index}>
//             <CardContent className="p-6">
//               <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
//               <p className="text-3xl text-gray-900">{stat.value}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Integrations */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Available Integrations</CardTitle>
//           <CardDescription>Connect your favorite tools and services</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid md:grid-cols-2 gap-4">
//             {integrations.map((integration) => (
//               <div key={integration.id} className="p-4 border border-gray-200 rounded-lg">
//                 <div className="flex items-start gap-3">
//                   <div className="text-4xl">{integration.icon}</div>
//                   <div className="flex-1">
//                     <div className="flex items-start justify-between mb-2">
//                       <div>
//                         <h3 className="text-sm text-gray-900 mb-1">{integration.name}</h3>
//                         <p className="text-xs text-gray-600">{integration.description}</p>
//                       </div>
//                       {integration.status === 'connected' ? (
//                         <Badge className="bg-green-100 text-green-700">
//                           <CheckCircle className="size-3 mr-1" />
//                           Connected
//                         </Badge>
//                       ) : integration.status === 'disconnected' ? (
//                         <Badge variant="destructive">
//                           <AlertCircle className="size-3 mr-1" />
//                           Disconnected
//                         </Badge>
//                       ) : (
//                         <Badge variant="secondary">Available</Badge>
//                       )}
//                     </div>
//                     <p className="text-xs text-gray-500 mb-3">Last sync: {integration.lastSync}</p>
//                     <div className="flex gap-2">
//                       {integration.status === 'connected' ? (
//                         <>
//                           <Button size="sm" variant="outline" className="flex-1">
//                             <Settings className="size-4 mr-1" />
//                             Configure
//                           </Button>
//                           <Button size="sm" variant="outline">Disconnect</Button>
//                         </>
//                       ) : integration.status === 'disconnected' ? (
//                         <Button size="sm" className="w-full">Reconnect</Button>
//                       ) : (
//                         <Button size="sm" className="w-full">
//                           <ExternalLink className="size-4 mr-1" />
//                           Connect
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* API Keys */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>API Keys</CardTitle>
//               <CardDescription>Manage API access and authentication</CardDescription>
//             </div>
//             <Button size="sm">Generate New Key</Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-3">
//             <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-900 mb-1">Production API Key</p>
//                   <p className="text-xs text-gray-600 font-mono">mk_prod_********************************</p>
//                 </div>
//                 <Button size="sm" variant="outline">Regenerate</Button>
//               </div>
//             </div>
//             <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-900 mb-1">Development API Key</p>
//                   <p className="text-xs text-gray-600 font-mono">mk_dev_********************************</p>
//                 </div>
//                 <Button size="sm" variant="outline">Regenerate</Button>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }