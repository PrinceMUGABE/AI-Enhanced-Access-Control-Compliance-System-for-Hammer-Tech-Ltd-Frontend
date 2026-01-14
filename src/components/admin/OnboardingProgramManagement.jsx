import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://127.0.0.1:8000";

// Helper functions outside components
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// FIXED: Enhanced URL normalization function
const normalizeFileUrl = (url) => {
  if (!url) return '';
  
  console.log('🔧 Normalizing URL:', url);
  
  // Replace backslashes with forward slashes
  let normalized = url.replace(/\\/g, '/');
  
  // Remove leading slash if it's a relative path
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }
  
  // If it's already a full URL, return as is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  
  // If it starts with media/, ensure it's properly formatted
  if (normalized.startsWith('media/')) {
    // Ensure it doesn't have double slashes
    normalized = normalized.replace(/\/\//g, '/');
    return `${BASE_URL}/${normalized}`;
  }
  
  // For any other relative paths, assume they're in media directory
  if (normalized.includes('modules')) {
    return `${BASE_URL}/media/${normalized}`;
  }
  
  // Default: prepend media/
  return `${BASE_URL}/media/${normalized}`;
};

// Enhanced logging function
const logRequestData = (endpoint, method, requestData, responseData = null) => {
  console.group(`🌐 API Request: ${method} ${endpoint}`);
  console.log('📤 Request Data:', requestData);
  
  if (responseData) {
    console.log('📥 Response Data:', responseData);
  }
  
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.groupEnd();
};

// Simple UI Components
const Card = ({ children, className = '' }) => (
  <div className={`border rounded-lg shadow-sm bg-white ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-gray-600 ${className}`}>{children}</p>
);

const Button = ({ children, className = '', variant = 'default', size = 'default', onClick, disabled }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
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
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium">
    {children}
  </label>
);

const Select = ({ value, onValueChange, children, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
  >
    {children}
  </select>
);

const SelectTrigger = ({ children }) => children;
const SelectValue = ({ placeholder }) => placeholder;
const SelectContent = ({ children }) => children;

const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 bg-white rounded-lg shadow-lg mx-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => children;
const DialogHeader = ({ children }) => (
  <div className="border-b p-6">{children}</div>
);
const DialogTitle = ({ children }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);
const DialogDescription = ({ children }) => (
  <p className="text-sm text-gray-600">{children}</p>
);
const DialogFooter = ({ children }) => (
  <div className="border-t p-6">{children}</div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Progress = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

const Alert = ({ children, variant = 'destructive', className = '' }) => (
  <div className={`p-4 rounded-md ${variant === 'destructive' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'} ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);

const Textarea = ({ value, onChange, placeholder, rows = 4, className = '' }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Table = ({ children }) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full">{children}</table>
  </div>
);

const TableHeader = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr className="border-b hover:bg-gray-50 transition-colors">{children}</tr>;
const TableHead = ({ children, className = '' }) => <th className={`text-left p-3 font-medium text-gray-700 ${className}`}>{children}</th>;
const TableCell = ({ children, className = '' }) => <td className={`p-3 ${className}`}>{children}</td>;

// Icons
const CheckCircle = () => <span>✓</span>;
const XCircle = () => <span>✗</span>;
const Edit = () => <span>✏️</span>;
const Trash = () => <span>🗑️</span>;
const Plus = () => <span>➕</span>;
const Eye = () => <span>👁️</span>;
const Users = () => <span>👥</span>;
const Building = () => <span>🏢</span>;
const Clock = () => <span>⏰</span>;
const FileText = () => <span>📄</span>;
const CheckSquare = () => <span>✅</span>;
const XSquare = () => <span>❌</span>;
const SearchIcon = () => <span>🔍</span>;
const ChevronUp = () => <span>↑</span>;
const ChevronDown = () => <span>↓</span>;
const Loader2 = () => <span className="animate-spin">⟳</span>;

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }) => {
  const pageSizes = [5, 10, 30, 50, 100];

  return (
    <div className="flex items-center justify-between border-t px-6 py-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Show</span>
        <Select value={pageSize} onValueChange={onPageSizeChange} className="w-20">
          {pageSizes.map(size => (
            <SelectItem key={size} value={size}>{size}</SelectItem>
          ))}
        </Select>
        <span className="text-sm text-gray-700">per page</span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                size="sm"
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

// Module Status Badge Component
const ModuleStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { variant: 'success', label: 'Active', icon: '✓' };
      case 'inactive':
        return { variant: 'destructive', label: 'Inactive', icon: '✗' };
      case 'draft':
        return { variant: 'outline', label: 'Draft', icon: '📝' };
      default:
        return { variant: 'secondary', label: status, icon: '?' };
    }
  };

  const config = getStatusConfig(status);
  return <Badge variant={config.variant}><span className="mr-1">{config.icon}</span>{config.label}</Badge>;
};

// Module Type Badge Component
const ModuleTypeBadge = ({ type }) => {
  const getTypeConfig = (type) => {
    switch (type) {
      case 'core':
        return { variant: 'default', label: 'Core', icon: '★' };
      case 'department':
        return { variant: 'secondary', label: 'Department', icon: '🏢' };
      default:
        return { variant: 'outline', label: type, icon: '?' };
    }
  };

  const config = getTypeConfig(type);
  return <Badge variant={config.variant}><span className="mr-1">{config.icon}</span>{config.label}</Badge>;
};

// FIXED: Enhanced API service with URL normalization
const apiService = {
  async fetch(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    console.group(`📤 Making API request to: ${endpoint}`);
    console.log('🔧 Request Config:', {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📥 Response Data:', data);
      } else if (response.status === 204) {
        data = null;
        console.log('📥 Response: No Content (204)');
      } else {
        const text = await response.text();
        console.log('📥 Response Text:', text);
        data = text;
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.detail || `HTTP ${response.status}`);
      }

      console.groupEnd();
      return data;
    } catch (error) {
      console.error('❌ API Request Failed:', error);
      console.groupEnd();
      throw error;
    }
  }
};

// FIXED: File upload component with better file handling
const FileUpload = ({ files, onFilesChange, onFileRemove, maxSizeMB = 50 }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    console.log('📁 Files selected:', selectedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    })));
    onFilesChange([...files, ...selectedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log('📁 Files dropped:', droppedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    })));
    onFilesChange([...files, ...droppedFiles]);
  };

  const getFileTypeIcon = (file) => {
    const name = file.name || file.original_filename || '';
    const ext = name.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return '🖼️';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return '🎬';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return '🎵';
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '📊';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.mov,.avi,.mkv,.webm,.mp3,.wav,.ogg,.m4a,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
        />

        <div className="cursor-pointer">
          <div className="text-4xl mb-2">📁</div>
          <p className="text-lg font-medium mb-2">Drag & drop files here or click to browse</p>
          <p className="text-sm text-gray-500">
            Supported: Images, Videos, Audio, PDF, Word, Excel, PowerPoint
            <br />
            Max size: {maxSizeMB}MB per file
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files ({files.length})</h4>
          <div className="max-h-60 overflow-y-auto border rounded-md p-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getFileTypeIcon(file)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.name || file.original_filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size || 0)}
                      {file.type && ` • ${file.type}`}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🗑️ Removing file:', file.name || file.original_filename);
                    onFileRemove(index);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// FIXED: Full screen media viewer modal with proper URL handling
const MediaViewerModal = ({ open, onOpenChange, file }) => {
  if (!open || !file) return null;

  const getFileType = () => {
    const type = file.type?.toLowerCase() || '';
    const filename = file.original_filename || file.name || '';

    if (type.includes('image')) return 'image';
    if (type.includes('video')) return 'video';
    if (type.includes('audio')) return 'audio';
    if (type.includes('pdf')) return 'pdf';

    // Fallback to extension check
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
    if (ext === 'pdf') return 'pdf';

    return 'other';
  };

  const fileType = getFileType();
  const fileUrl = normalizeFileUrl(file.url || '');

  console.log('🎬 Media viewer file info:', {
    fileType,
    fileUrl,
    originalUrl: file.url,
    filename: file.original_filename || file.name
  });

  const renderContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <img
              src={fileUrl}
              alt={file.title || file.original_filename}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(90vh - 100px)' }}
              onError={(e) => {
                console.error('❌ Error loading image:', fileUrl);
                e.target.src = `https://via.placeholder.com/800x600?text=Image+Not+Available`;
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <video
              className="max-w-full max-h-full"
              controls
              autoPlay
              style={{ maxHeight: 'calc(90vh - 100px)' }}
            >
              <source src={fileUrl} type="video/mp4" />
              <source src={fileUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
              <div className="text-center mb-6">
                <span className="text-6xl">🎵</span>
                <h3 className="text-xl font-bold mt-4">{file.title || file.original_filename}</h3>
                {file.description && (
                  <p className="text-gray-600 mt-2">{file.description}</p>
                )}
              </div>
              <audio
                controls
                autoPlay
                className="w-full"
              >
                <source src={fileUrl} type="audio/mpeg" />
                <source src={fileUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
              {file.duration && (
                <p className="text-gray-600 text-center mt-4">
                  Duration: {Math.floor(file.duration / 60)}:{(file.duration % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="h-full w-full bg-gray-900">
            <iframe
              src={fileUrl}
              title={file.title || file.original_filename}
              className="w-full h-full border-0"
              style={{ height: 'calc(90vh - 100px)' }}
            />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center bg-white rounded-xl shadow-lg p-8">
              <span className="text-6xl">📎</span>
              <h3 className="text-xl font-bold mt-4">{file.title || file.original_filename}</h3>
              <p className="text-gray-600 mt-2">This file type cannot be previewed inline</p>
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-4">
                  File Type: {file.type || 'Unknown'} • Size: {Math.round((file.size || 0) / 1024)} KB
                </p>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="default"
                    onClick={() => window.open(fileUrl, '_blank')}
                  >
                    Open in New Tab
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = fileUrl;
                      link.download = file.original_filename || 'download';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <DialogTitle className="truncate max-w-lg">
            {file.title || file.original_filename}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              Open in New Tab
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-900">
          {renderContent()}
        </div>
        <div className="p-4 border-t bg-white">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <span className="font-medium">Type:</span> {fileType.toUpperCase()}
              {file.size && (
                <span className="ml-4">
                  <span className="font-medium">Size:</span> {Math.round((file.size || 0) / 1024)} KB
                </span>
              )}
            </div>
            <div>
              {file.uploaded_at && (
                <span>
                  <span className="font-medium">Uploaded:</span> {formatDate(file.uploaded_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// FIXED: Add details modal component with proper file handling
const ModuleDetailsModal = ({ module, open, onOpenChange }) => {
  if (!open || !module) return null;

  const files = module.multimedia_files || [];
  const [selectedFile, setSelectedFile] = useState(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Process files to ensure they have proper URLs
  const processedFiles = files.map(file => ({
    ...file,
    normalizedUrl: normalizeFileUrl(file.url || '')
  }));

  console.log('📁 Module files processed:', {
    originalCount: files.length,
    processedCount: processedFiles.length,
    files: processedFiles.map(f => ({
      name: f.original_filename || f.title,
      url: f.url,
      normalizedUrl: f.normalizedUrl,
      type: f.type
    }))
  });

  // Group files by type
  const groupedFiles = processedFiles.reduce((acc, file) => {
    const type = file.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(file);
    return acc;
  }, {});

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'audio': return '🎵';
      case 'pdf': return '📄';
      case 'document': return '📝';
      default: return '📎';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileAction = (file) => {
    console.log('🖱️ File action clicked:', {
      fileName: file.original_filename || file.title,
      fileType: file.type,
      url: file.normalizedUrl
    });

    if (['image', 'video', 'audio', 'pdf'].includes(file.type?.toLowerCase())) {
      setSelectedFile(file);
      setShowMediaViewer(true);
    } else {
      // Download other files
      const link = document.createElement('a');
      link.href = file.normalizedUrl;
      link.download = file.original_filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // SAFELY handle content array
  const renderContentList = () => {
    if (!module.content) return <p className="text-gray-500">No content available</p>;
    
    try {
      // Check if content is a string that might be JSON
      if (typeof module.content === 'string') {
        try {
          const parsedContent = JSON.parse(module.content);
          if (Array.isArray(parsedContent)) {
            return (
              <ul className="space-y-3">
                {parsedContent.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            );
          }
        } catch (e) {
          // If it's not JSON, treat as plain text
          return <p className="text-gray-700 whitespace-pre-line">{module.content}</p>;
        }
      }
      
      // If content is already an array
      if (Array.isArray(module.content)) {
        return (
          <ul className="space-y-3">
            {module.content.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        );
      }
      
      // Default fallback
      return <p className="text-gray-700 whitespace-pre-line">{String(module.content)}</p>;
    } catch (error) {
      console.error('Error rendering content:', error);
      return <p className="text-gray-500">Error displaying content</p>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl">{module.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center space-x-2 mt-2">
                    <ModuleTypeBadge type={module.module_type} />
                    <ModuleStatusBadge status={module.is_active ? 'active' : 'inactive'} />
                    <Badge variant="outline">
                      <Clock /> {module.duration_minutes || 0} min
                    </Badge>
                  </div>
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                ✕
              </Button>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-4 px-6">
              <button
                className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              {processedFiles.length > 0 && (
                <button
                  className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === 'files'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('files')}
                >
                  Files ({processedFiles.length})
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Description</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{module.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Content */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Learning Content</h3>
                    {renderContentList()}
                  </CardContent>
                </Card>

                {/* Departments */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Applicable Departments</h3>
                    {module.module_type === 'core' ? (
                      <Badge variant="default">All Departments</Badge>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {module.departments?.map(dept => (
                          <Badge key={dept.id} variant="outline">{dept.name}</Badge>
                        )) || <span className="text-gray-500">No departments assigned</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick File Preview */}
                {processedFiles.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Attachments Preview</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {processedFiles.slice(0, 8).map((file, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleFileAction(file)}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xl">{getFileIcon(file.type)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {file.title || file.original_filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size || 0)}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {file.description || 'No description'}
                            </p>
                          </div>
                        ))}
                      </div>
                      {processedFiles.length > 8 && (
                        <p className="text-sm text-gray-500 mt-3 text-center">
                          + {processedFiles.length - 8} more files. Switch to Files tab to view all.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Metadata */}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Created: {formatDate(module.created_at)} by {module.created_by_name || 'Unknown'}</p>
                  {module.updated_at !== module.created_at && (
                    <p>Last updated: {formatDate(module.updated_at)}</p>
                  )}
                </div>
              </div>
            ) : (
              // Files Tab
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">All Files ({processedFiles.length})</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Total size: {formatFileSize(processedFiles.reduce((sum, file) => sum + (file.size || 0), 0))}
                    </span>
                  </div>
                </div>

                {Object.entries(groupedFiles).map(([type, typeFiles]) => (
                  <Card key={type}>
                    <CardContent className="p-6">
                      <h4 className="font-medium text-gray-700 mb-4 capitalize flex items-center">
                        <span className="mr-2 text-xl">{getFileIcon(type)}</span>
                        {type} Files ({typeFiles.length})
                      </h4>
                      <div className="space-y-3">
                        {typeFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handleFileAction(file)}
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <span className="text-2xl">{getFileIcon(file.type)}</span>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-medium truncate">
                                  {file.title || file.original_filename}
                                </h5>
                                <div className="flex items-center space-x-3 text-sm text-gray-500">
                                  <span>{formatFileSize(file.size || 0)}</span>
                                  {file.type && <span>• {file.type}</span>}
                                  {file.description && <span>• {file.description}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                {['image', 'video', 'audio', 'pdf'].includes(file.type?.toLowerCase()) ? 'View' : 'Download'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex justify-between items-center w-full px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Module ID: {module.id}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Media Viewer Modal */}
      <MediaViewerModal
        open={showMediaViewer}
        onOpenChange={setShowMediaViewer}
        file={selectedFile}
      />
    </>
  );
};

export default function OnboardingProgramManagement() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState('modules');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modules state
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // File states
  const [moduleFiles, setModuleFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    module_type: 'core',
    department_ids: [],
    order: 0,
    is_required: true,
    duration_minutes: 30,
    content: [],
    resources: [],
    is_active: true
  });

  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    total_modules: 0,
    active_modules: 0,
    core_modules: 0,
    department_modules: 0,
    total_departments: 0,
    avg_duration: 0
  });

  // Sort indicator component
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />;
  };

  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        console.log('👤 User data from localStorage:', userData);
        setUserRole(userData.role || '');
        setUserId(userData.id || '');
        return {
          role: userData.role,
          userId: userData.id,
          fullName: userData.full_name,
          email: userData.email,
          workEmail: userData.work_mail_address,
          department: userData.department,
          phoneNumber: userData.phone_number,
          avatar: userData.avatar
        };
      }
    } catch (error) {
      console.error('Error retrieving user info:', error);
    }
    return { role: '', userId: '' };
  };

  // Fetch all modules
  const fetchModules = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching modules...');
      
      const modulesData = await apiService.fetch('/onboarding/modules/');
      
      console.log('📦 Retrieved modules:', {
        count: modulesData.length,
        modules: modulesData.map(m => ({
          id: m.id,
          title: m.title,
          type: m.module_type,
          departments: m.departments?.length || 0,
          content_type: typeof m.content,
          content_value: m.content,
          files_count: m.multimedia_files?.length || 0
        }))
      });

      // Process files to ensure they have proper URLs
      const transformedModules = modulesData.map(module => ({
        ...module,
        content: Array.isArray(module.content) ? module.content : 
                 typeof module.content === 'string' ? [module.content] : 
                 module.content ? [String(module.content)] : [],
        department_ids: module.departments?.map(dept => dept.id) || [],
        multimedia_files: (module.multimedia_files || []).map(file => ({
          ...file,
          normalizedUrl: normalizeFileUrl(file.url || '')
        }))
      }));

      console.log('📦 Transformed modules:', transformedModules);
      
      setModules(transformedModules);
      setTotalItems(transformedModules.length);

      // Calculate summary statistics
      calculateSummaryStats(transformedModules);

      // Fetch departments
      console.log('📥 Fetching departments...');
      try {
        const departmentsData = await apiService.fetch('/departments/all/');
        console.log('🏢 Retrieved departments:', {
          count: departmentsData.data?.length || 0,
          departments: departmentsData.data?.map(d => ({
            id: d.id,
            name: d.name,
            status: d.status
          }))
        });
        setDepartments(departmentsData.data || []);
      } catch (deptError) {
        console.warn('Could not fetch departments:', deptError);
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleDetails = async (moduleId) => {
    try {
      setLoading(true);
      console.log(`📥 Fetching details for module ${moduleId}...`);
      
      const moduleData = await apiService.fetch(`/onboarding/modules/${moduleId}/`);
      
      console.log('📋 Module details retrieved:', {
        id: moduleData.id,
        title: moduleData.title,
        content_type: typeof moduleData.content,
        content_value: moduleData.content,
        files: moduleData.multimedia_files?.length || 0,
        departments: moduleData.departments?.length || 0
      });
      
      // Process files to ensure they have proper URLs
      const processedModule = {
        ...moduleData,
        content: Array.isArray(moduleData.content) ? moduleData.content : 
                 typeof moduleData.content === 'string' ? [moduleData.content] : 
                 moduleData.content ? [String(moduleData.content)] : [],
        multimedia_files: (moduleData.multimedia_files || []).map(file => ({
          ...file,
          normalizedUrl: normalizeFileUrl(file.url || '')
        }))
      };
      
      setSelectedModule(processedModule);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('❌ Error fetching module details:', error);
      alert('Failed to load module details');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummaryStats = (modulesData) => {
    const stats = {
      total_modules: modulesData.length,
      active_modules: modulesData.filter(m => m.is_active).length,
      core_modules: modulesData.filter(m => m.module_type === 'core').length,
      department_modules: modulesData.filter(m => m.module_type === 'department').length,
      total_departments: new Set(modulesData.flatMap(m => m.departments?.map(d => d.id) || [])).size,
      avg_duration: modulesData.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) / modulesData.length || 0
    };
    
    console.log('📊 Summary stats calculated:', stats);
    setSummaryStats(stats);
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...modules];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(module =>
        statusFilter === 'active' ? module.is_active : !module.is_active
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(module => module.module_type === typeFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(module =>
        module.module_type === 'core' ||
        module.departments?.some(dept => dept.id.toString() === departmentFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'duration_minutes':
          aValue = a.duration_minutes || 0;
          bValue = b.duration_minutes || 0;
          break;
        case 'order':
          aValue = a.order || 0;
          bValue = b.order || 0;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    console.log('🔍 Filtered modules:', {
      total: modules.length,
      filtered: filtered.length,
      searchTerm,
      statusFilter,
      typeFilter,
      departmentFilter
    });

    setTotalItems(filtered.length);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredModules(filtered.slice(startIndex, endIndex));
  }, [modules, searchTerm, statusFilter, typeFilter, departmentFilter, sortField, sortOrder, currentPage, pageSize]);

  // Handle page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, departmentFilter, pageSize]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Create module
  const createModule = async () => {
    try {
      console.log('📝 Creating module with data:', {
        title: moduleForm.title,
        type: moduleForm.module_type,
        departments: moduleForm.department_ids.length,
        files: moduleFiles.length,
        content: moduleForm.content
      });

      // Prepare FormData for file upload
      const formData = new FormData();

      // Add module data
      formData.append('title', moduleForm.title);
      formData.append('description', moduleForm.description);
      formData.append('module_type', moduleForm.module_type);
      formData.append('order', moduleForm.order.toString());
      formData.append('is_required', moduleForm.is_required.toString());
      formData.append('duration_minutes', moduleForm.duration_minutes.toString());
      formData.append('content', JSON.stringify(moduleForm.content));
      formData.append('resources', JSON.stringify(moduleForm.resources));
      formData.append('is_active', moduleForm.is_active.toString());

      // Add departments if it's a department module
      if (moduleForm.module_type === 'department' && moduleForm.department_ids.length > 0) {
        formData.append('departments', JSON.stringify(moduleForm.department_ids));
      }

      // Add files
      moduleFiles.forEach((file, index) => {
        console.log(`📁 Adding file ${index}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        });
        formData.append(`files[${index}].file`, file);
        
        // Add metadata for each file
        formData.append(`files[${index}].title`, file.name);
        formData.append(`files[${index}].type`, file.type || 'document');
      });

      // Log FormData contents
      console.log('📤 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await apiService.fetch('/onboarding/modules/create/', {
        method: 'POST',
        body: formData
      });

      console.log('✅ Module created successfully:', response);

      // Process files to ensure they have proper URLs
      const transformedModule = {
        ...response,
        content: Array.isArray(response.content) ? response.content : 
                 typeof response.content === 'string' ? [response.content] : [],
        department_ids: response.departments?.map(dept => dept.id) || [],
        multimedia_files: (response.multimedia_files || []).map(file => ({
          ...file,
          normalizedUrl: normalizeFileUrl(file.url || '')
        }))
      };

      setModules([...modules, transformedModule]);
      setShowCreateModal(false);
      resetModuleForm();
      setModuleFiles([]);
      alert('Module created successfully!');
    } catch (error) {
      console.error('❌ Error creating module:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Update module
  const updateModule = async () => {
    try {
      console.log('📝 Updating module with data:', {
        id: selectedModule.id,
        title: moduleForm.title,
        type: moduleForm.module_type,
        departments: moduleForm.department_ids.length,
        newFiles: moduleFiles.length,
        existingFiles: existingFiles.length,
        content: moduleForm.content
      });

      // Prepare FormData
      const formData = new FormData();

      // Add module data
      formData.append('title', moduleForm.title);
      formData.append('description', moduleForm.description);
      formData.append('module_type', moduleForm.module_type);
      formData.append('order', moduleForm.order.toString());
      formData.append('is_required', moduleForm.is_required.toString());
      formData.append('duration_minutes', moduleForm.duration_minutes.toString());
      formData.append('content', JSON.stringify(moduleForm.content));
      formData.append('resources', JSON.stringify(moduleForm.resources));
      formData.append('is_active', moduleForm.is_active.toString());

      // Handle department_ids
      if (moduleForm.module_type === 'department') {
        formData.append('department_ids', JSON.stringify(moduleForm.department_ids));
      } else {
        formData.append('department_ids', JSON.stringify([]));
      }

      // Add new files
      moduleFiles.forEach((file, index) => {
        console.log(`📁 Adding new file ${index}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        });
        formData.append(`files[${index}].file`, file);
        formData.append(`files[${index}].title`, file.name);
        formData.append(`files[${index}].type`, file.type || 'document');
      });

      // Log FormData contents
      console.log('📤 FormData contents for update:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await apiService.fetch(`/onboarding/modules/${selectedModule.id}/update/`, {
        method: 'PUT',
        body: formData
      });

      console.log('✅ Module updated successfully:', response);

      // Process files to ensure they have proper URLs
      const transformedModule = {
        ...response,
        content: Array.isArray(response.content) ? response.content : 
                 typeof response.content === 'string' ? [response.content] : [],
        department_ids: response.departments?.map(dept => dept.id) || [],
        multimedia_files: (response.multimedia_files || []).map(file => ({
          ...file,
          normalizedUrl: normalizeFileUrl(file.url || '')
        }))
      };

      setModules(modules.map(m => m.id === selectedModule.id ? transformedModule : m));
      setShowEditModal(false);
      resetModuleForm();
      setModuleFiles([]);
      setExistingFiles([]);
      setSelectedModule(null);
      alert('Module updated successfully!');
    } catch (error) {
      console.error('❌ Error updating module:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Delete module
  const deleteModule = async () => {
    try {
      console.log('🗑️ Deleting module:', {
        id: selectedModule.id,
        title: selectedModule.title
      });

      await apiService.fetch(`/onboarding/modules/${selectedModule.id}/delete/`, {
        method: 'DELETE'
      });

      console.log('✅ Module deleted successfully');
      
      setModules(modules.filter(m => m.id !== selectedModule.id));
      setShowDeleteModal(false);
      setSelectedModule(null);
      alert('Module deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting module:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Assign module to departments
  const assignModuleToDepartments = async () => {
    try {
      console.log('👥 Assigning module to departments:', {
        moduleId: selectedModule.id,
        moduleTitle: selectedModule.title,
        departmentIds: moduleForm.department_ids
      });

      const requestData = {
        department_ids: moduleForm.department_ids
      };

      console.log('📤 Assignment request data:', requestData);

      const result = await apiService.fetch(`/onboarding/modules/${selectedModule.id}/department-assign/`, {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      console.log('✅ Module assignment result:', result);
      
      fetchModules();
      setShowAssignModal(false);
      resetModuleForm();
      alert(`Module assigned to ${result.assigned_count} mentees across ${result.departments_assigned.length} departments`);
    } catch (error) {
      console.error('❌ Error assigning module:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Delete file from module
  const deleteFileFromModule = async (fileId) => {
    try {
      console.log('🗑️ Deleting file:', {
        moduleId: selectedModule.id,
        fileId: fileId
      });

      await apiService.fetch(`/onboarding/modules/${selectedModule.id}/files/${fileId}/`, {
        method: 'DELETE'
      });

      console.log('✅ File deleted successfully');
      
      const newFiles = existingFiles.filter(f => f.id !== fileId);
      setExistingFiles(newFiles);
      alert('File deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      alert(`Error deleting file: ${error.message}`);
    }
  };

  const handleModuleTypeChange = (type) => {
    console.log('🔄 Module type changed:', type);
    if (type === 'core') {
      setModuleForm({
        ...moduleForm,
        module_type: type,
        department_ids: []
      });
    } else {
      setModuleForm({
        ...moduleForm,
        module_type: type
      });
    }
  };

  // Reset module form
  const resetModuleForm = () => {
    console.log('🔄 Resetting module form');
    setModuleForm({
      title: '',
      description: '',
      module_type: 'core',
      department_ids: [],
      order: 0,
      is_required: true,
      duration_minutes: 30,
      content: [],
      resources: [],
      is_active: true
    });
  };

  // Initialize form for edit
  const initEditForm = (module) => {
    console.log('✏️ Initializing edit form for module:', {
      id: module.id,
      title: module.title,
      departments: module.departments?.length || 0,
      files: module.multimedia_files?.length || 0,
      content_type: typeof module.content,
      content_value: module.content
    });
    
    // Ensure content is an array
    const contentArray = Array.isArray(module.content) ? module.content : 
                        typeof module.content === 'string' ? [module.content] : 
                        module.content ? [String(module.content)] : [];
    
    setModuleForm({
      title: module.title,
      description: module.description,
      module_type: module.module_type,
      department_ids: module.departments?.map(d => d.id) || [],
      order: module.order || 0,
      is_required: module.is_required,
      duration_minutes: module.duration_minutes || 30,
      content: contentArray,
      resources: module.resources || [],
      is_active: module.is_active
    });

    setExistingFiles(module.multimedia_files || []);
    setModuleFiles([]);
  };

  // Initialize on component mount
  useEffect(() => {
    console.log('🚀 OnboardingProgramManagement component mounted');
    const userInfo = getUserInfo();
    
    console.log('🔐 User info:', {
      role: userInfo.role,
      userId: userInfo.userId,
      hasAdminAccess: userInfo.role === 'admin'
    });
    
    if (userInfo.role !== 'admin') {
      console.warn('⛔ User does not have admin access');
      setError('Only administrators can access this page');
      setLoading(false);
      return;
    }
    
    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 />
        <span className="ml-2 text-gray-600">Loading onboarding programs...</span>
      </div>
    );
  }

  if (error && !userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Onboarding Program Management
          </h1>
          <p className="text-gray-600">Manage onboarding programs and their department assignments</p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus />
          <span className="ml-2">Create New Program</span>
        </Button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <h3 className="text-2xl font-bold text-gray-900">{summaryStats.total_modules}</h3>
              </div>
              <FileText />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                {summaryStats.core_modules} core • {summaryStats.department_modules} department
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <h3 className="text-2xl font-bold text-gray-900">{summaryStats.active_modules}</h3>
              </div>
              <CheckSquare />
            </div>
            <div className="mt-2">
              <Progress value={(summaryStats.active_modules / summaryStats.total_modules) * 100} />
              <p className="text-xs text-gray-600 mt-1">
                {((summaryStats.active_modules / summaryStats.total_modules) * 100).toFixed(1)}% active
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments Covered</p>
                <h3 className="text-2xl font-bold text-gray-900">{summaryStats.total_departments}</h3>
              </div>
              <Building />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                Out of {departments.length} total departments
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                <h3 className="text-2xl font-bold text-gray-900">{Math.round(summaryStats.avg_duration)} min</h3>
              </div>
              <Clock />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                Estimated completion time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">🔍</div>
                <Input
                  placeholder="Search programs by title or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('🔍 Search term changed:', e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value) => {
              console.log('🔄 Status filter changed:', value);
              setStatusFilter(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value) => {
              console.log('🔄 Type filter changed:', value);
              setTypeFilter(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="department">Department</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={(value) => {
              console.log('🔄 Department filter changed:', value);
              setDepartmentFilter(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredModules.length} of {totalItems} programs
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortField} onValueChange={(value) => {
                console.log('🔄 Sort field changed:', value);
                setSortField(value);
              }} className="w-40">
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="duration_minutes">Duration</SelectItem>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                  console.log('🔄 Sort order changed:', newOrder);
                  setSortOrder(newOrder);
                }}
              >
                {sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                <div className="flex items-center">
                  Program Title
                  <SortIndicator field="title" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Departments</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('duration_minutes')}>
                <div className="flex items-center">
                  Duration
                  <SortIndicator field="duration_minutes" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                <div className="flex items-center">
                  Created
                  <SortIndicator field="created_at" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-center">
                    <FileText className="text-4xl text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || departmentFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first onboarding program'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredModules.map((module, index) => (
                <TableRow key={module.id}>
                  <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{module.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{module.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ModuleTypeBadge type={module.module_type} />
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {module.module_type === 'core' ? (
                        <Badge variant="default">All Departments</Badge>
                      ) : module.departments?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {module.departments.slice(0, 2).map(dept => (
                            <Badge key={dept.id} variant="outline">{dept.name}</Badge>
                          ))}
                          {module.departments.length > 2 && (
                            <Badge variant="secondary">+{module.departments.length - 2} more</Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="destructive">No departments</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock />
                      <span className="ml-1">{module.duration_minutes} min</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {module.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(module.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('👁️ Viewing details for module:', module.id);
                          fetchModuleDetails(module.id);
                        }}
                        title="View details"
                      >
                        <Eye />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('👥 Assigning module:', module.id);
                          setSelectedModule(module);
                          setShowAssignModal(true);
                        }}
                        title="Assign to departments"
                      >
                        <Users />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('✏️ Editing module:', module.id);
                          setSelectedModule(module);
                          initEditForm(module);
                          setShowEditModal(true);
                        }}
                        title="Edit program"
                      >
                        <Edit />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          console.log('🗑️ Deleting module:', module.id);
                          setSelectedModule(module);
                          setShowDeleteModal(true);
                        }}
                        title="Delete program"
                      >
                        <Trash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            onPageChange={(page) => {
              console.log('📄 Page changed:', page);
              setCurrentPage(page);
            }}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              console.log('📄 Page size changed:', size);
              setPageSize(size);
            }}
          />
        )}
      </Card>

      {/* Create Program Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        console.log('📝 Create modal open state:', open);
        setShowCreateModal(open);
        if (!open) {
          resetModuleForm();
          setModuleFiles([]);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Onboarding Program</DialogTitle>
            <DialogDescription>
              Add a new onboarding program. Required fields are marked with *
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Program Title *</Label>
              <Input
                id="title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="e.g., Company Culture Orientation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Describe the program content and objectives..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module_type">Program Type *</Label>
                <Select
                  value={moduleForm.module_type}
                  onValueChange={handleModuleTypeChange}
                >
                  <SelectItem value="core">Core (All Departments)</SelectItem>
                  <SelectItem value="department">Department-Specific</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={moduleForm.duration_minutes}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration_minutes: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="480"
                />
              </div>
            </div>

            {moduleForm.module_type === 'department' && (
              <div className="space-y-2">
                <Label>Assign to Departments *</Label>
                <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={`dept-${dept.id}`}
                        checked={moduleForm.department_ids.includes(dept.id)}
                        onChange={(e) => {
                          const newDeptIds = e.target.checked
                            ? [...moduleForm.department_ids, dept.id]
                            : moduleForm.department_ids.filter(id => id !== dept.id);
                          console.log('🏢 Department selection changed:', {
                            departmentId: dept.id,
                            checked: e.target.checked,
                            totalSelected: newDeptIds.length
                          });
                          setModuleForm({ ...moduleForm, department_ids: newDeptIds });
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`dept-${dept.id}`} className="text-sm">
                        {dept.name} {dept.status === 'inactive' && <span className="text-red-500">(Inactive)</span>}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Selected: {moduleForm.department_ids.length} departments
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <Select
                  value={moduleForm.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => {
                    console.log('🔄 Status changed:', value);
                    setModuleForm({ ...moduleForm, is_active: value === 'active' })
                  }}
                >
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={moduleForm.is_required}
                  onChange={(e) => {
                    console.log('✅ Required checkbox changed:', e.target.checked);
                    setModuleForm({ ...moduleForm, is_required: e.target.checked })
                  }}
                  className="rounded"
                />
                <label htmlFor="is_required" className="text-sm">
                  Required completion for all assigned mentees
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Learning Content (JSON array or comma-separated)</Label>
              <Textarea
                value={Array.isArray(moduleForm.content) ? moduleForm.content.join('\n') : moduleForm.content}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                  setModuleForm({ ...moduleForm, content: lines });
                }}
                placeholder="Enter learning topics (one per line)"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Enter each learning topic on a new line
              </p>
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <FileUpload
                files={moduleFiles}
                onFilesChange={setModuleFiles}
                onFileRemove={(index) => {
                  console.log('🗑️ Removing file at index:', index);
                  const newFiles = [...moduleFiles];
                  newFiles.splice(index, 1);
                  setModuleFiles(newFiles);
                }}
                maxSizeMB={50}
              />
              <p className="text-xs text-gray-500">
                You can upload images, videos, audio files, PDFs, and documents.
              </p>
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('❌ Create modal cancelled');
                  setShowCreateModal(false);
                  resetModuleForm();
                  setModuleFiles([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createModule}
                disabled={!moduleForm.title || !moduleForm.description || (moduleForm.module_type === 'department' && moduleForm.department_ids.length === 0)}
              >
                Create Program
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Program Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        console.log('✏️ Edit modal open state:', open);
        setShowEditModal(open);
        if (!open) {
          resetModuleForm();
          setModuleFiles([]);
          setExistingFiles([]);
          setSelectedModule(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Onboarding Program</DialogTitle>
            <DialogDescription>
              Update program details for {selectedModule?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Program Title *</Label>
              <Input
                id="edit-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Program Type *</Label>
                <Select
                  value={moduleForm.module_type}
                  onValueChange={(value) => setModuleForm({ ...moduleForm, module_type: value })}
                >
                  <SelectItem value="core">Core (All Departments)</SelectItem>
                  <SelectItem value="department">Department-Specific</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (minutes) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={moduleForm.duration_minutes}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration_minutes: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="480"
                />
              </div>
            </div>

            {moduleForm.module_type === 'department' && (
              <div className="space-y-2">
                <Label>Assign to Departments *</Label>
                <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={`edit-dept-${dept.id}`}
                        checked={moduleForm.department_ids.includes(dept.id)}
                        onChange={(e) => {
                          const newDeptIds = e.target.checked
                            ? [...moduleForm.department_ids, dept.id]
                            : moduleForm.department_ids.filter(id => id !== dept.id);
                          console.log('🏢 Edit department selection changed:', {
                            departmentId: dept.id,
                            checked: e.target.checked,
                            totalSelected: newDeptIds.length
                          });
                          setModuleForm({ ...moduleForm, department_ids: newDeptIds });
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`edit-dept-${dept.id}`} className="text-sm">
                        {dept.name} {dept.status === 'inactive' && <span className="text-red-500">(Inactive)</span>}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Selected: {moduleForm.department_ids.length} departments
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-order">Display Order</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-is_active">Status</Label>
                <Select
                  value={moduleForm.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => setModuleForm({ ...moduleForm, is_active: value === 'active' })}
                >
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is_required"
                  checked={moduleForm.is_required}
                  onChange={(e) => setModuleForm({ ...moduleForm, is_required: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="edit-is_required" className="text-sm">
                  Required completion for all assigned mentees
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Learning Content (JSON array or comma-separated)</Label>
              <Textarea
                value={Array.isArray(moduleForm.content) ? moduleForm.content.join('\n') : moduleForm.content}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                  setModuleForm({ ...moduleForm, content: lines });
                }}
                placeholder="Enter learning topics (one per line)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <FileUpload
                files={moduleFiles}
                onFilesChange={setModuleFiles}
                onFileRemove={(index) => {
                  console.log('🗑️ Removing new file at index:', index);
                  const newFiles = [...moduleFiles];
                  newFiles.splice(index, 1);
                  setModuleFiles(newFiles);
                }}
                maxSizeMB={50}
              />

              {existingFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Current Files ({existingFiles.length})</h4>
                  <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                    {existingFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span>{
                            file.type === 'image' ? '🖼️' :
                              file.type === 'video' ? '🎬' :
                                file.type === 'audio' ? '🎵' :
                                  file.type === 'pdf' ? '📄' : '📎'
                          }</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.original_filename || file.title || 'Unnamed file'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.round((file.size || 0) / 1024)} KB • {file.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const fileUrl = normalizeFileUrl(file.url || '');
                              console.log('👁️ Viewing file:', fileUrl);
                              window.open(fileUrl, '_blank');
                            }}
                          >
                            <Eye />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              console.log('🗑️ Deleting existing file:', {
                                fileId: file.id,
                                fileName: file.original_filename || file.title
                              });
                              await deleteFileFromModule(file.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: New files will be added to existing ones. To delete current files, use the trash icon.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('❌ Edit modal cancelled');
                  setShowEditModal(false);
                  resetModuleForm();
                  setModuleFiles([]);
                  setExistingFiles([]);
                  setSelectedModule(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={updateModule}
                disabled={!moduleForm.title || !moduleForm.description}
              >
                Update Program
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={(open) => {
        console.log('🗑️ Delete modal open state:', open);
        setShowDeleteModal(open);
        if (!open) {
          setSelectedModule(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedModule?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <Alert variant="destructive">
              <AlertDescription>
                Warning: Deleting this program will remove it from all assigned mentees' progress.
                This action is permanent and cannot be reversed.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('❌ Delete cancelled');
                  setShowDeleteModal(false);
                  setSelectedModule(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteModule}
              >
                Delete Program
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Departments Modal */}
      <Dialog open={showAssignModal} onOpenChange={(open) => {
        console.log('👥 Assign modal open state:', open);
        setShowAssignModal(open);
        if (!open) {
          resetModuleForm();
          setSelectedModule(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Program to Departments</DialogTitle>
            <DialogDescription>
              Assign "{selectedModule?.title}" to departments to make it available for their mentees
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Select Departments</Label>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                {departments.map(dept => (
                  <div key={dept.id} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id={`assign-dept-${dept.id}`}
                      checked={moduleForm.department_ids.includes(dept.id)}
                      onChange={(e) => {
                        const newDeptIds = e.target.checked
                          ? [...moduleForm.department_ids, dept.id]
                          : moduleForm.department_ids.filter(id => id !== dept.id);
                        console.log('🏢 Assign department selection changed:', {
                          departmentId: dept.id,
                          checked: e.target.checked,
                          totalSelected: newDeptIds.length
                        });
                        setModuleForm({ ...moduleForm, department_ids: newDeptIds });
                      }}
                      className="rounded"
                    />
                    <label htmlFor={`assign-dept-${dept.id}`} className="text-sm">
                      {dept.name} {dept.status === 'inactive' && <span className="text-red-500">(Inactive)</span>}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Selected: {moduleForm.department_ids.length} departments
              </p>
            </div>

            <Alert>
              <AlertDescription>
                This will assign the program to all approved mentees in the selected departments.
                Existing assignments will not be duplicated.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('❌ Assign modal cancelled');
                  setShowAssignModal(false);
                  resetModuleForm();
                  setSelectedModule(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={assignModuleToDepartments}
                disabled={moduleForm.department_ids.length === 0}
              >
                Assign to Selected Departments
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Details Modal */}
      {selectedModule && (
        <ModuleDetailsModal
          module={selectedModule}
          open={showDetailsModal}
          onOpenChange={(open) => {
            console.log('👁️ Details modal open state:', open);
            setShowDetailsModal(open);
            if (!open) {
              setSelectedModule(null);
            }
          }}
        />
      )}
    </div>
  );
}