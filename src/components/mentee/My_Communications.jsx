import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

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
const getAllChats = async () => fetchAPI('/chats/my-chats/');
const getChatMessages = async (roomId) => fetchAPI(`/chats/${roomId}/messages/`);
const getOrCreateOneOnOne = async (userId) => fetchAPI(`/chats/one-on-one/${userId}/`);
const sendMessage = async (data) => fetchAPI('/chats/messages/send/', 'POST', data);
const deleteMessage = async (messageId) => fetchAPI(`/chats/messages/${messageId}/delete/`, 'DELETE');
const uploadFile = async (formData) => fetchAPI('/chats/messages/upload/', 'POST', formData, true);
const updateTypingStatus = async (data) => fetchAPI('/chats/typing/update/', 'POST', data);
const markMessagesAsRead = async (roomId) => fetchAPI(`/chats/${roomId}/mark-read/`, 'POST');

// Video Call APIs
const initiateVideoCall = async (data) => fetchAPI('/chats/video-call/initiate/', 'POST', data);
const startConferenceCall = async (data) => fetchAPI('/chats/start-conference/', 'POST', data);
const joinConferenceCall = async (data) => fetchAPI('/chats/join-conference/', 'POST', data);

// User Data APIs
const getCurrentUser = async () => fetchAPI('/profile/');

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

// WhatsApp-style Audio Recorder Component
const AudioRecorder = ({ onRecordingComplete, onCancel, maxDuration = 300 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioURL);

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

      // Initialize audio visualization
      initializeAudioVisualization(stream);

    } catch (error) {
      console.error('Error starting recording:', error);
      // alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentPlayTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const handleCancel = () => {
    stopRecording();
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    onCancel();
  };

  const handleDelete = () => {
    stopRecording();
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL('');
    setCurrentPlayTime(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Record Voice Message</h3>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-2xl font-mono">
            {formatTime(isRecording ? recordingTime : currentPlayTime)}
          </div>
          <div className="text-sm text-gray-500">
            {isRecording ? 'Recording...' : audioBlob ? 'Preview' : 'Ready to record'}
          </div>
        </div>

        {/* Audio Controls - WhatsApp Style */}
        <div className="flex justify-center space-x-4 items-center">
          {!audioBlob ? (
            <>
              {isRecording ? (
                <div className="flex items-center space-x-4">
                  {/* Visual indicator for recording */}
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-500 text-sm">Recording</span>
                  </div>

                  <button
                    onClick={stopRecording}
                    className="flex items-center justify-center bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  className="flex items-center justify-center bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Start Recording
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <button
                  onClick={isPlaying ? pauseRecording : playRecording}
                  className="flex items-center justify-center bg-green-500 text-white px-4 py-3 rounded-full hover:bg-green-600 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  )}
                </button>

                {/* Progress bar for playback */}
                <div className="flex-1 max-w-xs">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-100"
                      style={{ width: `${(currentPlayTime / (duration || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatTime(currentPlayTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {audioBlob && (
          <div className="flex justify-center space-x-2 pt-4">
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Send Voice Message
            </button>
          </div>
        )}

        {/* Hidden audio element for playback */}
        {audioURL && (
          <audio
            ref={audioRef}
            src={audioURL}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
};

// File Preview Modal
const FilePreviewModal = ({ file, open, onClose, onDownload, onView }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isImage = file?.type?.startsWith('image/');
  const isVideo = file?.type?.startsWith('video/');
  const isPDF = file?.type === 'application/pdf';
  const isAudio = file?.type?.startsWith('audio/');

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(file.url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      onDownload?.();
    } catch (err) {
      setError('Failed to download file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInBrowser = () => {
    window.open(file.url, '_blank');
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>{file.name}</DialogTitle>
              <DialogDescription>
                {formatFileSize(file.size)} • {formatDate(file.uploadedAt, true)}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="info">
                {getFileIcon(file.name)}
              </Badge>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col items-center justify-center">
            {isImage ? (
              <div className="max-w-3xl max-h-[60vh] overflow-auto">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            ) : isVideo ? (
              <div className="max-w-3xl w-full">
                <video
                  src={file.url}
                  controls
                  className="w-full rounded-lg"
                  poster={file.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : isPDF ? (
              <div className="w-full h-[60vh]">
                <iframe
                  src={file.url}
                  title={file.name}
                  className="w-full h-full border rounded-lg"
                />
              </div>
            ) : isAudio ? (
              <div className="w-full max-w-md bg-gray-50 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{getFileIcon(file.name)}</div>
                  <h4 className="font-medium">{file.name}</h4>
                </div>
                <audio
                  src={file.url}
                  controls
                  className="w-full"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{getFileIcon(file.name)}</div>
                <h4 className="text-xl font-semibold mb-2">{file.name}</h4>
                <p className="text-gray-600">{formatFileSize(file.size)}</p>
                <p className="text-sm text-gray-500 mt-1">Preview not available for this file type</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="flex space-x-2">
              {!isPDF && !isImage && !isVideo && (
                <Button
                  variant="outline"
                  onClick={handleViewInBrowser}
                >
                  Open in Browser
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                onClick={handleDownload}
                disabled={loading}
              >
                {loading ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Chat Message Component with WhatsApp-style audio player
const ChatMessage = ({ message, isOwn, onDelete, onMessageSent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);

  // Enhanced file type detection - handle both sent and received messages consistently
  const getMessageType = () => {
    // For sent messages (is_own_message: true) or messages we sent
    // For received messages (is_own_message: false)
    
    const attachment = message.attachment || message.file_url;
    const messageType = message.message_type || message.type;
    const content = message.content || '';
    
    // Audio detection
    if (messageType === 'audio' || 
        (attachment && attachment.match(/\.(mp3|wav|ogg|m4a|webm|opus)$/i)) ||
        content.toLowerCase().includes('audio') ||
        content.toLowerCase().includes('voice')) {
      return 'audio';
    }
    
    // Video detection
    if (messageType === 'video' ||
        (attachment && attachment.match(/\.(mp4|avi|mov|webm|mkv)$/i)) ||
        content.toLowerCase().includes('video')) {
      return 'video';
    }
    
    // Image detection
    if (messageType === 'image' ||
        (attachment && attachment.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) ||
        content.toLowerCase().includes('image')) {
      return 'image';
    }
    
    // PDF detection
    if (messageType === 'file' && attachment && attachment.match(/\.pdf$/i)) {
      return 'pdf';
    }
    
    // Other files
    if (messageType === 'file' || (attachment && !message.content)) {
      return 'file';
    }
    
    return 'text';
  };

  const messageType = getMessageType();
  const isAudio = messageType === 'audio';
  const isVideo = messageType === 'video';
  const isImage = messageType === 'image';
  const isPDF = messageType === 'pdf';
  const isFile = messageType === 'file';
  const isText = messageType === 'text';

  // Get the actual file URL - handle different API response structures
  const getFileUrl = () => {
    if (message.attachment) {
      // If it's a full URL
      if (message.attachment.startsWith('http')) {
        return message.attachment;
      }
      // If it's a relative path, construct the full URL
      return `http://127.0.0.1:8000${message.attachment.startsWith('/') ? '' : '/'}${message.attachment}`;
    }
    
    if (message.file_url) {
      if (message.file_url.startsWith('http')) {
        return message.file_url;
      }
      return `http://127.0.0.1:8000${message.file_url.startsWith('/') ? '' : '/'}${message.file_url}`;
    }
    
    return '';
  };

  // Get file name
  const getFileName = () => {
    const url = getFileUrl();
    if (url) {
      return url.split('/').pop() || 'file';
    }
    return message.file_name || message.content || 'attachment';
  };

  // Get file size
  const getFileSize = () => {
    return message.file_size || message.size || 0;
  };

  // Generate fake waveform data for audio messages
  useEffect(() => {
    if (isAudio && !waveformData.length) {
      const fakeWaveform = Array.from({ length: 50 }, () => Math.random() * 40 + 10);
      setWaveformData(fakeWaveform);
    }
  }, [isAudio, waveformData.length]);

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
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const formatAudioTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async (url, filename) => {
    try {
      const fileUrl = url || getFileUrl();
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please check your authentication.');
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const getFileData = () => ({
    name: getFileName(),
    url: getFileUrl(),
    size: getFileSize(),
    type: isAudio ? 'audio/*' :
      isVideo ? 'video/*' :
        isImage ? 'image/*' :
          isPDF ? 'application/pdf' : 'application/octet-stream',
    uploadedAt: message.created_at || message.timestamp || message.sent_at
  });

  return (
    <>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwn ? 'bg-green-100 rounded-br-none' : 'bg-gray-100 rounded-bl-none'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${isOwn ? 'text-green-800' : 'text-gray-800'}`}>
              {isOwn ? 'You' : message.sender?.full_name || message.sender_name || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {formatTime(message.created_at || message.timestamp)}
            </span>
          </div>

          {/* Text Message */}
          {isText && message.content && (
            <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
          )}

          {/* WhatsApp-style Audio Message */}
          {isAudio && (
            <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 flex-shrink-0 transition-colors"
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

                  {/* WhatsApp-style waveform visualization */}
                  <div className="flex items-center h-6 mb-1 gap-0.5">
                    {waveformData.map((height, index) => (
                      <div
                        key={index}
                        className="w-1 bg-gray-300 rounded-full transition-all duration-100"
                        style={{
                          height: `${height}%`,
                          backgroundColor: (index / waveformData.length) < (currentTime / (duration || 1))
                            ? '#10B981'
                            : '#D1D5DB'
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div
                    ref={progressBarRef}
                    className="relative w-full h-1.5 bg-gray-300 rounded-full cursor-pointer"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="absolute top-0 left-0 h-1.5 bg-green-500 rounded-full"
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(getFileUrl(), getFileName())}
                  className="p-2 text-gray-600 hover:text-green-600"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>

              <audio
                ref={audioRef}
                src={getFileUrl()}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="hidden"
              />
            </div>
          )}

          {/* Video Message */}
          {isVideo && (
            <div className="mt-2">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  src={getFileUrl()}
                  controls
                  className="w-full max-h-64"
                  onLoadedMetadata={handleLoadedMetadata}
                  poster={message.thumbnail}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">
                  Video • {formatFileSize(getFileSize())}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview()}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(getFileUrl(), getFileName())}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image Message */}
          {isImage && (
            <div className="mt-2">
              <img
                src={getFileUrl()}
                alt="Attachment"
                className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                onClick={handlePreview}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">
                  Image • {formatFileSize(getFileSize())}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview()}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(getFileUrl(), getFileName())}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PDF Message */}
          {isPDF && (
            <div className="mt-2 p-3 border rounded-lg bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate max-w-[200px]">
                      {getFileName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF • {formatFileSize(getFileSize())}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreview}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Preview"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDownload(getFileUrl(), getFileName())}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other Files */}
          {isFile && (
            <div className="mt-2 p-3 border rounded-lg bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(getFileName())}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate max-w-[200px]">
                      {getFileName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(getFileSize())}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreview}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Preview"
                    disabled={!['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'].includes(getFileName().split('.').pop().toLowerCase())}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDownload(getFileUrl(), getFileName())}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-2 space-x-2 opacity-0 hover:opacity-100 transition-opacity">
            {message.content && (
              <button
                onClick={() => navigator.clipboard.writeText(message.content)}
                className="text-xs text-gray-500 hover:text-gray-700 p-1"
                title="Copy"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            {onDelete && isOwn && (
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

      {/* File Preview Modal */}
      {showPreview && (
        <FilePreviewModal
          file={getFileData()}
          open={showPreview}
          onClose={() => setShowPreview(false)}
          onDownload={() => handleDownload(getFileUrl(), getFileName())}
        />
      )}
    </>
  );
};

// Enhanced Chat Participants Modal
const ChatParticipantsModal = ({ chat, open, onClose, onStartChat, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('participants');

  const otherParticipants = useMemo(() => {
    if (!chat?.participants) return [];
    const currentUserId = currentUser?.id;
    return chat.participants.filter(participant =>
      (participant.user?.id !== currentUserId && participant.id !== currentUserId)
    );
  }, [chat, currentUser]);

  const handleStartChat = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const response = await getOrCreateOneOnOne(userId);

      if (response.success || response.chat) {
        onStartChat(response.chat || response);
        onClose();
      } else {
        setError(response.error || 'Failed to create chat');
      }
    } catch (err) {
      console.error('Error starting chat:', err);
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
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Chat Participants</DialogTitle>
              <DialogDescription>
                Members of "{chat?.name || 'Unnamed Chat'}"
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getChatTypeBadge(chat?.chat_type).className}>
                {getChatTypeBadge(chat?.chat_type).label}
              </Badge>
              <Badge variant="outline">
                {chat?.participants?.length || 0} members
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="border-b">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'participants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Participants ({chat?.participants?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Chat Info
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="space-y-4">
              {chat?.participants?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <p className="mt-4">No participants</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Current User */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {currentUser?.full_name?.charAt(0) || 'Y'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{currentUser?.full_name || 'You'}</h4>
                        <p className="text-sm text-gray-600">{currentUser?.role || 'user'} (You)</p>
                      </div>
                    </div>
                  </div>

                  {/* Other Participants */}
                  {otherParticipants.map((participant, index) => {
                    const user = participant.user || participant;
                    const isAdminOrHR = user.role === 'admin' || user.role === 'hr';

                    return (
                      <div key={user.id || index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-medium text-lg">
                              {user.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{user.full_name || 'Unknown User'}</h4>
                            <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {user.role || 'user'}
                              </Badge>
                              {isAdminOrHR && (
                                <Badge variant="info" className="text-xs">
                                  System
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartChat(user.id)}
                            disabled={loading}
                          >
                            Chat With
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                      <p className="font-medium">{chat?.name || '(Unnamed Chat)'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Chat Type:</span>
                      <div className="mt-1">
                        <Badge className={getChatTypeBadge(chat?.chat_type).className}>
                          {getChatTypeBadge(chat?.chat_type).label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Total Members:</span>
                      <p className="font-medium">{chat?.participants?.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Timestamps</h4>
                  <div className="space-y-3">
                    {chat?.created_at && (
                      <div>
                        <span className="text-sm text-gray-600">Created:</span>
                        <p className="font-medium">{formatDate(chat.created_at, true)}</p>
                      </div>
                    )}
                    {chat?.updated_at && (
                      <div>
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <p className="font-medium">{formatDate(chat.updated_at, true)}</p>
                      </div>
                    )}
                    {chat?.last_message?.time && (
                      <div>
                        <span className="text-sm text-gray-600">Last Message:</span>
                        <p className="font-medium">{formatDate(chat.last_message.time, true)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {chat?.mentorship && (
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

              {chat?.department && (
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Incoming Call Modal
const IncomingCallModal = ({ open, callData, onAccept, onReject }) => {
  const [ringing, setRinging] = useState(true);

  useEffect(() => {
    if (open) {
      setRinging(true);
      // Create a simple beep sound for ringing
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      let oscillator;

      try {
        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();

        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Create beeping effect
        let time = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, time);

        const beep = () => {
          gainNode.gain.linearRampToValueAtTime(0.5, time + 0.1);
          gainNode.gain.linearRampToValueAtTime(0, time + 0.2);
          time += 0.5;

          if (ringing && time - audioContext.currentTime < 30) {
            setTimeout(beep, 500);
          }
        };

        beep();

        return () => {
          if (oscillator) {
            oscillator.stop();
          }
          audioContext.close();
        };
      } catch (error) {
        console.log('Could not play ringtone:', error);
      }
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
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Call Modal - Updated version with chat room integration
const VideoCallModal = ({
  open,
  onClose,
  videoCallData,
  isInitiator,
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
  onCallChatMessageChange = () => { },
  typingUsers = [],
  currentUser = null
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const chatMessagesEndRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [layout, setLayout] = useState('grid');

  // Setup local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Initialize remote video refs
  useEffect(() => {
    const refs = {};
    participants.forEach(participant => {
      if (participant.id) {
        refs[participant.id] = React.createRef();
      }
    });
    remoteVideoRefs.current = refs;
  }, [participants]);

  // Setup remote video streams
  useEffect(() => {
    Object.keys(remoteStreams).forEach(userId => {
      if (remoteStreams[userId] && remoteVideoRefs.current[userId]?.current) {
        remoteVideoRefs.current[userId].current.srcObject = remoteStreams[userId];
      }
    });
  }, [remoteStreams]);

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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    const remoteStream = remoteStreams[participant.id];

    // Create ref if it doesn't exist
    if (!remoteVideoRefs.current[participant.id]) {
      remoteVideoRefs.current[participant.id] = React.createRef();
    }

    return (
      <div
        key={participant.id || index}
        className={`relative rounded-lg overflow-hidden bg-gray-800 ${isActiveSpeaker ? 'ring-2 ring-blue-500' : ''}`}
      >
        {remoteStream && mediaState.video ? (
          <video
            ref={remoteVideoRefs.current[participant.id]}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl text-white">
                  {participant.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <p className="text-white font-medium">{participant.full_name || 'Unknown'}</p>
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
        )}

        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
            {mediaState.audio ? '🎤' : '🔇'} {participant.full_name?.split(' ')[0] || 'User'}
          </div>
        </div>
      </div>
    );
  };

  if (!open) return null;

  const totalParticipants = participants.length + 1; // +1 for local user

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-black/80 text-white p-4 flex justify-between items-center z-10">
        <div>
          <h3 className="text-lg font-semibold">
            {videoCallData?.call_type === 'audio' ? 'Audio Call' : 'Video Call'}
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <span className={participants.length > 0 ? 'text-green-400' : 'text-yellow-400'}>
              ● {participants.length > 0 ? `Connected with ${participants.length} participant${participants.length !== 1 ? 's' : ''}` : 'Waiting for participants...'}
            </span>
            <span>{formatDuration(callDuration)}</span>
            {participants.length === 0 && !videoCallData?.is_conference && (
              <span className="text-yellow-300">Calling... (Waiting for others to join)</span>
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

      {/* Main Video Area */}
      <div className="flex h-screen pt-16 pb-32">
        <div className={`flex-1 p-4 ${showParticipants || showChat ? 'lg:w-3/4' : 'w-full'}`}>
          {totalParticipants === 1 && !videoCallData?.is_conference && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
              <div className="bg-black/70 text-white p-6 rounded-lg max-w-md">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📞</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">Calling...</h4>
                <p className="text-gray-300 mb-4">Waiting for others to join the call</p>
              </div>
            </div>
          )}

          {/* Video Grid */}
          <div className={`grid gap-4 h-full ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            layout === 'speaker' ? 'grid-cols-1' :
              'grid-cols-1 md:grid-cols-2'
            } ${totalParticipants === 1 && !videoCallData?.is_conference ? 'opacity-50' : ''}`}>

            {/* Local Video */}
            <div className={`relative rounded-lg overflow-hidden bg-gray-800 ${layout === 'speaker' ? 'col-span-1' : ''}`}>
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
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
          </div>
        </div>

        {/* Sidebar for Participants and Chat */}
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

            {/* Participants List */}
            {showParticipants && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {/* Local User */}
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

                  {/* Remote Participants */}
                  {participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">
                            {participant.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{participant.full_name || 'Unknown'}</p>
                          <p className="text-gray-400 text-xs">{participant.role || 'Participant'}</p>
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

            {/* Call Chat - Updated to show actual chat room */}
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

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-4">
        <div className="flex flex-col items-center">
          {/* Layout Controls */}
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
          </div>

          {/* Media Controls */}
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

            {/* End Call Button */}
            <button
              onClick={onEndCall}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700"
              title="End call"
            >
              <span className="text-2xl">📞</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        video {
          transform: scaleX(-1); /* Mirror effect for front camera */
        }
      `}</style>
    </div>
  );
};

// Main MenteeChatManagement Component
export default function MentorMenteeChatManagement() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);

  // Video call states
  const [videoCallData, setVideoCallData] = useState(null);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [callParticipants, setCallParticipants] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [userMediaStates, setUserMediaStates] = useState({});
  const [screenSharingUser, setScreenSharingUser] = useState(null);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [userNotificationWs, setUserNotificationWs] = useState(null);

  // Call chat states
  const [callChatMessage, setCallChatMessage] = useState('');
  const [callChatMessages, setCallChatMessages] = useState([]);
  const location = useLocation();

  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [callWs, setCallWs] = useState(null);
  const timerRef = useRef(null);



  const [filters, setFilters] = useState({
    search: '',
    chat_type: 'all'
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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

  useEffect(() => {
    const handleAutoOpenMentorshipChat = async () => {
      // Check if we have mentorship data in location state
      if (location.state?.autoOpenChat && location.state?.mentorshipId) {
        try {
          console.log('Auto-opening chat for mentorship:', location.state.mentorshipId);

          // Find the chat associated with this mentorship
          const mentorshipChat = chats.find(chat =>
            chat.mentorship?.id === location.state.mentorshipId ||
            chat.name?.includes(`Mentorship: ${location.state.mentorshipId}`) ||
            chat.chat_type === 'mentorship_group' &&
            chat.participants?.some(p => {
              const user = p.user || p;
              return user.id === location.state.mentorshipData?.mentor?.id
            })
          );

          if (mentorshipChat) {
            console.log('Found mentorship chat:', mentorshipChat);
            await handleSelectChat(mentorshipChat);
          } else {
            console.log('No existing chat found, attempting to create/find...');
            // Try to find a one-on-one chat with the mentor
            if (location.state.mentorshipData?.mentor?.id) {
              const mentorId = location.state.mentorshipData.mentor.id;

              // Look for existing one-on-one chat with mentor
              const existingChat = chats.find(chat =>
                chat.chat_type === 'one_on_one' &&
                chat.participants?.some(p => {
                  const user = p.user || p;
                  return user.id === mentorId
                })
              );

              if (existingChat) {
                await handleSelectChat(existingChat);
              } else {
                // Create a new one-on-one chat
                console.log('Creating new chat with mentor:', mentorId);
                const response = await getOrCreateOneOnOne(mentorId);
                if (response.success || response.chat) {
                  const newChat = response.chat || response;
                  // Refresh chats list
                  await fetchInitialData();
                  // Select the new chat
                  await handleSelectChat(newChat);
                }
              }
            }
          }

          // Clear the state to prevent re-triggering
          window.history.replaceState({}, document.title);

        } catch (error) {
          console.error('Error auto-opening mentorship chat:', error);
        }
      }
    };

    // Only run if we have chats loaded
    if (chats.length > 0 && !loading) {
      handleAutoOpenMentorshipChat();
    }
  }, [chats, loading, location.state]);

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

      websocket.onopen = () => {
        setIsConnected(true);
        setConnectionError('');
      };

      websocket.onclose = (event) => {
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

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);


  const handleIncomingMessage = (data) => {
    const newMessage = {
      id: data.message_id,
      sender: {
        full_name: data.sender_name,
        id: data.sender_id
      },
      content: data.message,
      message_type: data.message_type || 'text',
      attachment: data.attachment,
      created_at: data.timestamp,
      is_own_message: data.sender_id === parseInt(localStorage.getItem('user_id'))
    };

    setChatMessages(prev => [...prev, newMessage]);
    scrollToBottom();

    // Refresh chats to update last message preview
    fetchChats();
  };

  const handleInitiateCall = async (callType = 'video', isConference = false, specificUserId = null) => {
    try {
      console.log('🎬 Starting call initiation process...');

      // If we need to create a one-on-one chat first
      let chatRoomId = selectedChat?.id;

      if (specificUserId && !selectedChat) {
        console.log('👤 Creating one-on-one chat with user:', specificUserId);
        const chatResponse = await getOrCreateOneOnOne(specificUserId);

        if (chatResponse.success || chatResponse.chat) {
          const newChat = chatResponse.chat || chatResponse;
          chatRoomId = newChat.id;
          // Select this new chat
          await handleSelectChat(newChat);
        } else {
          throw new Error('Failed to create chat for call');
        }
      }

      if (!chatRoomId) {
        alert('Please select a chat or user first');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });

      console.log('✅ Media stream obtained');
      setLocalStream(stream);
      setIsInitiator(true);

      let response;
      const requestPayload = {
        chat_room_id: chatRoomId,
        call_type: callType,
        target_user_id: specificUserId
      };

      console.log('📤 Sending call request with payload:', requestPayload);

      if (isConference) {
        console.log('👥 Initiating conference call...');
        response = await startConferenceCall(requestPayload);
      } else {
        console.log('👤 Initiating one-on-one call...');
        response = await initiateVideoCall(requestPayload);
      }

      console.log('📥 API Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        const callId = response.call?.call_id || response.call_id || response.call?.call_id;

        if (!callId) {
          console.error('❌ No call_id received in response:', response);
          throw new Error('No call ID received from server');
        }

        console.log('🎉 Call initiated successfully!', {
          callId,
          callType,
          isConference
        });

        // FIX: Use currentUser.full_name instead of undefined full_name variable
        setVideoCallData({
          ...response.call,
          call_id: callId,
          call_type: callType,
          is_conference: isConference,
          caller_name: currentUser?.full_name || 'You'  // <-- Fixed this line
        });

        console.log('🌐 Initializing call WebSocket...');
        initCallWebSocket(callId);

        console.log('⏱️ Starting call timer...');
        startCallTimer();

        setIsInCall(true);
        console.log('✅ Call is now active - user is in call');

      } else {
        console.error('❌ Call initiation failed in API response:', response);
        console.error('Error details:', response.error || response.detail || 'Unknown error');

        // Clean up media stream on failure
        stream.getTracks().forEach(track => track.stop());
        setLocalStream(null);

        alert(`Failed to start call: ${response.error || response.detail || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('❌ Error during call initiation:', error);

      // Log specific permission errors
      if (error.name === 'NotAllowedError') {
        console.error('🔒 Permission denied by user');
        alert('Please allow camera and microphone access to start a call.');
      } else if (error.name === 'NotFoundError') {
        console.error('📷 No camera/microphone found');
        alert('No camera or microphone found. Please check your device.');
      } else if (error.name === 'NotReadableError') {
        console.error('⚠️ Camera/microphone is already in use');
        alert('Camera or microphone is already in use by another application.');
      } else {
        alert(`Could not start call: ${error.message}`);
      }
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

  const handleWebSocketMessage = (data) => {
    console.log('📨 Chat WebSocket message received:', data);

    switch (data.type) {
      case 'chat_message':
        handleIncomingMessage(data);
        break;
      case 'typing_status':
        handleTypingStatus(data);
        break;
      case 'video_call_offer':
        console.log('📞 Incoming video call offer:', data);
        setIncomingCallData({
          call_id: data.call_id,
          caller_id: data.caller_id,
          caller_name: data.caller_name,
          call_type: data.call_type,
          chat_room: data.chat_room
        });
        setShowIncomingCall(true);
        break;
      case 'conference_call_incoming':
        console.log('👥 Incoming conference call:', data);
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
        break;
      // ADD THESE NEW HANDLERS:
      case 'user_joined_call':
        console.log('👤 User joined call:', data);
        const newParticipant = {
          id: data.user_id,
          full_name: data.full_name,
          role: 'participant'
        };
        setCallParticipants(prev => {
          const exists = prev.find(p => p.id === data.user_id);
          if (!exists) {
            return [...prev, newParticipant];
          }
          return prev;
        });
        break;
      case 'user_left_call':
        console.log('👤 User left call:', data);
        setCallParticipants(prev => prev.filter(p => p.id !== data.user_id));
        break;
      case 'call_participants_update':
        console.log('👥 Call participants update:', data);
        if (data.participants) {
          setCallParticipants(data.participants);
        }
        break;
      default:
        console.log('❓ Unknown WebSocket message type:', data.type);
    }
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

  const handleScreenShare = (data) => {
    if (data.is_sharing) {
      setScreenSharingUser({
        id: data.sender_id,
        full_name: data.sender_name
      });
    } else {
      setScreenSharingUser(null);
    }
  };


  const initCallWebSocket = (callId) => {
    console.log('🔌 Initializing call WebSocket for callId:', callId);

    if (callWs) {
      console.log('🔄 Closing existing call WebSocket connection...');
      callWs.close();
    }

    const token = localStorage.getItem('access_token');
    const wsUrl = `ws://127.0.0.1:8000/ws/video-call/${callId}/?token=${token}`;

    console.log('🌐 WebSocket URL:', wsUrl);

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('✅ Video Call WebSocket connected successfully');
      console.log('📞 WebSocket readyState:', websocket.readyState);
    };

    websocket.onclose = (event) => {
      console.log('❌ Video Call WebSocket disconnected');
    };

    websocket.onerror = (error) => {
      console.error('💥 Video Call WebSocket error:', error);
    };

    websocket.onmessage = (event) => {
      try {
        console.log('📨 Received WebSocket message:', event.data);
        const data = JSON.parse(event.data);
        console.log('📋 Parsed message data:', data);

        // Handle different message types
        switch (data.type) {
          case 'user_joined_call':
            console.log('👤 User joined call:', data);
            handleUserJoinedCall(data);
            break;
          case 'user_left_call':
            console.log('👤 User left call:', data);
            handleUserLeftCall(data);
            break;
          case 'webrtc_offer':
            console.log('📞 WebRTC offer received:', data);
            handleWebRTCOffer(data);
            break;
          case 'webrtc_answer':
            console.log('📞 WebRTC answer received:', data);
            handleWebRTCAnswer(data);
            break;
          case 'ice_candidate':
            console.log('🧊 ICE candidate received:', data);
            handleICECandidate(data);
            break;
          case 'media_state':
            console.log('🎤 Media state update:', data);
            handleMediaState(data);
            break;
          case 'screen_share':
            console.log('🖥️ Screen share update:', data);
            handleScreenShare(data);
            break;
          case 'call_chat_message':
            console.log('💬 Call chat message:', data);
            handleCallChatMessage(data);
            break;
          case 'call_end':
            console.log('📞 Call ended:', data);
            handleCallEnd(data);
            break;
          default:
            console.log('❓ Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    setCallWs(websocket);
    console.log('🎯 Call WebSocket instance created and set');
  };

  const handleUserJoinedCall = (data) => {
    const newParticipant = {
      id: data.user_id,
      full_name: data.full_name,
      role: 'participant'
    };

    setCallParticipants(prev => {
      const exists = prev.find(p => p.id === data.user_id);
      if (!exists) {
        return [...prev, newParticipant];
      }
      return prev;
    });
  };

  const handleWebRTCOffer = async (data) => {
    console.log('📞 Handling WebRTC offer from:', data.sender_name);
    console.log('Offer data:', data.offer);

    // Validate offer data
    if (!data.offer || typeof data.offer !== 'object') {
      console.error('❌ Invalid WebRTC offer format:', data.offer);
      return;
    }

    // Create a new RTCPeerConnection
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    try {
      const peerConnection = new RTCPeerConnection(configuration);

      // Add local stream tracks to connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });
      }

      // Validate and normalize SDP type
      const offerData = data.offer;
      const normalizedOffer = {
        type: 'offer', // Always use lowercase 'offer'
        sdp: offerData.sdp || ''
      };

      console.log('📋 Normalized offer:', normalizedOffer);

      // Set remote description (the offer)
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(normalizedOffer)
      );

      // Create and set local description (answer)
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer back via WebSocket
      if (callWs && callWs.readyState === WebSocket.OPEN) {
        callWs.send(JSON.stringify({
          type: 'webrtc_answer',
          target_user_id: data.sender_id,
          answer: answer
        }));
        console.log('✅ Sent WebRTC answer to:', data.sender_id);
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && callWs && callWs.readyState === WebSocket.OPEN) {
          callWs.send(JSON.stringify({
            type: 'ice_candidate',
            target_user_id: data.sender_id,
            candidate: event.candidate
          }));
        }
      };

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log('🎬 Received remote track:', event.track.kind);
        // Store remote stream
        setRemoteStreams(prev => ({
          ...prev,
          [data.sender_id]: event.streams[0]
        }));
      };

    } catch (error) {
      console.error('❌ WebRTC offer handling error:', error);
    }
  };

  const handleWebRTCAnswer = (data) => {
    console.log('📞 Handling WebRTC answer from:', data.sender_name);
    console.log('Answer data:', data.answer);
  };

  const handleUserLeftCall = (data) => {
    setCallParticipants(prev => prev.filter(p => p.id !== data.user_id));
  };

  const handleCallChatMessage = (data) => {
    console.log('💬 Call chat message from:', data.sender_name);
    console.log('Message:', data.message);
  };

  const handleEndCall = () => {
    console.log('📞 Ending call...');

    if (callWs && callWs.readyState === WebSocket.OPEN) {
      console.log('📤 Sending call end message via WebSocket...');
      callWs.send(JSON.stringify({
        type: 'call_end',
        call_id: videoCallData?.call_id
      }));
    }

    if (localStream) {
      console.log('🎥 Stopping local media stream...');
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
    }

    stopCallTimer();
    setIsInCall(false);
    setIsInitiator(false);
    setVideoCallData(null);
    setCallParticipants([]);
    setUserMediaStates({});
    setScreenSharingUser(null);
    setActiveSpeaker(null);

    if (callWs) {
      console.log('🔌 Closing call WebSocket...');
      callWs.close();
      setCallWs(null);
    }

    console.log('✅ Call ended successfully');
  };

  const startCallTimer = () => {
    console.log('⏱️ Starting call timer...');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    console.log('✅ Call timer started');
  };

  const stopCallTimer = () => {
    console.log('⏱️ Stopping call timer...');
    console.log('📊 Final call duration:', callDuration, 'seconds');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log('✅ Call timer stopped');
    }
    setCallDuration(0);
  };

  const handleTypingStatus = (data) => {
    const currentUserId = currentUser?.id;
    const isCurrentUser = data.user_id === currentUserId;

    setTypingUsers(prev => {
      const existingIndex = prev.findIndex(user => user.id === data.user_id);

      if (data.is_typing) {
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            id: data.user_id,
            name: isCurrentUser ? 'You' : data.full_name || data.full_name,
            lastTyping: Date.now()
          };
          return updated;
        } else {
          return [...prev, {
            id: data.user_id,
            name: isCurrentUser ? 'You' : data.full_name || data.full_name,
            lastTyping: Date.now()
          }];
        }
      } else {
        return prev.filter(user => user.id !== data.user_id);
      }
    });
  };

  const handleTyping = useCallback((isTyping) => {
    if (ws && ws.readyState === WebSocket.OPEN && selectedChat) {
      ws.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }));

      updateTypingStatus({
        chat_room_id: selectedChat.id,
        is_typing: isTyping
      }).catch(err => console.error('Error updating typing status:', err));
    }
  }, [ws, selectedChat]);

  // Enhanced send message with auto-refresh
  const handleSendMessage = async (e, audioBlob = null, files = []) => {
    e?.preventDefault();

    let messageContent = newMessage;

    // Handle text message
    if (messageContent.trim() && !audioBlob && files.length === 0) {
      setSendingMessage(true);
      try {
        // Send via WebSocket
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'chat_message',
            message: messageContent,
            message_type: 'text'
          }));
        }

        // Also send via API
        await sendMessage({
          chat_room_id: selectedChat.id,
          content: messageContent,
          message_type: 'text'
        });

        // Clear input and refresh messages
        setNewMessage('');
        fetchChatMessages(selectedChat.id);
        fetchChats(); // Refresh chat list

      } catch (error) {
        console.error('Error sending message:', error);
        alert(`Failed to send message: ${error.message}`);
      } finally {
        setSendingMessage(false);
      }
    }

    // Handle audio message
    if (audioBlob) {
      try {
        setSendingMessage(true);
        setShowUploadProgress(true);

        const formData = new FormData();
        formData.append('chat_room_id', selectedChat.id);
        formData.append('message_type', 'file');

        // Use proper filename with OGG extension
        const fileName = `voice_message_${Date.now()}.ogg`;
        formData.append('file', audioBlob, fileName);
        formData.append('message', 'Voice message');

        await uploadFile(formData);

        // Refresh messages and chats
        fetchChatMessages(selectedChat.id);
        fetchChats();

        setShowAudioRecorder(false);
        setShowUploadProgress(false);
      } catch (error) {
        console.error('Error sending audio:', error);
        alert(`Failed to send audio: ${error.message}`);
        setShowUploadProgress(false);
      } finally {
        setSendingMessage(false);
      }
    }

    // Handle file uploads
    if (files.length > 0) {
      setShowUploadProgress(true);

      for (const file of files) {
        try {
          setUploadingFiles(prev => [...prev, { name: file.name, progress: 0 }]);

          const formData = new FormData();
          formData.append('chat_room_id', selectedChat.id);
          formData.append('message_type', file.type.startsWith('image/') ? 'image' : 'file');
          formData.append('file', file);
          formData.append('message', `Sent ${file.name}`);

          await uploadFile(formData);

          // Update progress
          setUploadingFiles(prev => prev.map(f =>
            f.name === file.name ? { ...f, progress: 100 } : f
          ));

          // Remove from list after delay
          setTimeout(() => {
            setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
          }, 1000);

        } catch (error) {
          console.error('Error uploading file:', error);
          alert(`Failed to upload ${file.name}: ${error.message}`);
          setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
        }
      }

      // Refresh messages and chats after all uploads
      setTimeout(() => {
        fetchChatMessages(selectedChat.id);
        fetchChats();
        setShowUploadProgress(false);
      }, 1000);
    }
  };

  // Handle audio recording completion
  const handleAudioRecordingComplete = async (audioBlob) => {
    await handleSendMessage({ preventDefault: () => { } }, audioBlob);
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
      } else {
        // For one-on-one calls
        initCallWebSocket(incomingCallData.call_id);
        setVideoCallData(incomingCallData);
        startCallTimer();
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

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleSendMessage({ preventDefault: () => { } }, null, files);
    }
  };

  // Handle paste event for file uploads
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const files = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      handleSendMessage({ preventDefault: () => { } }, null, files);
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
        setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
        fetchChats(); // Refresh chat list
      } catch (error) {
        console.error('Error deleting message:', error);
        alert(`Failed to delete message: ${error.message}`);
      }
    }
  };

  // Fetch chat messages
  const fetchChatMessages = async (roomId) => {
    try {
      const response = await getChatMessages(roomId);
      console.log('Chat messages response:', response);

      if (response && (Array.isArray(response.messages) || Array.isArray(response))) {
        const messages = response.messages || response;
        setChatMessages(messages);
      } else if (response && response.data) {
        setChatMessages(response.data);
      } else {
        console.warn('Unexpected messages response structure:', response);
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setChatMessages([]);
    }
  };

  // Fetch chat list
  const fetchChats = async () => {
    try {
      const response = await getAllChats();
      console.log('Chats Response:', response);

      let allChats = [];
      const chatIdSet = new Set();

      const processChats = (chatArray) => {
        if (Array.isArray(chatArray)) {
          chatArray.forEach(chat => {
            if (chat && chat.id && !chatIdSet.has(chat.id)) {
              chatIdSet.add(chat.id);

              const processedChat = {
                id: chat.id,
                name: chat.name || 'Unnamed Chat',
                chat_type: chat.chat_type || 'unknown',
                participants: chat.participants || [],
                last_message: chat.last_message,
                unread_count: chat.unread_count || 0,
                created_at: chat.created_at,
                updated_at: chat.updated_at,
                is_active: chat.is_active !== undefined ? chat.is_active : true,
                can_manage: chat.can_manage || false,
                is_participant: chat.is_participant !== undefined ? chat.is_participant : true,
                mentorship: chat.mentorship,
                department: chat.department
              };
              allChats.push(processedChat);
            }
          });
        }
      };

      if (Array.isArray(response)) {
        allChats = response;
      }
      else if (response.my_chats || response.mentorship_chats || response.department_chats) {
        if (response.my_chats) processChats(response.my_chats);
        if (response.mentorship_chats) processChats(response.mentorship_chats);
        if (response.department_chats) processChats(response.department_chats);
        if (response.all_chats) processChats(response.all_chats);
      }
      else if (response.chats) {
        processChats(response.chats);
      }
      else if (response.data) {
        processChats(response.data);
      }
      else {
        console.warn('Unexpected response structure:', response);
      }

      // Sort chats by last message time or updated time
      allChats.sort((a, b) => {
        const timeA = a.last_message?.time || a.updated_at || a.created_at;
        const timeB = b.last_message?.time || b.updated_at || b.created_at;
        return new Date(timeB) - new Date(timeA);
      });

      console.log('Processed chats:', allChats);
      setChats(allChats);

    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [userResponse, chatsResponse] = await Promise.all([
        getCurrentUser(),
        getAllChats()
      ]);

      setCurrentUser(userResponse);

      let allChats = [];
      const chatIdSet = new Set();

      const processChats = (chatArray) => {
        if (Array.isArray(chatArray)) {
          chatArray.forEach(chat => {
            if (chat && chat.id && !chatIdSet.has(chat.id)) {
              chatIdSet.add(chat.id);

              const processedChat = {
                id: chat.id,
                name: chat.name || 'Unnamed Chat',
                chat_type: chat.chat_type || 'unknown',
                participants: chat.participants || [],
                last_message: chat.last_message,
                unread_count: chat.unread_count || 0,
                created_at: chat.created_at,
                updated_at: chat.updated_at,
                is_active: chat.is_active !== undefined ? chat.is_active : true,
                can_manage: chat.can_manage || false,
                is_participant: chat.is_participant !== undefined ? chat.is_participant : true,
                mentorship: chat.mentorship,
                department: chat.department
              };
              allChats.push(processedChat);
            }
          });
        }
      };

      if (Array.isArray(chatsResponse)) {
        allChats = chatsResponse;
      }
      else if (chatsResponse.my_chats || chatsResponse.mentorship_chats || chatsResponse.department_chats) {
        if (chatsResponse.my_chats) processChats(chatsResponse.my_chats);
        if (chatsResponse.mentorship_chats) processChats(chatsResponse.mentorship_chats);
        if (chatsResponse.department_chats) processChats(chatsResponse.department_chats);
        if (chatsResponse.all_chats) processChats(chatsResponse.all_chats);
      }
      else if (chatsResponse.chats) {
        processChats(chatsResponse.chats);
      }
      else if (chatsResponse.data) {
        processChats(chatsResponse.data);
      }
      else {
        console.warn('Unexpected response structure:', chatsResponse);
      }

      // Sort chats by last message time or updated time
      allChats.sort((a, b) => {
        const timeA = a.last_message?.time || a.updated_at || a.created_at;
        const timeB = b.last_message?.time || b.updated_at || b.created_at;
        return new Date(timeB) - new Date(timeA);
      });

      console.log('Processed chats:', allChats);
      setChats(allChats);

      // Auto-select first chat if none selected
      if (allChats.length > 0 && !selectedChat) {
        await handleSelectChat(allChats[0]);
      }

    } catch (error) {
      console.error('Error fetching initial data:', error);
      alert(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    try {
      setSelectedChat(chat);
      setChatMessages([]);

      // Mark messages as read
      try {
        await markMessagesAsRead(chat.id);

        // Update chat in list to clear unread count
        setChats(prevChats =>
          prevChats.map(c =>
            c.id === chat.id ? { ...c, unread_count: 0 } : c
          )
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }

      // Initialize WebSocket connection
      initChatWebSocket(chat.id);

      // Fetch chat messages
      await fetchChatMessages(chat.id);

    } catch (error) {
      console.error('Error selecting chat:', error);
      alert(`Failed to select chat: ${error.message}`);
    }
  };

  // Filter chats
  const filteredChats = useMemo(() => {
    let filtered = chats;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(chat =>
        (chat.name?.toLowerCase().includes(searchLower)) ||
        chat.participants?.some(p => {
          const user = p.user || p;
          return (
            user.full_name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
          );
        })
      );
    }

    if (filters.chat_type !== 'all') {
      filtered = filtered.filter(chat => chat.chat_type === filters.chat_type);
    }

    return filtered;
  }, [chats, filters]);

  // Initialize on mount
  useEffect(() => {
    fetchInitialData();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Auto-refresh chats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChat) {
        fetchChats();
        fetchChatMessages(selectedChat.id);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedChat]);

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
          <div className="border-b p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedChat.chat_type === 'one_on_one' ? 'bg-blue-100' :
                  selectedChat.chat_type === 'mentorship_group' ? 'bg-green-100' :
                    'bg-purple-100'
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
                        {typingUsers.map(user => user.name).join(', ')}
                        {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>

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
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParticipants(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Participants
                </Button>
              </div>
            </div>

            {selectedChat.mentorship && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Mentorship:</span>{' '}
                {selectedChat.mentorship.mentor?.full_name || selectedChat.mentorship.mentor} → {selectedChat.mentorship.mentee?.full_name || selectedChat.mentorship.mentee}
              </div>
            )}
            {selectedChat.department && (
              <div className="mt-1 text-sm text-gray-600">
                <span className="font-medium">Department:</span>{' '}
                {typeof selectedChat.department === 'object' ? selectedChat.department.name : selectedChat.department}
              </div>
            )}
          </div>

          {selectedChat.mentorship && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Mentorship:</span>{' '}
              {selectedChat.mentorship.mentor?.full_name || selectedChat.mentorship.mentor} → {selectedChat.mentorship.mentee?.full_name || selectedChat.mentorship.mentee}
            </div>
          )}
          {selectedChat.department && (
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Department:</span>{' '}
              {typeof selectedChat.department === 'object' ? selectedChat.department.name : selectedChat.department}
            </div>
          )}
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
                  onMessageSent={() => fetchChats()}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Enhanced message input area */}
        <div className="border-t p-4 bg-white">
          {/* Upload progress indicators */}
          {(uploadingFiles.length > 0 || showUploadProgress) && (
            <div className="mb-2 space-y-2">
              {uploadingFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600">{file.name}</span>
                  <span className="text-gray-500">{file.progress}%</span>
                </div>
              ))}
              {showUploadProgress && uploadingFiles.length === 0 && (
                <div className="text-sm text-gray-600">
                  Uploading voice message...
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-2">
            {typingUsers.length > 0 && (
              <div className="text-sm text-blue-600 italic">
                {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            <div className="flex space-x-2">
              {/* Attachment buttons */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowAudioRecorder(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100"
                  title="Record voice message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100"
                  title="Attach files"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                />
              </div>

              <Input
                ref={messageInputRef}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // Handle typing indicator
                  handleTyping(true);
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = setTimeout(() => {
                    handleTyping(false);
                  }, 1000);
                }}
                onPaste={handlePaste}
                className="flex-1"
                disabled={sendingMessage}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      handleSendMessage(e);
                    }
                  }
                }}
              />

              <Button
                type="submit"
                disabled={sendingMessage || (!newMessage.trim() && uploadingFiles.length === 0)}
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
              <h1 className="text-2xl font-bold text-gray-900">My Chats</h1>
              <p className="text-gray-600 mt-1">
                {currentUser?.role === 'mentee' ? 'Chat with your mentors and department members' : 'Chat with your mentees and colleagues'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={fetchInitialData}
                variant="outline"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Chat list sidebar */}
          <div className="w-full md:w-1/3 border-r flex flex-col">
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Conversations</h2>
                <Badge variant="secondary">{chats.length}</Badge>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Input
                    placeholder="Search chats..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={filters.chat_type}
                  onChange={(e) => setFilters({ ...filters, chat_type: e.target.value })}
                >
                  <option value="all">All Chats</option>
                  <option value="one_on_one">1:1 Chats</option>
                  <option value="mentorship_group">Mentorship</option>
                  <option value="department_group">Department</option>
                  <option value="global">Global</option>
                </Select>
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading chats...</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="mt-4">No chats found</p>
                  <p className="text-sm mt-2">You'll see chats here when you start conversations</p>
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
                            {chat.unread_count > 99 ? '99+' : chat.unread_count}
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
                            <span>• Mentorship</span>
                          )}
                          {chat.department && (
                            <span>• {typeof chat.department === 'object' ? chat.department.name : 'Department'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main chat window */}
          {renderChatWindow()}
        </div>
      </div>

      {/* Modals */}
      <ChatParticipantsModal
        chat={selectedChat}
        open={showParticipants}
        onClose={() => setShowParticipants(false)}
        onStartChat={handleSelectChat}
        currentUser={currentUser}
      />

      {/* Audio Recorder Modal */}
      {showAudioRecorder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <AudioRecorder
            onRecordingComplete={handleAudioRecordingComplete}
            onCancel={() => setShowAudioRecorder(false)}
          />
        </div>
      )}

      <IncomingCallModal
        open={showIncomingCall}
        callData={incomingCallData}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      <VideoCallModal
        open={isInCall}
        onClose={handleEndCall}
        videoCallData={videoCallData}
        isInitiator={isInitiator}
        onEndCall={handleEndCall}
        onToggleMedia={handleToggleMedia}
        onScreenShare={handleScreenShare}
        onSendCallChatMessage={(msg) => {
          // Send call chat message
          if (callWs && callWs.readyState === WebSocket.OPEN) {
            callWs.send(JSON.stringify({
              type: 'call_chat_message',
              message: msg
            }));
          }
        }}
        localStream={localStream}
        remoteStreams={remoteStreams}
        participants={callParticipants} // This is crucial for showing participants
        callDuration={callDuration}
        userMediaStates={userMediaStates}
        screenSharingUser={screenSharingUser}
        activeSpeaker={activeSpeaker}
        // Chat integration props
        currentChat={selectedChat}
        chatMessages={callChatMessages}
        newCallChatMessage={callChatMessage}
        onCallChatMessageChange={setCallChatMessage}
        typingUsers={typingUsers}
        currentUser={currentUser}
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