// import React, { useState, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Card, CardContent } from '../ui/card';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { Badge } from '../ui/badge';
// import { Search, FileText, Download, Eye, Upload, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

// interface Article {
//   id: string;
//   title: string;
//   author: string;
//   category: string;
//   tags: string[];
//   views: number;
//   downloads: number;
//   uploadDate: string;
//   fileType: string;
// }

// export default function KnowledgeRepository() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [sortBy, setSortBy] = useState('recent');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 9;

//   const articles: Article[] = [
//     { id: '1', title: 'Advanced React Patterns and Best Practices', author: 'Dr. Amanda Foster', category: 'Technical', tags: ['React', 'JavaScript'], views: 1240, downloads: 342, uploadDate: '2024-12-15', fileType: 'PDF' },
//     { id: '2', title: 'Leadership in Tech: A Comprehensive Guide', author: 'Robert Martinez', category: 'Leadership', tags: ['Leadership', 'Management'], views: 890, downloads: 256, uploadDate: '2024-12-10', fileType: 'PDF' },
//     { id: '3', title: 'Agile Project Management Fundamentals', author: 'Jennifer Lee', category: 'Project Management', tags: ['Agile', 'Scrum'], views: 1560, downloads: 478, uploadDate: '2024-12-08', fileType: 'DOCX' },
//     { id: '4', title: 'Effective Communication in Remote Teams', author: 'Michael Chen', category: 'Soft Skills', tags: ['Communication', 'Remote Work'], views: 720, downloads: 198, uploadDate: '2024-12-05', fileType: 'PDF' },
//     { id: '5', title: 'Machine Learning for Beginners', author: 'Dr. Amanda Foster', category: 'Technical', tags: ['ML', 'Python'], views: 2340, downloads: 687, uploadDate: '2024-12-01', fileType: 'PDF' },
//     { id: '6', title: 'Career Growth Framework for Engineers', author: 'Robert Martinez', category: 'Career Development', tags: ['Career', 'Growth'], views: 1120, downloads: 334, uploadDate: '2024-11-28', fileType: 'PDF' },
//     { id: '7', title: 'UI/UX Design Principles', author: 'Emily Rodriguez', category: 'Design', tags: ['Design', 'UX'], views: 980, downloads: 267, uploadDate: '2024-11-25', fileType: 'PDF' },
//     { id: '8', title: 'Data Analytics Best Practices', author: 'David Kim', category: 'Technical', tags: ['Data', 'Analytics'], views: 1450, downloads: 412, uploadDate: '2024-11-20', fileType: 'XLSX' },
//     { id: '9', title: 'Building High-Performance Teams', author: 'Jennifer Lee', category: 'Leadership', tags: ['Teams', 'Management'], views: 1890, downloads: 523, uploadDate: '2024-11-15', fileType: 'PDF' }
//   ];

//   const filteredArticles = articles.filter(article => {
//     const matchesSearch = 
//       article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
//     const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    
//     return matchesSearch && matchesCategory;
//   }).sort((a, b) => {
//     switch (sortBy) {
//       case 'recent': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
//       case 'popular': return b.views - a.views;
//       case 'downloads': return b.downloads - a.downloads;
//       default: return 0;
//     }
//   });

//   const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
//   const paginatedArticles = filteredArticles.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl text-gray-900 mb-2">Knowledge Repository</h1>
//           <p className="text-gray-600">Access and share organizational knowledge and resources</p>
//         </div>
//         <Button className="bg-blue-600 hover:bg-blue-700">
//           <Upload className="size-4 mr-2" />
//           Upload Document
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid sm:grid-cols-4 gap-6">
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Total Articles</p>
//             <p className="text-3xl text-gray-900">{articles.length}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Total Views</p>
//             <p className="text-3xl text-gray-900">{articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Downloads</p>
//             <p className="text-3xl text-gray-900">{articles.reduce((sum, a) => sum + a.downloads, 0).toLocaleString()}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-sm text-gray-600 mb-1">Contributors</p>
//             <p className="text-3xl text-gray-900">24</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardContent className="p-6">
//           <div className="grid md:grid-cols-4 gap-4">
//             <div className="md:col-span-2">
//               <div className="relative">
//                 <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//                 <Input
//                   placeholder="Search articles, authors, or tags..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//             <div>
//               <Select value={categoryFilter} onValueChange={setCategoryFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Categories" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Categories</SelectItem>
//                   <SelectItem value="Technical">Technical</SelectItem>
//                   <SelectItem value="Leadership">Leadership</SelectItem>
//                   <SelectItem value="Career Development">Career Development</SelectItem>
//                   <SelectItem value="Project Management">Project Management</SelectItem>
//                   <SelectItem value="Soft Skills">Soft Skills</SelectItem>
//                   <SelectItem value="Design">Design</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Select value={sortBy} onValueChange={setSortBy}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Sort by" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="recent">Most Recent</SelectItem>
//                   <SelectItem value="popular">Most Popular</SelectItem>
//                   <SelectItem value="downloads">Most Downloaded</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Articles Grid */}
//       <div className="grid md:grid-cols-3 gap-6">
//         {paginatedArticles.map((article) => (
//           <Card key={article.id} className="hover:shadow-lg transition-shadow">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between mb-3">
//                 <Badge variant="secondary">{article.category}</Badge>
//                 <Badge variant="outline">{article.fileType}</Badge>
//               </div>
              
//               <h3 className="text-sm text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
//               <p className="text-xs text-gray-600 mb-3">By {article.author}</p>
              
//               <div className="flex flex-wrap gap-1 mb-4">
//                 {article.tags.map((tag, index) => (
//                   <Badge key={index} variant="outline" className="text-xs">
//                     {tag}
//                   </Badge>
//                 ))}
//               </div>
              
//               <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
//                 <span>{article.views} views</span>
//                 <span>{article.downloads} downloads</span>
//               </div>
              
//               <div className="flex gap-2">
//                 <Button size="sm" variant="outline" className="flex-1">
//                   <Eye className="size-4 mr-1" />
//                   View
//                 </Button>
//                 <Button size="sm" className="flex-1">
//                   <Download className="size-4 mr-1" />
//                   Download
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-600">
//           Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredArticles.length)} of {filteredArticles.length} articles
//         </p>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//             disabled={currentPage === 1}
//           >
//             <ChevronLeft className="size-4" />
//             Previous
//           </Button>
//           <div className="flex items-center gap-1">
//             {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
//               <Button
//                 key={page}
//                 variant={currentPage === page ? 'default' : 'outline'}
//                 size="sm"
//                 onClick={() => setCurrentPage(page)}
//                 className="w-8"
//               >
//                 {page}
//               </Button>
//             ))}
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//             disabled={currentPage === totalPages}
//           >
//             Next
//             <ChevronRight className="size-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }