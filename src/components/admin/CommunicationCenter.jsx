// AdminChatManagement.jsx - Complete Updated Version with Chat During Calls and "You" Typing
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// API functions
const fetchAPI = async (endpoint, method = 'GET', data = null, isFormData = false) => {
  try {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      method,
      headers
    };

    if (data) {
      config.body = isFormData ? data : JSON.stringify(data);
    }

    const response = await fetch(`http://127.0.0.1:8000${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Chat Management API functions
const getAllChats = async () => fetchAPI('/chats/discover/');
const getChatMessages = async (roomId) => fetchAPI(`/chats/${roomId}/messages/`);
const createChatRoom = async (data) => fetchAPI('/chats/create/', 'POST', data);
const sendMessage = async (data) => fetchAPI('/chats/messages/send/', 'POST', data);
const addParticipant = async (roomId, userId) => fetchAPI(`/chats/${roomId}/participants/add/`, 'POST', { user_id: userId });
const removeParticipant = async (roomId, userId) => fetchAPI(`/chats/${roomId}/participants/${userId}/remove/`, 'DELETE');
const deleteMessage = async (messageId) => fetchAPI(`/chats/messages/${messageId}/delete/`, 'DELETE');
const getAllUsers = async () => fetchAPI('/users/');
const getAllDepartments = async () => fetchAPI('/departments/all/');
const getAllMentorships = async () => fetchAPI('/mentorship/all-mentorships/');
const uploadFile = async (formData) => fetchAPI('/chats/messages/upload/', 'POST', formData, true);

// Video Call APIs
const initiateVideoCall = async (data) => fetchAPI('/chats/video-call/initiate/', 'POST', data);
const startConferenceCall = async (data) => fetchAPI('/chats/start-conference/', 'POST', data);
const joinConferenceCall = async (data) => fetchAPI('/chats/join-conference/', 'POST', data);

// Typing APIs
const updateTypingStatus = async (data) => fetchAPI('/chats/typing/update/', 'POST', data);

// UI Components
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, type = 'button', title = '' }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-8 text-base',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = 'text', className = '', ...props }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 4, className = '', ...props }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Select = ({ value, onChange, children, className = '', placeholder = 'Select...', ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  >
    <option value="">{placeholder}</option>
    {children}
  </select>
);

const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium mb-1 ${className}`}>
    {children}
  </label>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Dialog = ({ open, onOpenChange, children, className = '' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className={`relative z-50 bg-white rounded-lg shadow-lg mx-4 w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const DialogHeader = ({ children, className = '' }) => (
  <div className={`border-b p-6 ${className}`}>{children}</div>
);

const DialogTitle = ({ children }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

const DialogDescription = ({ children }) => (
  <p className="text-sm text-gray-600 mt-1">{children}</p>
);

const DialogFooter = ({ children, className = '' }) => (
  <div className={`flex justify-end gap-2 p-6 border-t ${className}`}>{children}</div>
);

// Helper functions
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (includeTime) {
    return date.toLocaleString();
  }
  return date.toLocaleDateString();
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const getFileIcon = (filename) => {
  if (!filename) return '📎';
  const ext = filename.split('.').pop().toLowerCase();

  const icons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📃',
    xls: '📊',
    xlsx: '📊',
    ppt: '📊',
    pptx: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    mp3: '🎵',
    wav: '🎵',
    m4a: '🎵',
    ogg: '🎵',
    webm: '🎵',
    mp4: '🎬',
    avi: '🎬',
    mov: '🎬',
    zip: '📦',
    rar: '📦',
    exe: '⚙️',
    default: '📎'
  };

  return icons[ext] || icons.default;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getChatTypeBadge = (chatType) => {
  switch (chatType) {
    case 'one_on_one':
      return { className: 'bg-blue-100 text-blue-800', label: '1:1 Chat' };
    case 'mentorship_group':
      return { className: 'bg-green-100 text-green-800', label: 'Mentorship' };
    case 'department_group':
      return { className: 'bg-purple-100 text-purple-800', label: 'Department' };
    case 'staff_chat':
      return { className: 'bg-yellow-100 text-yellow-800', label: 'Staff' };
    case 'global':
      return { className: 'bg-gray-100 text-gray-800', label: 'Global' };
    default:
      return { className: 'bg-gray-100 text-gray-800', label: 'Chat' };
  }
};

// Chat Message Component (Updated to show "You" for own messages)
const ChatMessage = ({ message, isOwn, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const isAudio = message.message_type === 'file' && 
    message.attachment?.match(/\.(mp3|wav|ogg|m4a|webm)$/i);
  
  const isImage = message.message_type === 'image' && message.attachment;
  const isFile = message.message_type === 'file' && !isAudio && !isImage;

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const formatAudioTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwn ? 'bg-blue-100 rounded-br-none' : 'bg-gray-100 rounded-bl-none'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${isOwn ? 'text-blue-800' : 'text-gray-800'}`}>
            {isOwn ? 'You' : message.sender?.full_name || 'Unknown'}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {formatTime(message.created_at)}
          </span>
        </div>

        {message.content && !isAudio && !isFile && !isImage && (
          <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
        )}

        {isAudio && (
          <div className="mt-2 p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 flex-shrink-0 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Voice message</span>
                  <span className="text-xs text-gray-500">
                    {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
                  </span>
                </div>
                
                <div className="relative group" onClick={handleProgressClick}>
                  <div className="w-full h-1.5 bg-gray-300 rounded-full cursor-pointer"></div>
                  <div 
                    className="absolute top-0 left-0 h-1.5 bg-blue-500 rounded-full"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute top-0 w-3 h-3 bg-blue-600 rounded-full transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${(currentTime / (duration || 1)) * 100}%`, marginTop: '0.375rem' }}
                  ></div>
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(message.attachment, message.attachment.split('/').pop())}
                className="p-2 text-gray-600 hover:text-blue-600"
                title="Download"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
            
            <audio
              ref={audioRef}
              src={message.attachment}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="hidden"
            />
          </div>
        )}

        {isFile && (
          <div className="mt-2 p-3 border rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(message.attachment)}</span>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate max-w-[200px]">
                    {message.attachment.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(message.file_size || 0)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(message.attachment, message.attachment.split('/').pop())}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Download"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {isImage && (
          <div className="mt-2">
            <img
              src={message.attachment}
              alt="Attachment"
              className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.attachment, '_blank')}
            />
          </div>
        )}

        <div className="flex justify-end mt-2 space-x-2 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={() => navigator.clipboard.writeText(message.content)}
            className="text-xs text-gray-500 hover:text-gray-700 p-1"
            title="Copy"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="text-xs text-red-500 hover:text-red-700 p-1"
              title="Delete"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced CreateChatModal Component
const CreateChatModal = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    chat_type: 'one_on_one',
    mentorship_id: '',
    department_id: '',
    participant_ids: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [mentorshipOptions, setMentorshipOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatName, setChatName] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (open) {
      fetchData();
      setError('');
      setSuccess('');
      setActiveTab('details');
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [usersResponse, mentorshipsResponse, departmentsResponse] = await Promise.all([
        getAllUsers(),
        getAllMentorships(),
        getAllDepartments()
      ]);

      setAvailableUsers(usersResponse.users || usersResponse.data || []);
      setMentorshipOptions(mentorshipsResponse.mentorships || mentorshipsResponse.data || []);
      setDepartmentOptions(departmentsResponse.departments || departmentsResponse.data || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load data: ${err.message}`);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return availableUsers;

    const query = searchQuery.toLowerCase();
    return availableUsers.filter(user =>
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.work_mail_address?.toLowerCase().includes(query)
    );
  }, [availableUsers, searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'chat_type') {
      setFormData(prev => ({
        ...prev,
        mentorship_id: '',
        department_id: '',
        participant_ids: []
      }));
      setChatName('');
    }
  };

  const handleUserSelect = (userId) => {
    setFormData(prev => {
      const currentIds = [...prev.participant_ids];
      if (currentIds.includes(userId)) {
        return { ...prev, participant_ids: currentIds.filter(id => id !== userId) };
      } else {
        return { ...prev, participant_ids: [...currentIds, userId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        chat_type: formData.chat_type
      };

      if (chatName.trim()) {
        payload.name = chatName.trim();
      }

      if (formData.chat_type === 'mentorship_group') {
        if (!formData.mentorship_id) {
          setError('Please select a mentorship');
          setLoading(false);
          return;
        }
        payload.mentorship_id = parseInt(formData.mentorship_id);
      } else if (formData.chat_type === 'department_group') {
        if (!formData.department_id) {
          setError('Please select a department');
          setLoading(false);
          return;
        }
        payload.department_id = parseInt(formData.department_id);
      } else if (formData.chat_type === 'one_on_one') {
        if (formData.participant_ids.length !== 1) {
          setError('Please select exactly one participant for one-on-one chat');
          setLoading(false);
          return;
        }
        payload.participant_ids = formData.participant_ids;
      } else if (formData.chat_type === 'staff_chat') {
        if (formData.participant_ids.length > 0) {
          payload.participant_ids = formData.participant_ids;
        }
      }

      const response = await createChatRoom(payload);

      if (response.success || response.chat || response.chat_type) {
        setSuccess('Chat created successfully!');

        setFormData({
          chat_type: 'one_on_one',
          mentorship_id: '',
          department_id: '',
          participant_ids: []
        });
        setChatName('');

        setTimeout(() => {
          onCreate(response.chat || response);
          onClose();
        }, 1500);
      } else {
        setError(response.error || response.details || 'Failed to create chat');
      }
    } catch (err) {
      setError(err.message || 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>
            Create a new chat room with participants
          </DialogDescription>
        </DialogHeader>

        <div className="border-b">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Chat Details
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'participants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Participants ({formData.participant_ids.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Preview
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Success</p>
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="chat_name">Chat Name (Optional)</Label>
                    <Input
                      id="chat_name"
                      type="text"
                      value={chatName}
                      onChange={(e) => setChatName(e.target.value)}
                      placeholder="Enter a name for the chat..."
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If left empty, a name will be generated automatically
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="chat_type">Chat Type</Label>
                    <Select
                      id="chat_type"
                      name="chat_type"
                      value={formData.chat_type}
                      onChange={handleChange}
                      className="mt-1"
                    >
                      <option value="one_on_one">One-on-One Chat</option>
                      <option value="mentorship_group">Mentorship Group</option>
                      <option value="department_group">Department Group</option>
                      <option value="staff_chat">Staff Chat</option>
                      <option value="global">Global Chat</option>
                    </Select>
                  </div>
                </div>

                {formData.chat_type === 'mentorship_group' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <Label htmlFor="mentorship_id">Select Mentorship</Label>
                    <Select
                      id="mentorship_id"
                      name="mentorship_id"
                      value={formData.mentorship_id}
                      onChange={handleChange}
                      className="mt-1 bg-white"
                    >
                      <option value="">Select a mentorship</option>
                      {mentorshipOptions.map(mentorship => (
                        <option key={mentorship.id} value={mentorship.id}>
                          {mentorship.mentor?.full_name || 'Unknown'} → {mentorship.mentee?.full_name || 'Unknown'}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-gray-600 mt-2">
                      This will include both mentor and mentee as participants
                    </p>
                  </div>
                )}

                {formData.chat_type === 'department_group' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <Label htmlFor="department_id">Select Department</Label>
                    <Select
                      id="department_id"
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      className="mt-1 bg-white"
                    >
                      <option value="">Select a department</option>
                      {departmentOptions.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name || 'Unknown Department'}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-gray-600 mt-2">
                      All members of this department will be added to the chat
                    </p>
                  </div>
                )}

                {formData.chat_type === 'global' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-yellow-800">Global Chat</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          This will create a chat visible to all approved users in the system.
                          No additional participants need to be selected.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="space-y-4">
                {(formData.chat_type === 'one_on_one' || formData.chat_type === 'staff_chat') && (
                  <>
                    <div>
                      <Label>Search Participants</Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <Input
                          type="text"
                          placeholder="Search by name, email, or work email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Select Participants</Label>
                        <span className="text-sm text-gray-500">
                          {formData.participant_ids.length} selected
                        </span>
                      </div>
                      <div className="border rounded-lg max-h-96 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <p className="mt-2">No users found</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {filteredUsers.map(user => (
                              <div key={user.id} className="flex items-center p-4 hover:bg-gray-50">
                                <input
                                  type={formData.chat_type === 'one_on_one' ? 'radio' : 'checkbox'}
                                  id={`user-${user.id}`}
                                  checked={formData.participant_ids.includes(user.id)}
                                  onChange={() => handleUserSelect(user.id)}
                                  className={formData.chat_type === 'one_on_one' ? 'h-4 w-4 text-blue-600' : 'h-4 w-4 text-blue-600 rounded'}
                                  name={formData.chat_type === 'one_on_one' ? 'participant' : undefined}
                                />
                                <label htmlFor={`user-${user.id}`} className="ml-3 flex-1 cursor-pointer">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-medium">
                                          {user.full_name?.charAt(0) || 'U'}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                                        <p className="text-sm text-gray-600">{user.email || user.work_mail_address}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="capitalize">
                                        {user.role || 'user'}
                                      </Badge>
                                      {user.department && (
                                        <Badge variant="secondary" className="text-xs">
                                          {user.department}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {(formData.chat_type === 'mentorship_group' || formData.chat_type === 'department_group') && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-4 text-lg font-medium">Participants will be automatically added</p>
                    <p className="text-sm mt-2">
                      {formData.chat_type === 'mentorship_group'
                        ? 'Both mentor and mentee will be included as participants'
                        : 'All department members will be automatically added to the chat'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Chat Preview</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Chat Name:</span>
                      <span className="font-medium">{chatName || '(Auto-generated)'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Chat Type:</span>
                      <Badge className={getChatTypeBadge(formData.chat_type).className}>
                        {getChatTypeBadge(formData.chat_type).label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Participants:</span>
                      <span className="font-medium">
                        {formData.chat_type === 'mentorship_group'
                          ? 'Mentor + Mentee'
                          : formData.chat_type === 'department_group'
                          ? 'All Department Members'
                          : formData.chat_type === 'global'
                          ? 'All Users'
                          : formData.participant_ids.length
                        }
                      </span>
                    </div>

                    {formData.chat_type === 'mentorship_group' && formData.mentorship_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Selected Mentorship:</span>
                        <span className="font-medium">
                          {mentorshipOptions.find(m => m.id == formData.mentorship_id)?.mentor?.full_name || 'Unknown'} → 
                          {mentorshipOptions.find(m => m.id == formData.mentorship_id)?.mentee?.full_name || 'Unknown'}
                        </span>
                      </div>
                    )}

                    {formData.chat_type === 'department_group' && formData.department_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Selected Department:</span>
                        <span className="font-medium">
                          {departmentOptions.find(d => d.id == formData.department_id)?.name || 'Unknown'}
                        </span>
                      </div>
                    )}

                    {formData.participant_ids.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Selected Users:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {availableUsers
                            .filter(user => formData.participant_ids.includes(user.id))
                            .map(user => (
                              <Badge key={user.id} variant="secondary">
                                {user.full_name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 text-sm ${activeTab === 'details' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('participants')}
                className={`px-3 py-1 text-sm ${activeTab === 'participants' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                Participants
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-sm ${activeTab === 'preview' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                Preview
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Chat'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced ManageParticipantsModal Component
const ManageParticipantsModal = ({ chat, open, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    if (open && chat) {
      fetchAvailableUsers();
      setError('');
      setSuccess('');
      setSelectedUser('');
      setSearchQuery('');
      setActiveTab('current');
    }
  }, [open, chat]);

  const fetchAvailableUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response.users || response.data) {
        const users = response.users || response.data;
        const currentParticipantIds = chat.participants?.map(p => p.id || p.user?.id) || [];
        const available = users.filter(user =>
          !currentParticipantIds.includes(user.id) && 
          (user.full_name || user.email || user.work_mail_address)
        );
        setAvailableUsers(available);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.message}`);
    }
  };

  const filteredAvailableUsers = useMemo(() => {
    if (!searchQuery) return availableUsers;

    const query = searchQuery.toLowerCase();
    return availableUsers.filter(user =>
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.work_mail_address?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.department?.toLowerCase().includes(query)
    );
  }, [availableUsers, searchQuery]);

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select a user to add');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await addParticipant(chat.id, selectedUser);

      if (response.success || response.message) {
        setSuccess('Participant added successfully');
        setSelectedUser('');
        setSearchQuery('');

        setTimeout(() => {
          onUpdate(response);
          fetchAvailableUsers();
        }, 1000);
      } else {
        setError(response.error || response.details || response.message || 'Failed to add participant');
      }
    } catch (err) {
      setError(err.message || 'Failed to add participant');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this participant from the chat?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await removeParticipant(chat.id, userId);

      if (response.success || response.message) {
        setSuccess('Participant removed successfully');

        setTimeout(() => {
          onUpdate(response);
          fetchAvailableUsers();
        }, 1000);
      } else {
        setError(response.error || response.details || response.message || 'Failed to remove participant');
      }
    } catch (err) {
      setError(err.message || 'Failed to remove participant');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Manage Participants</DialogTitle>
              <DialogDescription>
                Add or remove participants from "{chat.name || 'Unnamed Chat'}"
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getChatTypeBadge(chat.chat_type).className}>
                {getChatTypeBadge(chat.chat_type).label}
              </Badge>
              <Badge variant="outline">
                {chat.participants?.length || 0} participants
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="border-b">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'current' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Current Participants ({chat.participants?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'add' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Add Participants ({availableUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Chat Info
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Success</p>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'current' && (
            <div>
              {chat.participants?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <p className="mt-4 text-lg font-medium">No participants yet</p>
                  <p className="text-sm mt-2">Add participants using the "Add Participants" tab</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chat.participants?.map((participant, index) => (
                    <div key={participant.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-lg">
                              {participant?.user?.full_name?.charAt(0) || participant?.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {participant?.user?.full_name || participant?.full_name || 'Unknown User'}
                            </h4>
                            <p className="text-sm text-gray-600 truncate max-w-[180px]">
                              {participant?.user?.email || participant?.email || 'No email'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {participant?.user?.role || participant?.role || 'user'}
                              </Badge>
                              {participant?.user?.department && (
                                <Badge variant="secondary" className="text-xs">
                                  {participant.user.department}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveParticipant(participant?.user?.id || participant?.id)}
                          disabled={loading}
                          className="flex-shrink-0"
                        >
                          Remove
                        </Button>
                      </div>
                      {participant?.user?.phone_number && (
                        <div className="mt-3 flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {participant.user.phone_number}
                        </div>
                      )}
                      {participant?.joined_at && (
                        <div className="mt-2 text-xs text-gray-500">
                          Joined: {formatDate(participant.joined_at, true)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="space-y-6">
              <div>
                <Label>Search Available Users</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by name, email, department, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <form onSubmit={handleAddParticipant}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Select User to Add</Label>
                    <span className="text-sm text-gray-500">
                      {filteredAvailableUsers.length} available users
                    </span>
                  </div>
                  
                  {filteredAvailableUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border rounded-lg">
                      <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <p className="mt-4">No available users found</p>
                      <p className="text-sm mt-2">
                        {searchQuery ? 'Try a different search term' : 'All users are already in the chat'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-2">
                      {filteredAvailableUsers.map(user => (
                        <div key={user.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`add-user-${user.id}`}
                              checked={selectedUser === user.id.toString()}
                              onChange={() => setSelectedUser(user.id.toString())}
                              className="h-4 w-4 text-blue-600"
                              name="add_participant"
                            />
                            <label htmlFor={`add-user-${user.id}`} className="ml-3 flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-medium">
                                      {user.full_name?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-600 truncate max-w-[150px]">
                                      {user.email || user.work_mail_address}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {user.role || 'user'}
                                  </Badge>
                                  {user.department && (
                                    <span className="text-xs text-gray-500">{user.department}</span>
                                  )}
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">
                          Selected: {availableUsers.find(u => u.id == selectedUser)?.full_name}
                        </p>
                        <p className="text-sm text-blue-700">
                          {availableUsers.find(u => u.id == selectedUser)?.email}
                        </p>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          'Add to Chat'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Chat Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Chat Name:</span>
                      <p className="font-medium">{chat.name || '(Unnamed Chat)'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Chat Type:</span>
                      <div className="mt-1">
                        <Badge className={getChatTypeBadge(chat.chat_type).className}>
                          {getChatTypeBadge(chat.chat_type).label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Total Participants:</span>
                      <p className="font-medium">{chat.participants?.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Timestamps</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <p className="font-medium">{formatDate(chat.created_at, true)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Last Updated:</span>
                      <p className="font-medium">{formatDate(chat.updated_at, true)}</p>
                    </div>
                    {chat.last_message?.time && (
                      <div>
                        <span className="text-sm text-gray-600">Last Message:</span>
                        <p className="font-medium">{formatDate(chat.last_message.time, true)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {chat.mentorship && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Mentorship Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-green-700">Mentor:</span>
                      <p className="font-medium">
                        {chat.mentorship.mentor?.full_name || chat.mentorship.mentor || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">Mentee:</span>
                      <p className="font-medium">
                        {chat.mentorship.mentee?.full_name || chat.mentorship.mentee || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {chat.department && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Department Information</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-purple-700">Department:</span>
                      <p className="font-medium">
                        {typeof chat.department === 'object' ? chat.department.name : chat.department}
                      </p>
                    </div>
                    {chat.department_description && (
                      <p className="text-sm text-purple-600">{chat.department_description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`px-3 py-1 text-sm ${activeTab === 'current' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              Current
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1 text-sm ${activeTab === 'add' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1 text-sm ${activeTab === 'info' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              Info
            </button>
          </div>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// FileUploadModal Component
const FileUploadModal = ({ open, onClose, onUpload, chatRoomId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chat_room_id', chatRoomId);
        formData.append('message', message);
        formData.append('message_type', file.type.startsWith('image/') ? 'image' : 'file');

        const response = await uploadFile(formData);

        if (response.success) {
          onUpload(response.data);
        }
      }

      setFiles([]);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Send files, images, audio, or video to the chat
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => document.getElementById('file-input').click()}
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">📎</span>
              <p className="text-gray-600">Click to select files or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">
                Supports images, videos, audio, documents (Max: 50MB)
              </p>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Selected Files ({files.length})</h4>
              <div className="max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getFileIcon(file.name)}</span>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="file-message">Optional Message</Label>
            <Textarea
              id="file-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message with your files..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Video Call Modal with Chat Room Integration
const VideoCallModal = ({
  open,
  onClose,
  callData,
  isInitiator,
  onAccept,
  onReject,
  onEndCall,
  onToggleMedia,
  onScreenShare,
  onSendCallChatMessage,
  localStream,
  remoteStreams,
  participants = [],
  callDuration = 0,
  userMediaStates = {},
  screenSharingUser = null,
  activeSpeaker = null,
  // New props for chat integration
  currentChat = null,
  chatMessages = [],
  newCallChatMessage = '',
  onCallChatMessageChange = () => {},
  typingUsers = [],
  currentUser = null
}) => {
  const localVideoRef = useRef(null);
  const [callMessages, setCallMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [layout, setLayout] = useState('grid');
  const chatMessagesEndRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Scroll to bottom when new chat messages arrive
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    onToggleMedia?.('audio', !newMuteState);
  };

  const handleToggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    onToggleMedia?.('video', newVideoState);
  };

  const handleScreenShare = () => {
    const newScreenShareState = !isScreenSharing;
    setIsScreenSharing(newScreenShareState);
    onScreenShare?.(newScreenShareState);
  };

  const handleSendCallChatMessage = (e) => {
    e.preventDefault();
    if (newCallChatMessage.trim() && onSendCallChatMessage) {
      onSendCallChatMessage(newCallChatMessage);
    }
  };

  const renderParticipantVideo = (participant, index) => {
    const isActiveSpeaker = activeSpeaker === participant.id;
    const mediaState = userMediaStates[participant.id] || { audio: true, video: true };

    return (
      <div
        key={participant.id}
        className={`relative rounded-lg overflow-hidden bg-gray-800 ${isActiveSpeaker ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl text-white">
                {participant.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <p className="text-white font-medium">{participant.full_name}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              {!mediaState.audio && (
                <span className="text-red-400 text-xs">🔇</span>
              )}
              {!mediaState.video && (
                <span className="text-red-400 text-xs">📷</span>
              )}
              {participant.role && (
                <Badge variant="outline" className="text-xs bg-gray-900 text-white">
                  {participant.role}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          <button className="bg-black/50 text-white p-1 rounded">
            {mediaState.audio ? '🎤' : '🔇'}
          </button>
          <button className="bg-black/50 text-white p-1 rounded">
            {mediaState.video ? '📹' : '📷'}
          </button>
        </div>
      </div>
    );
  };

  if (!open) return null;

  // Calculate total participants (including yourself)
  const totalParticipants = participants.length + 1;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/80 text-white p-4 flex justify-between items-center z-10">
        <div>
          <h3 className="text-lg font-semibold">
            {callData?.call_type === 'audio' ? 'Audio Call' : 'Video Call'}
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <span className={participants.length > 0 ? 'text-green-400' : 'text-yellow-400'}>
              ● {participants.length > 0 ? `Connected with ${participants.length} participant${participants.length !== 1 ? 's' : ''}` : 'Waiting for participants...'}
            </span>
            <span>{formatDuration(callDuration)}</span>
            
            {/* Show correct participant count */}
            {totalParticipants === 1 ? (
              <span className="text-yellow-300">Calling... (Waiting for others to join)</span>
            ) : (
              <span>{totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 hover:bg-white/10 rounded"
            title="Participants"
          >
            👥 {totalParticipants}
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 hover:bg-white/10 rounded"
            title="Chat"
          >
            💬
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen pt-16 pb-32">
        {/* Video Grid */}
        <div className={`flex-1 p-4 ${showParticipants || showChat ? 'lg:w-3/4' : 'w-full'}`}>
          {/* Waiting for participants message */}
          {totalParticipants === 1 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
              <div className="bg-black/70 text-white p-6 rounded-lg max-w-md">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📞</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">Calling...</h4>
                <p className="text-gray-300 mb-4">Waiting for others to join the call</p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">👤</span>
                    </div>
                    <span className="text-sm">You</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg animate-pulse">+</span>
                    </div>
                    <span className="text-sm">Waiting...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`grid gap-4 h-full ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            layout === 'speaker' ? 'grid-cols-1' :
              'grid-cols-1 md:grid-cols-2'
            } ${totalParticipants === 1 ? 'opacity-50' : ''}`}>
            {/* Local Video */}
            <div className={`relative rounded-lg overflow-hidden bg-gray-800 ${layout === 'speaker' ? 'col-span-1' : ''}`}>
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-white">
                        You
                      </span>
                    </div>
                    <p className="text-white text-xl font-medium">You</p>
                    <p className="text-gray-400 text-sm mt-1">Camera is off</p>
                  </div>
                </div>
              )}

              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                You {isMuted ? '🔇' : '🎤'}
              </div>
            </div>

            {/* Remote Participants */}
            {participants.map((participant, index) =>
              renderParticipantVideo(participant, index)
            )}

            {/* Screen Share View */}
            {screenSharingUser && (
              <div className="col-span-full bg-black rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white">
                    <span className="font-medium">{screenSharingUser.full_name}</span> is sharing screen
                  </div>
                  <button className="text-white hover:bg-white/20 p-1 rounded">
                    Focus
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">🖥️</div>
                    <p>Screen Shared</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Participants & Chat */}
        {(showParticipants || showChat) && (
          <div className="w-full lg:w-1/4 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => { setShowParticipants(true); setShowChat(false); }}
                className={`flex-1 py-3 text-center ${showParticipants ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                Participants ({totalParticipants})
              </button>
              <button
                onClick={() => { setShowParticipants(false); setShowChat(true); }}
                className={`flex-1 py-3 text-center ${showChat ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                Chat
              </button>
            </div>

            {showParticipants && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">
                          You
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">You</p>
                        <p className="text-gray-400 text-xs">{isMuted ? 'Muted' : 'Unmuted'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-xs px-2 py-1 bg-blue-900 rounded">Host</span>
                    </div>
                  </div>

                  {participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">
                            {participant.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{participant.full_name}</p>
                          <p className="text-gray-400 text-xs">{participant.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!userMediaStates[participant.id]?.audio && (
                          <span className="text-red-400" title="Muted">🔇</span>
                        )}
                        {!userMediaStates[participant.id]?.video && (
                          <span className="text-red-400" title="Camera off">📷</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showChat && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                  <h4 className="font-medium text-white">
                    {currentChat?.name || 'Call Chat'}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {participants.length + 1} people in call
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Show existing chat messages */}
                  {chatMessages.map(message => {
                    const isOwn = message.sender?.id === currentUser?.id;
                    return (
                      <div 
                        key={message.id} 
                        className={`rounded-lg p-3 ${isOwn ? 'bg-blue-900/50' : 'bg-gray-800'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-white">
                            {isOwn ? 'You' : message.sender?.full_name || 'Unknown'}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                        {message.content && (
                          <p className="text-white text-sm">{message.content}</p>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Typing indicators */}
                  {typingUsers.length > 0 && (
                    <div className="text-gray-400 text-sm italic p-2">
                      {typingUsers.map(user => (
                        <span key={user.id}>
                          {user.name} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div ref={chatMessagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-800">
                  <form onSubmit={handleSendCallChatMessage} className="flex gap-2">
                    <Input
                      type="text"
                      value={newCallChatMessage}
                      onChange={(e) => onCallChatMessageChange(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Send
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-4">
        <div className="flex flex-col items-center">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setLayout('grid')}
              className={`px-3 py-1 rounded ${layout === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setLayout('speaker')}
              className={`px-3 py-1 rounded ${layout === 'speaker' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              Speaker
            </button>
            <button
              onClick={() => setLayout('compact')}
              className={`px-3 py-1 rounded ${layout === 'compact' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              Compact
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleToggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <span className="text-2xl">
                {isMuted ? '🔇' : '🎤'}
              </span>
            </button>

            <button
              onClick={handleToggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${!isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              <span className="text-2xl">
                {isVideoOn ? '📹' : '📷'}
              </span>
            </button>

            <button
              onClick={handleScreenShare}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <span className="text-2xl">🖥️</span>
            </button>

            <button
              onClick={onEndCall}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700"
              title="End call"
            >
              <span className="text-2xl">📞</span>
            </button>

            {!isInitiator && callData?.status === 'ringing' && (
              <>
                <button
                  onClick={onAccept}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700"
                  title="Accept call"
                >
                  <span className="text-2xl">📞</span>
                </button>
                <button
                  onClick={onReject}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700"
                  title="Reject call"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(-10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// Incoming Call Modal
const IncomingCallModal = ({ open, callData, onAccept, onReject }) => {
  const [ringing, setRinging] = useState(true);

  useEffect(() => {
    if (open) {
      setRinging(true);
      const audio = new Audio('/ringtone.mp3');
      audio.loop = true;
      audio.play().catch(e => console.log('Could not play ringtone:', e));

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-blue-600">
                {callData?.caller_name?.charAt(0) || 'C'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {callData?.caller_name || 'Unknown Caller'}
            </h3>
            <p className="text-gray-600">
              {callData?.call_type === 'audio' ? 'Audio Call' : 'Video Call'}
            </p>
            {callData?.is_conference && (
              <p className="text-sm text-blue-600 mt-1">Conference Call</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {ringing ? 'Ringing...' : 'Incoming call'}
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={onReject}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2 hover:bg-red-200">
                <span className="text-2xl text-red-600">📞</span>
              </div>
              <span className="text-sm font-medium text-red-600">Decline</span>
            </button>

            <button
              onClick={onAccept}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 hover:bg-green-200">
                <span className="text-2xl text-green-600">📞</span>
              </div>
              <span className="text-sm font-medium text-green-600">Accept</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {callData?.chat_room?.name ? `From: ${callData.chat_room.name}` : ''}
            </p>
            {callData?.participants_count && (
              <p className="text-sm text-gray-500">
                {callData.participants_count} participants in call
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              This call will be recorded for quality purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AdminChatManagement Component
export default function AdminChatManagement() {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const [ws, setWs] = useState(null);
  const [callWs, setCallWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const [videoCallData, setVideoCallData] = useState(null);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [callParticipants, setCallParticipants] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [userMediaStates, setUserMediaStates] = useState({});
  const [screenSharingUser, setScreenSharingUser] = useState(null);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [connectionError, setConnectionError] = useState('');

  // Call chat states
  const [callChatMessage, setCallChatMessage] = useState('');
  const [callChatMessages, setCallChatMessages] = useState([]);

  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showManageParticipants, setShowManageParticipants] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    chat_type: 'all',
    mentorship: 'all',
    department: 'all'
  });

  const [mentorships, setMentorships] = useState([]);
  const [departments, setDepartments] = useState([]);

  const timerRef = useRef(null);

  // Sync chat messages with call chat messages
  useEffect(() => {
    if (isInCall && selectedChat) {
      // When entering call, load existing messages
      setCallChatMessages(chatMessages);
    } else {
      // When exiting call, clear call chat messages
      setCallChatMessages([]);
      setCallChatMessage('');
    }
  }, [isInCall, selectedChat, chatMessages]);

  const initChatWebSocket = (roomId) => {
    try {
      if (ws) {
        ws.close();
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        setConnectionError('No authentication token found');
        return;
      }

      const wsUrl = `ws://127.0.0.1:8000/ws/chat/${roomId}/?token=${token}`;

      const websocket = new WebSocket(wsUrl);

      const connectionTimeout = setTimeout(() => {
        if (websocket.readyState !== WebSocket.OPEN) {
          setConnectionError('Connection timeout. Please check your network.');
          websocket.close();
        }
      }, 5000);

      websocket.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setConnectionError('');
      };

      websocket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        if (event.code !== 1000) {
          setConnectionError(`Connection closed: ${event.reason || 'Unknown error'}`);
        }
      };

      websocket.onerror = (error) => {
        setConnectionError('WebSocket connection failed. Please refresh.');
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      setWs(websocket);
    } catch (error) {
      setConnectionError(`Failed to initialize WebSocket: ${error.message}`);
    }
  };

  const initCallWebSocket = (callId) => {
    if (callWs) {
      callWs.close();
    }

    const token = localStorage.getItem('access_token');
    const wsUrl = `ws://127.0.0.1:8000/ws/video-call/${callId}/?token=${token}`;

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('✅ Video Call WebSocket connected');
    };

    websocket.onclose = () => {
      console.log('❌ Video Call WebSocket disconnected');
    };

    websocket.onerror = (error) => {
      console.error('Video Call WebSocket error:', error);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleCallWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing video call WebSocket message:', error);
      }
    };

    setCallWs(websocket);
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'chat_message':
        handleIncomingMessage(data);
        break;
      case 'typing_status':
        handleTypingStatus(data);
        break;
      case 'video_call_offer':
        handleIncomingCall(data);
        break;
      case 'conference_call_incoming':
        handleConferenceCall(data);
        break;
    }
  };

  const handleCallWebSocketMessage = (data) => {
    switch (data.type) {
      case 'user_joined_call':
        handleUserJoinedCall(data);
        break;
      case 'user_left_call':
        handleUserLeftCall(data);
        break;
      case 'webrtc_offer':
        handleWebRTCOffer(data);
        break;
      case 'webrtc_answer':
        handleWebRTCAnswer(data);
        break;
      case 'ice_candidate':
        handleICECandidate(data);
        break;
      case 'media_state':
        handleMediaState(data);
        break;
      case 'screen_share':
        handleScreenShare(data);
        break;
    }
  };

  const handleIncomingMessage = (data) => {
    const newMessage = {
      id: data.message_id,
      sender: { 
        full_name: data.sender_name, 
        id: data.sender_id 
      },
      content: data.message,
      created_at: data.timestamp,
      is_own_message: data.sender_id === parseInt(localStorage.getItem('user_id'))
    };

    setChatMessages(prev => [...prev, newMessage]);
    
    // Also add to call chat messages if we're in a call
    if (isInCall) {
      setCallChatMessages(prev => [...prev, newMessage]);
    }
  };

  const handleTypingStatus = (data) => {
    const currentUserId = parseInt(localStorage.getItem('user_id'));
    const isCurrentUser = data.user_id === currentUserId;
    
    setTypingUsers(prev => {
      const existingIndex = prev.findIndex(user => user.id === data.user_id);

      if (data.is_typing) {
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            id: data.user_id,
            name: isCurrentUser ? 'You' : data.user_name || 'User',
            lastTyping: Date.now()
          };
          return updated;
        } else {
          return [...prev, {
            id: data.user_id,
            name: isCurrentUser ? 'You' : data.user_name || 'User',
            lastTyping: Date.now()
          }];
        }
      } else {
        return prev.filter(user => user.id !== data.user_id);
      }
    });
  };

  const handleIncomingCall = (data) => {
    setIncomingCallData({
      call_id: data.call_id,
      caller_id: data.caller_id,
      caller_name: data.caller_name,
      call_type: data.call_type,
      chat_room: data.chat_room
    });
    setShowIncomingCall(true);
  };

  const handleConferenceCall = (data) => {
    setIncomingCallData({
      call_id: data.call_id,
      caller_id: data.caller_id,
      caller_name: data.caller_name,
      call_type: data.call_type,
      chat_room: data.chat_room,
      participants_count: data.participants_count,
      is_conference: true
    });
    setShowIncomingCall(true);
  };

  const handleUserJoinedCall = (data) => {
    const newParticipant = {
      id: data.user_id,
      full_name: data.full_name,
      joined_at: data.timestamp
    };

    setCallParticipants(prev => {
      const exists = prev.find(p => p.id === data.user_id);
      if (!exists) {
        return [...prev, newParticipant];
      }
      return prev;
    });
  };

  const handleUserLeftCall = (data) => {
    setCallParticipants(prev => prev.filter(p => p.id !== data.user_id));
  };

  const handleWebRTCOffer = (data) => {
    console.log('Received WebRTC offer from:', data.sender_name);
  };

  const handleWebRTCAnswer = (data) => {
    console.log('Received WebRTC answer from:', data.sender_name);
  };

  const handleICECandidate = (data) => {
    console.log('Received ICE candidate from:', data.sender_name);
  };

  const handleMediaState = (data) => {
    setUserMediaStates(prev => ({
      ...prev,
      [data.sender_id]: {
        ...prev[data.sender_id],
        [data.media_type]: data.enabled
      }
    }));
  };

  // const handleScreenShare = (data) => {
  //   if (data.is_sharing) {
  //     setScreenSharingUser({
  //       id: data.sender_id,
  //       full_name: data.sender_name
  //     });
  //   } else {
  //     setScreenSharingUser(null);
  //   }
  // };

  const handleTyping = useCallback((isTyping) => {
    if (ws && ws.readyState === WebSocket.OPEN && selectedChat) {
      ws.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }));

      updateTypingStatus({
        chat_room_id: selectedChat.id,
        is_typing: isTyping
      });
    }
  }, [ws, selectedChat]);

  // Handle typing for main chat
  useEffect(() => {
    if (newMessage) {
      handleTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 1000);
    } else {
      handleTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, handleTyping]);

  // Handle typing for call chat
  useEffect(() => {
    if (isInCall && callChatMessage) {
      handleTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 1000);
    } else if (!callChatMessage) {
      handleTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [callChatMessage, isInCall, handleTyping]);

  // Clean up typing users who stopped typing
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev =>
        prev.filter(user => now - user.lastTyping < 3000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallDuration(0);
  };

  const handleSendCallChatMessage = async (message) => {
    if (!message.trim() || !selectedChat) return;

    try {
      // Send via WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'chat_message',
          message: message,
          message_type: 'text'
        }));
      }

      // Also send via API
      await sendMessage({
        chat_room_id: selectedChat.id,
        content: message,
        message_type: 'text'
      });

      // Clear input
      setCallChatMessage('');
    } catch (error) {
      console.error('Error sending call chat message:', error);
      alert(`Failed to send message: ${error.message}`);
    }
  };

  const handleInitiateCall = async (callType = 'video', isConference = false) => {
    if (!selectedChat) {
      alert('Please select a chat first');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });

      setLocalStream(stream);
      setIsInitiator(true);

      let response;
      if (isConference) {
        response = await startConferenceCall({
          chat_room_id: selectedChat.id,
          call_type: callType
        });
      } else {
        response = await initiateVideoCall({
          chat_room_id: selectedChat.id,
          call_type: callType
        });
      }

      if (response.success) {
        const callId = response.call?.call_id || response.call_id;

        setVideoCallData({
          ...response.call,
          call_type: callType,
          is_conference: isConference,
          caller_name: full_name
        });

        initCallWebSocket(callId);
        startCallTimer();
        setIsInCall(true);
      }

    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const handleAcceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCallData.call_type === 'video',
        audio: true
      });

      setLocalStream(stream);
      setIsInCall(true);

      if (incomingCallData.is_conference) {
        const response = await joinConferenceCall({
          call_id: incomingCallData.call_id
        });

        if (response.success) {
          initCallWebSocket(incomingCallData.call_id);
          setVideoCallData({
            ...incomingCallData,
            participants: response.call?.participants || []
          });
          startCallTimer();
        }
      }

      setShowIncomingCall(false);
      setIncomingCallData(null);

    } catch (error) {
      console.error('Error accepting call:', error);
      alert('Failed to accept call');
    }
  };

  const handleRejectCall = () => {
    if (callWs && callWs.readyState === WebSocket.OPEN) {
      callWs.send(JSON.stringify({
        type: 'call_reject',
        call_id: incomingCallData?.call_id
      }));
    }

    setShowIncomingCall(false);
    setIncomingCallData(null);
  };

  const handleEndCall = () => {
    if (callWs && callWs.readyState === WebSocket.OPEN) {
      callWs.send(JSON.stringify({
        type: 'call_end',
        call_id: videoCallData?.call_id
      }));
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    stopCallTimer();
    setIsInCall(false);
    setIsInitiator(false);
    setVideoCallData(null);
    setCallParticipants([]);
    setRemoteStreams({});
    setUserMediaStates({});
    setScreenSharingUser(null);
    setActiveSpeaker(null);

    if (callWs) {
      callWs.close();
      setCallWs(null);
    }
  };

  const handleToggleMedia = (mediaType, enabled) => {
    if (mediaType === 'audio') {
      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
    } else if (mediaType === 'video') {
      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
    }

    if (callWs && callWs.readyState === WebSocket.OPEN) {
      callWs.send(JSON.stringify({
        type: 'media_state',
        media_type: mediaType,
        enabled: enabled
      }));
    }
  };

  const handleScreenShare = async (startSharing) => {
    if (startSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        if (callWs && callWs.readyState === WebSocket.OPEN) {
          callWs.send(JSON.stringify({
            type: 'screen_share',
            is_sharing: true,
            stream_id: 'screen_stream_' + Date.now()
          }));
        }

      } catch (error) {
        console.error('Error starting screen share:', error);
      }
    } else {
      if (callWs && callWs.readyState === WebSocket.OPEN) {
        callWs.send(JSON.stringify({
          type: 'screen_share',
          is_sharing: false
        }));
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    setSendingMessage(true);
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'chat_message',
          message: newMessage,
          message_type: 'text'
        }));
      }

      await sendMessage({
        chat_room_id: selectedChat.id,
        content: newMessage,
        message_type: 'text'
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
        setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
        // Also remove from call chat messages if in call
        if (isInCall) {
          setCallChatMessages(prev => prev.filter(msg => msg.id !== messageId));
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        alert(`Failed to delete message: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    fetchAllData();

    return () => {
      if (ws) ws.close();
      if (callWs) callWs.close();
      stopCallTimer();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [chatsResponse, mentorshipsResponse, departmentsResponse] = await Promise.all([
        getAllChats(),
        getAllMentorships(),
        getAllDepartments()
      ]);

      let allChats = [];
      const chatIdSet = new Set();

      const processChats = (chatArray) => {
        if (Array.isArray(chatArray)) {
          chatArray.forEach(chat => {
            if (chat && chat.id && !chatIdSet.has(chat.id)) {
              chatIdSet.add(chat.id);
              allChats.push(chat);
            }
          });
        }
      };

      if (chatsResponse.my_chats) processChats(chatsResponse.my_chats);
      if (chatsResponse.mentorship_chats) processChats(chatsResponse.mentorship_chats);
      if (chatsResponse.department_chats) processChats(chatsResponse.department_chats);
      if (chatsResponse.staff_chats) processChats(chatsResponse.staff_chats);
      if (chatsResponse.all_chats) processChats(chatsResponse.all_chats);

      allChats.sort((a, b) => {
        const timeA = a.last_message?.time || a.updated_at || a.created_at;
        const timeB = b.last_message?.time || b.updated_at || b.created_at;
        return new Date(timeB) - new Date(timeA);
      });

      setChats(allChats);
      setMentorships(mentorshipsResponse.mentorships || mentorshipsResponse.data || []);
      setDepartments(departmentsResponse.departments || departmentsResponse.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setChatMessages([]);
    setShowAudioRecorder(false);

    initChatWebSocket(chat.id);

    try {
      const response = await getChatMessages(chat.id);
      if (response && Array.isArray(response.messages)) {
        setChatMessages(response.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const filteredChats = useMemo(() => {
    let filtered = [];
    const chatIdSet = new Set();

    chats.forEach(chat => {
      let shouldInclude = true;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          chat.name?.toLowerCase().includes(searchLower) ||
          chat.participants?.some(p =>
            p.user?.full_name?.toLowerCase().includes(searchLower) ||
            p.user?.email?.toLowerCase().includes(searchLower)
          );

        if (!matchesSearch) shouldInclude = false;
      }

      if (filters.chat_type !== 'all' && chat.chat_type !== filters.chat_type) {
        shouldInclude = false;
      }

      if (filters.mentorship !== 'all' && chat.mentorship?.id != filters.mentorship) {
        shouldInclude = false;
      }

      if (filters.department !== 'all') {
        let departmentMatch = false;
        if (chat.department) {
          if (typeof chat.department === 'object') {
            departmentMatch = chat.department.id == filters.department || chat.department.name == filters.department;
          } else {
            departmentMatch = chat.department == filters.department;
          }
        }
        if (!departmentMatch) shouldInclude = false;
      }

      if (shouldInclude && chat.id && !chatIdSet.has(chat.id)) {
        chatIdSet.add(chat.id);
        filtered.push(chat);
      }
    });

    return filtered;
  }, [chats, filters]);

  const renderChatWindow = () => {
    if (!selectedChat) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Select a chat</h3>
            <p className="mt-2 text-gray-600">Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedChat.chat_type === 'one_on_one' ? 'bg-blue-100' :
                selectedChat.chat_type === 'mentorship_group' ? 'bg-green-100' :
                  selectedChat.chat_type === 'department_group' ? 'bg-purple-100' :
                    'bg-gray-100'
                }`}>
                {selectedChat.chat_type === 'one_on_one' ? (
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-lg">{selectedChat.name || 'Unnamed Chat'}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Badge className={getChatTypeBadge(selectedChat.chat_type).className}>
                    {getChatTypeBadge(selectedChat.chat_type).label}
                  </Badge>
                  <span>{selectedChat.participants?.length || 0} participants</span>

                  {typingUsers.length > 0 && (
                    <span className="text-blue-600 italic">
                      {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>

              {connectionError && (
                <div className="text-red-600 text-xs italic">
                  {connectionError}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInitiateCall('video', false)}
                title="Start Video Call"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInitiateCall('audio', false)}
                title="Start Audio Call"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInitiateCall('video', true)}
                title="Start Conference Call"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Button>

              {selectedChat.can_manage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManageParticipants(true)}
                  title="Manage Participants"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {selectedChat.mentorship && (
              <div className="text-gray-600">
                <span className="font-medium">Mentorship:</span>{' '}
                {selectedChat.mentorship.mentor?.full_name || selectedChat.mentorship.mentor} → {selectedChat.mentorship.mentee?.full_name || selectedChat.mentorship.mentee}
              </div>
            )}
            {selectedChat.department && (
              <div className="text-gray-600">
                <span className="font-medium">Department:</span>{' '}
                {typeof selectedChat.department === 'object' ? selectedChat.department.name : selectedChat.department}
              </div>
            )}
            {selectedChat.created_at && (
              <div className="text-gray-600">
                <span className="font-medium">Created:</span> {formatTime(selectedChat.created_at)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 chat-messages-container">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwn={message.is_own_message}
                  onDelete={handleDeleteMessage}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4 bg-white">
          <form onSubmit={handleSendMessage} className="space-y-2">
            {typingUsers.length > 0 && (
              <div className="text-sm text-blue-600 italic">
                {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            <div className="flex space-x-2">
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setShowFileUpload(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Attach files"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>

              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                disabled={sendingMessage || showAudioRecorder}
              />

              <Button
                type="submit"
                disabled={sendingMessage || !newMessage.trim() || showAudioRecorder}
              >
                {sendingMessage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Send'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat Management</h1>
              <p className="text-gray-600 mt-1">
                Admin panel for managing all chat rooms and conversations
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={fetchAllData}
                variant="outline"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>

              <Button
                onClick={() => setShowCreateChat(true)}
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="w-full md:w-1/3 border-r flex flex-col">
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Chats ({chats.length})</h2>
                <Button onClick={() => setShowCreateChat(true)} size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Chat
                </Button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Input
                    placeholder="Search chats, users, or departments..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filters.chat_type}
                    onChange={(e) => setFilters({ ...filters, chat_type: e.target.value })}
                  >
                    <option value="all">All Types</option>
                    <option value="one_on_one">1:1 Chats</option>
                    <option value="mentorship_group">Mentorship</option>
                    <option value="department_group">Department</option>
                    <option value="staff_chat">Staff</option>
                    <option value="global">Global</option>
                  </Select>

                  <Select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id || dept.name} value={dept.id || dept.name}>
                        {dept.name || 'Unknown'}
                      </option>
                    ))}
                  </Select>
                </div>

                <Select
                  value={filters.mentorship}
                  onChange={(e) => setFilters({ ...filters, mentorship: e.target.value })}
                >
                  <option value="all">All Mentorships</option>
                  {mentorships.map(mentorship => (
                    <option key={mentorship.id} value={mentorship.id}>
                      {mentorship.mentor?.full_name || mentorship.mentor} → {mentorship.mentee?.full_name || mentorship.mentee}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading chats...</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No chats found
                </div>
              ) : (
                filteredChats.map(chat => (
                  <div
                    key={chat.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                      }`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${chat.chat_type === 'one_on_one' ? 'bg-blue-100' :
                          chat.chat_type === 'mentorship_group' ? 'bg-green-100' :
                            chat.chat_type === 'department_group' ? 'bg-purple-100' :
                              'bg-gray-100'
                          }`}>
                          {chat.chat_type === 'one_on_one' ? (
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                        </div>
                        {chat.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unread_count}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">{chat.name || 'Unnamed Chat'}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTime(chat.last_message?.time || chat.updated_at || chat.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.last_message ? (
                              <>
                                <span className="font-medium">{chat.last_message.sender || 'Someone'}: </span>
                                {chat.last_message.content || ''}
                              </>
                            ) : (
                              'No messages yet'
                            )}
                          </p>
                          <Badge className={getChatTypeBadge(chat.chat_type).className}>
                            {getChatTypeBadge(chat.chat_type).label}
                          </Badge>
                        </div>

                        <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                          <span>{chat.participants?.length || 0} participants</span>
                          {chat.mentorship && (
                            <span>• {chat.mentorship.mentor?.full_name || chat.mentorship.mentor} → {chat.mentorship.mentee?.full_name || chat.mentorship.mentee}</span>
                          )}
                          {chat.department && (
                            <span>• {typeof chat.department === 'object' ? chat.department.name : chat.department}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {renderChatWindow()}
        </div>
      </div>

      <CreateChatModal
        open={showCreateChat}
        onClose={() => setShowCreateChat(false)}
        onCreate={fetchAllData}
      />

      <ManageParticipantsModal
        chat={selectedChat}
        open={showManageParticipants}
        onClose={() => setShowManageParticipants(false)}
        onUpdate={fetchAllData}
      />

      <FileUploadModal
        open={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onUpload={() => {
          if (selectedChat) {
            handleSelectChat(selectedChat);
          }
        }}
        chatRoomId={selectedChat?.id}
      />

      <IncomingCallModal
        open={showIncomingCall}
        callData={incomingCallData}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      <VideoCallModal
        open={isInCall}
        onClose={handleEndCall}
        callData={videoCallData}
        isInitiator={isInitiator}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
        onEndCall={handleEndCall}
        onToggleMedia={handleToggleMedia}
        onScreenShare={handleScreenShare}
        onSendCallChatMessage={handleSendCallChatMessage}
        localStream={localStream}
        remoteStreams={remoteStreams}
        participants={callParticipants}
        callDuration={callDuration}
        userMediaStates={userMediaStates}
        screenSharingUser={screenSharingUser}
        activeSpeaker={activeSpeaker}
        // New props for chat integration
        currentChat={selectedChat}
        chatMessages={callChatMessages}
        newCallChatMessage={callChatMessage}
        onCallChatMessageChange={setCallChatMessage}
        typingUsers={typingUsers}
        currentUser={{ id: parseInt(localStorage.getItem('user_id')) }}
      />

      <style>{`
        .chat-messages-container {
          scroll-behavior: smooth;
        }
        .chat-messages-container::-webkit-scrollbar {
          width: 6px;
        }
        .chat-messages-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .chat-messages-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .chat-messages-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}