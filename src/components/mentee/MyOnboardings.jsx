import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://127.0.0.1:8000";

// UI Components
const Card = ({ children, className = '' }) => (
  <div className={`border rounded-lg shadow-sm bg-white ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children }) => <h2 className="text-2xl font-bold text-gray-900">{children}</h2>;
const CardDescription = ({ children }) => <p className="text-gray-600">{children}</p>;

const Button = ({ children, onClick, variant = 'default', className = '', disabled, type = 'button' }) => {
  const base = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
  };
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = '', type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  />
);

const Select = ({ value, onChange, options, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse border border-gray-200">{children}</table>
  </div>
);

const TableHeader = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children, className = '' }) => (
  <tr className={`border-b hover:bg-gray-50 ${className}`}>{children}</tr>
);
const TableHead = ({ children, className = '' }) => (
  <th className={`text-left p-3 font-medium text-gray-700 ${className}`}>{children}</th>
);
const TableCell = ({ children, className = '' }) => (
  <td className={`p-3 ${className}`}>{children}</td>
);

const Progress = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className={`h-2 rounded-full transition-all duration-300 ${value >= 80 ? 'bg-green-600' :
        value >= 50 ? 'bg-blue-600' :
          value >= 30 ? 'bg-yellow-500' :
            'bg-red-600'
        }`}
      style={{ width: `${value}%` }}
    />
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-indigo-100 text-indigo-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Alert = ({ children, type = 'info', className = '' }) => {
  const types = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };
  return (
    <div className={`p-4 border rounded-md ${types[type]} ${className}`}>
      {children}
    </div>
  );
};

// Icons
const BookOpen = () => <span className="text-lg">📚</span>;
const Clock = () => <span className="text-lg">⏰</span>;
const Calendar = () => <span className="text-lg">📅</span>;
const CheckCircle = () => <span className="text-lg">✅</span>;
const AlertCircle = () => <span className="text-lg">⚠️</span>;
const TrendingUp = () => <span className="text-lg">📈</span>;
const SearchIcon = () => <span className="text-lg">🔍</span>;
const FilterIcon = () => <span className="text-lg">🔧</span>;
const SortIcon = () => <span className="text-lg">↕️</span>;
const PlayIcon = () => <span className="text-lg">▶️</span>;
const PauseIcon = () => <span className="text-lg">⏸️</span>;
const RefreshIcon = () => <span className="text-lg">🔄</span>;
const Eye = () => <span className="text-lg">👁️</span>;
const DownloadIcon = () => <span className="text-lg">📥</span>;
const FileIcon = () => <span className="text-lg">📄</span>;
const ImageIcon = () => <span className="text-lg">🖼️</span>;
const VideoIcon = () => <span className="text-lg">🎬</span>;
const AudioIcon = () => <span className="text-lg">🔊</span>;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (minutes) => {
  if (!minutes) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Modal Component
const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${sizeClasses[size]} w-full bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="border-b p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced Module Modal Component
const EnhancedModuleModal = ({ isOpen, onClose, module, progress, onStart, onComplete, onUpdateProgress }) => {
  if (!isOpen || !module) return null;

  const [activeTab, setActiveTab] = useState('overview');
  const [checklistProgress, setChecklistProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);

  const safeProgress = progress || {
    status: 'not_started',
    progress_percentage: 0,
    time_spent_minutes: 0,
    due_date: null,
    id: null
  };

  // Safely handle content (could be string or array)
  const getContentArray = () => {
    if (!module.content) return [];
    if (Array.isArray(module.content)) return module.content;
    if (typeof module.content === 'string') {
      // Split by newlines or other delimiters
      return module.content.split('\n').filter(line => line.trim());
    }
    return [];
  };

  // Safely handle resources
  const getResourcesArray = () => {
    if (!module.resources) return [];
    if (Array.isArray(module.resources)) return module.resources;
    return [];
  };

  // Safely handle checklist items
  const getChecklistArray = () => {
    if (!module.checklist_items) return [];
    if (Array.isArray(module.checklist_items)) return module.checklist_items;
    return [];
  };

  // Safely handle multimedia files
  const getMultimediaArray = () => {
    if (!module.multimedia_files) return [];
    if (Array.isArray(module.multimedia_files)) return module.multimedia_files;
    return [];
  };

  // Helper functions for file handling
  const getFileType = (fileName) => {
    if (!fileName) return 'document';
    const extension = fileName.split('.').pop().toLowerCase();
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'];
    const pdfExtensions = ['pdf'];
    const docExtensions = ['doc', 'docx', 'txt', 'rtf'];
    const excelExtensions = ['xls', 'xlsx', 'csv'];
    const pptExtensions = ['ppt', 'pptx'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    if (audioExtensions.includes(extension)) return 'audio';
    if (pdfExtensions.includes(extension)) return 'pdf';
    if (docExtensions.includes(extension)) return 'document';
    if (excelExtensions.includes(extension)) return 'spreadsheet';
    if (pptExtensions.includes(extension)) return 'presentation';
    
    return 'document';
  };

  const getFileIcon = (fileName) => {
    const type = getFileType(fileName);
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'audio': return '🔊';
      case 'pdf': return '📕';
      case 'document': return '📄';
      case 'spreadsheet': return '📊';
      case 'presentation': return '📽️';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Fix: Proper download function with correct filename
  const handleDownload = async (file) => {
    try {
      const fileUrl = file.url || file.file_url || file.file;
      const fileName = file.name || file.file_name || file.title || `file_${Date.now()}`;
      
      // Ensure proper filename extension
      let finalFileName = fileName;
      if (!fileName.includes('.')) {
        const fileType = getFileType(fileName);
        if (fileUrl) {
          const urlExtension = fileUrl.split('.').pop().split('?')[0];
          if (urlExtension && urlExtension.length <= 5) {
            finalFileName = `${fileName}.${urlExtension}`;
          }
        }
      }
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = finalFileName;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // If it's a blob URL, revoke it after download
      if (fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      window.open(file.url || file.file_url || file.file, '_blank');
    }
  };

  // Fix: Proper file open function
  const handleFileOpen = (file) => {
    const fileType = getFileType(file.name || file.file_name || file.title);
    const fileUrl = file.url || file.file_url || file.file;
    
    if (fileType === 'pdf') {
      // Open PDF in new tab
      window.open(fileUrl, '_blank');
    } else if (fileType === 'image') {
      // Open image in preview modal
      setImagePreview(fileUrl);
    } else if (fileType === 'video' || fileType === 'audio') {
      // Videos and audio are already embedded and playable
      return;
    } else {
      // For other files, download with proper name
      handleDownload(file);
    }
  };

  // Render file card with proper information
  const renderFileCard = (file, index) => {
    // Get file information with fallbacks
    const fileName = file.name || file.file_name || file.title || `File ${index + 1}`;
    const fileType = getFileType(fileName);
    const fileUrl = file.url || file.file_url || file.file;
    const fileSize = file.size || file.file_size;
    const fileIcon = getFileIcon(fileName);
    
    // Get proper file type label
    const fileTypeLabel = fileType === 'pdf' ? 'PDF' : 
                         fileType === 'document' ? 'DOCUMENT' :
                         fileType === 'spreadsheet' ? 'SPREADSHEET' :
                         fileType === 'presentation' ? 'PRESENTATION' :
                         fileType === 'image' ? 'IMAGE' :
                         fileType === 'video' ? 'VIDEO' :
                         fileType === 'audio' ? 'AUDIO' : 'DOCUMENT';

    return (
      <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 flex items-center justify-center rounded-lg text-xl ${
                fileType === 'pdf' ? 'bg-red-100 text-red-600' :
                fileType === 'image' ? 'bg-green-100 text-green-600' :
                fileType === 'video' ? 'bg-purple-100 text-purple-600' :
                fileType === 'audio' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {fileIcon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate" title={fileName}>
                {fileName}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={
                  fileType === 'pdf' ? 'destructive' :
                  fileType === 'image' ? 'success' :
                  fileType === 'video' ? 'info' :
                  fileType === 'audio' ? 'warning' : 'default'
                } className="text-xs">
                  {fileTypeLabel}
                </Badge>
                {fileSize && (
                  <span className="text-xs text-gray-500">{formatFileSize(fileSize)}</span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 flex space-x-2">
              {fileType === 'image' ? (
                <button
                  onClick={() => setImagePreview(fileUrl)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Preview image"
                >
                  👁️
                </button>
              ) : fileType === 'pdf' ? (
                <button
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Open PDF in browser"
                >
                  📖
                </button>
              ) : (
                <button
                  onClick={() => handleFileOpen(file)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  title={fileType === 'video' || fileType === 'audio' ? 'Play' : 'Download'}
                >
                  {fileType === 'video' || fileType === 'audio' ? '▶️' : '📥'}
                </button>
              )}
              
              {fileType !== 'pdf' && fileType !== 'image' && (
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  title="Download file"
                >
                  📥
                </button>
              )}
            </div>
          </div>
          
          {/* Preview for images, videos, and audio */}
          {fileType === 'image' && (
            <div className="mt-3">
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden cursor-pointer" onClick={() => setImagePreview(fileUrl)}>
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="w-full h-full object-contain hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }}
                />
              </div>
            </div>
          )}
          
          {fileType === 'video' && (
            <div className="mt-3">
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  onPlay={() => setPlayingVideo(index)}
                  onPause={() => setPlayingVideo(null)}
                  preload="metadata"
                >
                  <source src={fileUrl} type={`video/${getFileType(fileName)}`} />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
          
          {fileType === 'audio' && (
            <div className="mt-3">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xl">🎵</span>
                  </div>
                  <audio
                    controls
                    className="flex-1"
                    onPlay={() => setPlayingAudio(index)}
                    onPause={() => setPlayingAudio(null)}
                    preload="metadata"
                  >
                    <source src={fileUrl} type={`audio/${getFileType(fileName)}`} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Image Preview Modal
  const ImagePreviewModal = () => {
    if (!imagePreview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setImagePreview(null)}>
        <div className="relative max-w-7xl max-h-[90vh]">
          <button
            className="absolute top-4 right-4 text-white text-2xl z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70"
            onClick={(e) => {
              e.stopPropagation();
              setImagePreview(null);
            }}
          >
            ×
          </button>
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={module.title}
        size="xl"
      >
        <div className="space-y-6">
          {/* Module Status Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={safeProgress.status === 'completed' ? 'success' : safeProgress.status === 'in_progress' ? 'info' : 'secondary'}>
                  {safeProgress.status ? safeProgress.status.replace('_', ' ').toUpperCase() : 'NOT STARTED'}
                </Badge>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">{module.title}</h3>
                <p className="text-gray-600 mt-1">{module.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{safeProgress.progress_percentage || 0}%</div>
                <Progress value={safeProgress.progress_percentage || 0} className="mt-2 w-32" />
              </div>
            </div>
          </div>

          {/* Module Tabs */}
          <div className="border-b">
            <div className="flex space-x-6 overflow-x-auto">
              {['overview', 'content', 'multimedia', 'checklist', 'resources'].map(tab => (
                <button
                  key={tab}
                  className={`pb-2 px-1 font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm">Type</div>
                    <div className="font-medium mt-1">
                      {module.module_type === 'core' ? 'Core Module' : 'Department Module'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm">Duration</div>
                    <div className="font-medium mt-1">{module.duration_minutes || 0} minutes</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm">Due Date</div>
                    <div className="font-medium mt-1">{safeProgress.due_date ? formatDate(safeProgress.due_date) : 'Not set'}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm">Time Spent</div>
                    <div className="font-medium mt-1">{formatTime(safeProgress.time_spent_minutes || 0)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                  <div className="prose prose-sm max-w-none">
                    {module.description ? (
                      module.description.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="text-gray-700 mb-2">{paragraph}</p>
                      ))
                    ) : (
                      <p className="text-gray-600">No description available</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Module Content</h4>
                {getContentArray().length > 0 ? (
                  <div className="space-y-3">
                    {getContentArray().map((item, index) => (
                      <div key={index} className="flex items-start p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">📝</div>
                    <p className="text-gray-600">No detailed content available</p>
                  </div>
                )}
              </div>
            )}

            {/* Multimedia Tab */}
            {activeTab === 'multimedia' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-medium text-gray-900">Multimedia Files</h4>
                  <div className="text-sm text-gray-600">
                    {getMultimediaArray().length} files available
                  </div>
                </div>
                {getMultimediaArray().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getMultimediaArray().map((file, index) => renderFileCard(file, index))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">📁</div>
                    <p className="text-gray-600">No multimedia files available for this module</p>
                  </div>
                )}
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Checklist Items</h4>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading checklist...</p>
                  </div>
                ) : getChecklistArray().length > 0 ? (
                  <div className="space-y-3">
                    {getChecklistArray().map((item, index) => {
                      const isCompleted = checklistProgress.some(p => p.checklist_item === item.id && p.is_completed);
                      return (
                        <div key={item.id || index} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <button
                                onClick={() => {
                                  // Handle checklist toggle
                                  const newProgress = !isCompleted;
                                  // Update local state
                                  setChecklistProgress(prev => {
                                    const existing = prev.find(p => p.checklist_item === item.id);
                                    if (existing) {
                                      return prev.map(p => 
                                        p.checklist_item === item.id 
                                          ? { ...p, is_completed: newProgress }
                                          : p
                                      );
                                    } else {
                                      return [...prev, {
                                        checklist_item: item.id,
                                        is_completed: newProgress,
                                        completed_at: newProgress ? new Date().toISOString() : null
                                      }];
                                    }
                                  });
                                  
                                  // Update overall progress
                                  const totalItems = getChecklistArray().length;
                                  const completedItems = checklistProgress.filter(p => p.is_completed).length + (newProgress ? 1 : -1);
                                  const newPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                                  
                                  if (onUpdateProgress) {
                                    onUpdateProgress(newPercentage);
                                  }
                                }}
                                className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' : 'border-2 border-gray-300'}`}
                              >
                                {isCompleted && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className={`font-medium ${isCompleted ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                                    {item.title || `Checklist Item ${index + 1}`}
                                  </h5>
                                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                    {item.estimated_minutes || 0} min
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">✓</div>
                    <p className="text-gray-600">No checklist items for this module</p>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Additional Resources</h4>
                {getResourcesArray().length > 0 ? (
                  <div className="space-y-3">
                    {getResourcesArray().map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200">
                          <span className="text-blue-600">🔗</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{resource.title || `Resource ${index + 1}`}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {resource.type || 'Link'} • {resource.description || 'Additional resource'}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <span className="text-blue-600 group-hover:text-blue-700">→</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">📚</div>
                    <p className="text-gray-600">No additional resources available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div>
              {safeProgress.status === 'in_progress' && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock />
                  <span>Time spent: {formatTime(safeProgress.time_spent_minutes || 0)}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>

              {safeProgress.status === 'not_started' && (
                <Button
                  variant="default"
                  onClick={() => {
                    if (onStart) onStart();
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlayIcon />
                  <span className="ml-2">Start Module</span>
                </Button>
              )}

              {safeProgress.status === 'in_progress' && (
                <Button
                  variant="success"
                  onClick={() => {
                    if (onComplete) onComplete();
                    onClose();
                  }}
                >
                  <CheckCircle />
                  <span className="ml-2">Mark as Complete</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <ImagePreviewModal />
    </>
  );
};

// Main Dashboard Component
export default function MenteeOnboardingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedModuleType, setSelectedModuleType] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isStartingModule, setIsStartingModule] = useState(false);
  const [isCompletingModule, setIsCompletingModule] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState({});
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedModuleProgress, setSelectedModuleProgress] = useState(null);

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };

  // Fetch mentee's onboarding data
  const fetchMenteeData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;

      // Fetch modules assigned to mentee
      const modulesResponse = await fetch(`${BASE_URL}/onboarding/progress/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setProgress(modulesData);
      }

      // Fetch mentee summary
      const summaryResponse = await fetch(`${BASE_URL}/onboarding/progress/my-summary/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }

      // Fetch notifications
      const notificationsResponse = await fetch(`${BASE_URL}/onboarding/notifications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications || []);
      }

      // Fetch upcoming deadlines
      const deadlinesResponse = await fetch(`${BASE_URL}/onboarding/progress/upcoming-deadlines/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (deadlinesResponse.ok) {
        const deadlinesData = await deadlinesResponse.json();
        setDeadlines(deadlinesData);
      }

    } catch (error) {
      console.error('Error fetching mentee data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch module details
  const fetchModuleDetails = async (moduleId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}/onboarding/modules/${moduleId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const moduleData = await response.json();
        setSelectedModule(moduleData);

        // Find and store the progress for this module
        const progressRecord = progress.find(p => p.module === moduleId);
        setSelectedModuleProgress(progressRecord);
      }
    } catch (error) {
      console.error('Error fetching module details:', error);
    }
  };

  // Open module details modal
  const openModuleModal = async (moduleId) => {
    if (!moduleId) return;
    
    try {
      await fetchModuleDetails(moduleId);
      setIsModuleModalOpen(true);
    } catch (error) {
      console.error('Error opening module modal:', error);
    }
  };

  // Start a module
  const startModule = async (moduleId) => {
    try {
      setIsStartingModule(true);
      const token = getAuthToken();
      if (!token) return;

      const progressRecord = progress.find(p => p.module === moduleId);
      if (!progressRecord) {
        alert("Module not found in your assigned modules");
        return;
      }

      const response = await fetch(`${BASE_URL}/onboarding/progress/${progressRecord.id}/start/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchMenteeData();

        // Start timer for this module
        setActiveTimer({
          moduleId,
          startTime: Date.now()
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to start module");
      }
    } catch (error) {
      console.error('Error starting module:', error);
      alert("Failed to start module");
    } finally {
      setIsStartingModule(false);
    }
  };

  // Update progress percentage
  const updateProgress = async (moduleId, percentage) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const progressRecord = progress.find(p => p.module === moduleId);
      if (!progressRecord) return;

      // Calculate time spent if timer is active
      let timeSpent = 0;
      if (activeTimer && activeTimer.moduleId === moduleId) {
        timeSpent = Math.floor((Date.now() - activeTimer.startTime) / 60000);
      }

      const response = await fetch(`${BASE_URL}/onboarding/progress/${progressRecord.id}/update-percentage/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          progress_percentage: percentage,
          time_spent_minutes: timeSpent
        })
      });

      if (response.ok) {
        setProgressPercentage(prev => ({
          ...prev,
          [moduleId]: percentage
        }));

        // Reset timer
        if (activeTimer && activeTimer.moduleId === moduleId) {
          setActiveTimer(null);
          setElapsedTime(0);
        }

        await fetchMenteeData();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Complete a module
  const completeModule = async (moduleId) => {
    try {
      setIsCompletingModule(true);
      const token = getAuthToken();
      if (!token) return;

      const progressRecord = progress.find(p => p.module === moduleId);
      if (!progressRecord) return;

      const response = await fetch(`${BASE_URL}/onboarding/progress/${progressRecord.id}/complete/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchMenteeData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to complete module");
      }
    } catch (error) {
      console.error('Error completing module:', error);
      alert("Failed to complete module");
    } finally {
      setIsCompletingModule(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      await fetch(`${BASE_URL}/onboarding/notifications/${notificationId}/read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Filter and sort modules
  const getFilteredAndSortedModules = () => {
    let filtered = [...progress];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.module_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.module_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Module type filter
    if (selectedModuleType !== 'all') {
      filtered = filtered.filter(item => item.module_type === selectedModuleType);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'due_date':
          aValue = new Date(a.due_date || 0);
          bValue = new Date(b.due_date || 0);
          break;
        case 'title':
          aValue = a.module_title?.toLowerCase() || '';
          bValue = b.module_title?.toLowerCase() || '';
          break;
        case 'progress':
          aValue = a.progress_percentage || 0;
          bValue = b.progress_percentage || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  // Initial data fetch
  useEffect(() => {
    fetchMenteeData();
  }, []);

  // Format date
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'overdue': return 'destructive';
      case 'needs_attention': return 'warning';
      case 'off_track': return 'destructive';
      case 'paused': return 'secondary';
      default: return 'secondary';
    }
  };

  // Get priority color
  const getPriorityColor = (daysRemaining) => {
    if (daysRemaining < 0) return 'text-red-600 bg-red-50';
    if (daysRemaining <= 1) return 'text-red-600 bg-red-50';
    if (daysRemaining <= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading your onboarding dashboard...</span>
      </div>
    );
  }

  const filteredModules = getFilteredAndSortedModules();
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Dashboard</h1>
          <p className="text-gray-600">
            Track your onboarding progress, complete modules, and manage deadlines
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTimer && (
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Clock />
                <span className="text-sm font-medium text-blue-700">
                  Timer: {formatTime(elapsedTime)}
                </span>
              </div>
            </div>
          )}
          {unreadNotifications > 0 && (
            <Button
              variant="outline"
              onClick={() => setActiveTab('notifications')}
              className="relative"
            >
              <span>Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          )}
          <Button
            onClick={fetchMenteeData}
            variant="outline"
            disabled={loading}
          >
            <RefreshIcon />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {summary.overall_percentage || 0}%
                  </h3>
                </div>
                <TrendingUp />
              </div>
              <Progress value={summary.overall_percentage || 0} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Modules Completed</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {summary.completed_modules || 0} / {summary.total_modules || 0}
                  </h3>
                </div>
                <CheckCircle />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {summary.total_modules - summary.completed_modules || 0} remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatTime(summary.total_time_spent || 0)}
                  </h3>
                </div>
                <Clock />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Est. remaining: {formatTime(summary.estimated_time_remaining || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Deadlines</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {deadlines.filter(d => d.days_remaining <= 3 && d.days_remaining >= 0).length || 0}
                  </h3>
                </div>
                <Calendar />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {deadlines.filter(d => d.days_remaining < 0).length || 0} overdue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            className={`pb-2 px-1 flex items-center whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('overview')}
          >
            <BookOpen />
            <span className="ml-2">Modules ({progress.length})</span>
          </button>
          <button
            className={`pb-2 px-1 flex items-center whitespace-nowrap ${activeTab === 'deadlines' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('deadlines')}
          >
            <Calendar />
            <span className="ml-2">Deadlines ({deadlines.length})</span>
          </button>
          <button
            className={`pb-2 px-1 flex items-center whitespace-nowrap relative ${activeTab === 'notifications' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <AlertCircle />
            <span className="ml-2">Notifications</span>
            {unreadNotifications > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'not_started', label: 'Not Started' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'overdue', label: 'Overdue' },
                      { value: 'needs_attention', label: 'Needs Attention' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Type
                  </label>
                  <Select
                    value={selectedModuleType}
                    onChange={(e) => setSelectedModuleType(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Types' },
                      { value: 'core', label: 'Core Modules' },
                      { value: 'department', label: 'Department Modules' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      options={[
                        { value: 'due_date', label: 'Due Date' },
                        { value: 'title', label: 'Title' },
                        { value: 'progress', label: 'Progress' },
                        { value: 'status', label: 'Status' }
                      ]}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3"
                    >
                      <SortIcon />
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules Table */}
          <Card>
            <CardHeader>
              <CardTitle>My Onboarding Modules</CardTitle>
              <CardDescription>
                {filteredModules.length} modules found • Click on a module to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredModules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedStatus !== 'all' || selectedModuleType !== 'all'
                      ? "Try adjusting your filters or search terms"
                      : "No modules have been assigned to you yet"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModules.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => openModuleModal(item.module)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{item.module_title}</p>
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {item.module_description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.module_type === 'core' ? 'default' : 'secondary'}>
                            {item.module_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Progress value={item.progress_percentage} />
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{item.progress_percentage}%</span>
                              {item.time_spent_minutes > 0 && (
                                <span>{formatTime(item.time_spent_minutes)}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(item.status)}>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 rounded text-center text-sm font-medium ${getPriorityColor(item.days_remaining || 0)}`}>
                            {item.due_date ? formatDateDisplay(item.due_date) : 'N/A'}
                            {item.days_remaining !== undefined && (
                              <div className="text-xs mt-1">
                                {item.days_remaining < 0
                                  ? `${Math.abs(item.days_remaining)} days overdue`
                                  : `${item.days_remaining} days left`}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatTime(item.time_spent_minutes || 0)}
                        </TableCell>

                        <TableCell>
                          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModuleModal(item.module);
                              }}
                            >
                              <Eye />
                              <span className="ml-2">View Details</span>
                            </Button>

                            {item.status === 'not_started' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startModule(item.module);
                                }}
                                disabled={isStartingModule}
                              >
                                <PlayIcon />
                                <span className="ml-2">Start</span>
                              </Button>
                            )}

                            {item.status === 'in_progress' && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  completeModule(item.module);
                                }}
                                disabled={isCompletingModule}
                              >
                                <CheckCircle />
                                <span className="ml-2">Complete</span>
                              </Button>
                            )}
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

      {/* Deadlines Tab */}
      {activeTab === 'deadlines' && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>
              Track your module deadlines and completion targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming deadlines</h3>
                <p className="text-gray-600">All your modules are on track!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deadlines.map((deadline) => (
                  <div
                    key={deadline.module_id}
                    className={`p-4 border rounded-lg ${deadline.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{deadline.module_title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Due: {formatDateDisplay(deadline.due_date)}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">
                            Progress: {deadline.progress_percentage}%
                          </span>
                          {deadline.status === 'overdue' && (
                            <Badge variant="destructive">OVERDUE</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${deadline.days_remaining < 0 ? 'text-red-600' : deadline.days_remaining <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {deadline.days_remaining < 0
                            ? `${Math.abs(deadline.days_remaining)} days overdue`
                            : `${deadline.days_remaining} days left`}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => openModuleModal(deadline.module_id)}
                        >
                          View Module
                        </Button>
                      </div>
                    </div>
                    {deadline.days_remaining < 0 && (
                      <Alert type="error" className="mt-3">
                        This module is overdue! Please complete it as soon as possible.
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Updates about your onboarding progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    {unreadNotifications} unread of {notifications.length} total
                  </span>
                  {unreadNotifications > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const token = getAuthToken();
                        if (!token) return;

                        await fetch(`${BASE_URL}/onboarding/notifications/mark-all-read/`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });

                        setNotifications(prev =>
                          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
                        );
                      }}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${!notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          {!notification.is_read && (
                            <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDateDisplay(notification.sent_at)} • {notification.type}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Module Details Modal */}
      <EnhancedModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        module={selectedModule}
        progress={selectedModuleProgress || {
          status: 'not_started',
          progress_percentage: 0,
          time_spent_minutes: 0,
          due_date: null
        }}
        onStart={() => {
          if (selectedModule?.id) {
            startModule(selectedModule.id);
          }
        }}
        onComplete={() => {
          if (selectedModule?.id) {
            completeModule(selectedModule.id);
          }
        }}
        onUpdateProgress={(percentage) => {
          if (selectedModule?.id) {
            updateProgress(selectedModule.id, percentage);
          }
        }}
      />

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Quick Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Click on any module to view detailed information</li>
                <li>PDF files open in browser, other files download with proper names</li>
                <li>Images can be previewed in full-screen mode</li>
                <li>Videos and audio can be played directly in the module</li>
                <li>Complete checklist items to track your progress</li>
                <li>Check notifications regularly for updates</li>
                <li>Contact your mentor if you need help</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}