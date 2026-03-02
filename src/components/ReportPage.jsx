// Update the import section at the top of the file:
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, FileText, FileSpreadsheet, FileBarChart,
  Download, RefreshCw, Filter, Calendar, Search,
  ChevronDown, ChevronUp, Eye, Printer, CheckCircle,
  AlertCircle, Loader2, Database, BarChart3, PieChart,
  TrendingUp, Clock, Target, AlertOctagon, Shield,
  UserCheck, Activity, DollarSign, Layers,
  ArrowUpRight, ArrowDownRight, Percent, Trash2,
  Edit, ExternalLink, MoreVertical, X, Plus,
  Grid, List, Settings, ChevronRight, FileDown,
  DownloadCloud, Upload, CheckSquare, ClipboardList,
  CalendarCheck, UserCog, Bell, Building, Award,
  Briefcase, GraduationCap, BookOpen, MessageCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, LineChart, Line
} from 'recharts';

import Logo from "../assets/pictures/Logo.png";

// Import client-side export libraries
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// Import autoTable function
import 'jspdf-autotable';

// FIX: Create a jsPDF instance with autoTable plugin
// Initialize jsPDF with autoTable
const initJSPDF = () => {
  const doc = new jsPDF();
  // Add autoTable to jsPDF prototype if not already added
  if (typeof doc.autoTable !== 'function') {
    // Import the autoTable plugin dynamically
    import('jspdf-autotable').then((autoTableModule) => {
      // This registers autoTable on jsPDF
      autoTableModule.default;
    });
  }
  return doc;
};

// Enhanced API Service for your backend
const apiService = {
  baseURL: 'http://127.0.0.1:8000',
  
  async getAvailableReportTypes() {
    const accessToken = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseURL}/reports/reports/types/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  },

  async generateReport(reportType, filters) {
    const accessToken = localStorage.getItem('access_token');
    
    const requestData = {
      report_type: reportType,
      format: 'json',
      ...filters
    };
    
    const response = await fetch(`${this.baseURL}/reports/reports/generate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  },

  async exportReport(reportType, format, filters) {
    const accessToken = localStorage.getItem('access_token');
    
    const requestData = {
      report_type: reportType,
      format: format,
      ...filters
    };
    
    const response = await fetch(`${this.baseURL}/reports/reports/generate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    if (format === 'json') {
      return await response.json();
    } else {
      // For CSV, get blob
      const blob = await response.blob();
      return blob;
    }
  },

  // NEW: Fetch departments from backend
  async getDepartments(statusFilter = null) {
    const accessToken = localStorage.getItem('access_token');
    
    let url = `${this.baseURL}/departments/all/`;
    if (statusFilter) {
      url += `?status=${statusFilter}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  },

  // NEW: Fetch user's departments based on role
  async getMyDepartments(statusFilter = null) {
    const accessToken = localStorage.getItem('access_token');
    
    let url = `${this.baseURL}/departments/my-departments/`;
    if (statusFilter) {
      url += `?status=${statusFilter}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  }
};

// Export Service (Client-side) - Updated for Hammer-Tech Global
const exportService = {
  // Generate PDF with professional styling - FIXED VERSION
  async generatePDF(reportData, config = {}) {
    const { summary, data } = reportData;
    
    // Initialize jsPDF with autoTable
    const doc = new jsPDF();
    
    // Import and apply autoTable dynamically
    const autoTable = (await import('jspdf-autotable')).default;
    
    const pageWidth = doc.internal.pageSize.width;

    // Add header with logo and title
    doc.setFillColor(41, 128, 185); // Blue header
    doc.rect(0, 0, pageWidth, 30, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Hammer-Tech Global', pageWidth / 2, 12, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.text('AI-Enhanced Access Control & Compliance System', pageWidth / 2, 20, { align: 'center' });

    // Confidential Header
    doc.setFillColor(255, 0, 0); // Red
    doc.rect(0, 30, pageWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL REPORT', pageWidth / 2, 36, { align: 'center' });

    let yPos = 50;

    // Report Title
    doc.setFillColor(245, 245, 245);
    doc.rect(10, yPos, pageWidth - 20, 15, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const reportTitle = summary.report_type || 'Report';
    doc.text(reportTitle.length > 50 ? reportTitle.substring(0, 47) + '...' : reportTitle, pageWidth / 2, yPos + 10, { align: 'center' });
    yPos += 25;

    // Report Info Table
    const reportInfo = [
      ['Generated on:', summary.generated_at ? new Date(summary.generated_at).toLocaleString() : new Date().toLocaleString()],
      ['Generated by:', summary.generated_by || config.generated_by || 'System Administrator'],
      ['Report Type:', summary.report_type],
      ['Total Records:', summary.total_records || 'N/A'],
      ['Date Range:', summary.date_range?.start_date && summary.date_range?.end_date 
        ? `${summary.date_range.start_date} to ${summary.date_range.end_date}`
        : 'N/A']
    ];

    // Use autoTable directly
    autoTable(doc, {
      startY: yPos,
      head: [['Report Information', 'Details']],
      body: reportInfo,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: 20, right: 20 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Key Metrics Section
    if (summary.key_metrics && summary.key_metrics.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Metrics', 20, yPos);
      yPos += 10;

      const metricsData = summary.key_metrics.map(metric => [metric]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Metrics']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Summary Statistics Section
    if (summary.summary_stats && Object.keys(summary.summary_stats).length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 20, yPos);
      yPos += 10;

      const statsData = Object.entries(summary.summary_stats).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return [key, JSON.stringify(value, null, 2)];
        }
        return [key, String(value)];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Statistic', 'Value']],
        body: statsData,
        theme: 'grid',
        headStyles: { fillColor: [88, 214, 141], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 15, right: 15 },
        pageBreak: 'auto'
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Detailed Data Section
    if (data && data.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Data', 20, yPos);
      yPos += 10;

      // Get headers from first data item
      const headers = Object.keys(data[0]);
      const displayData = data.slice(0, 100).map(item => 
        headers.map(header => {
          const value = item[header];
          if (value === null || value === undefined) return 'N/A';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })
      );

      autoTable(doc, {
        startY: yPos,
        head: [headers],
        body: displayData,
        theme: 'grid',
        headStyles: { fillColor: [231, 76, 60], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 10, right: 10 },
        pageBreak: 'auto'
      });

      yPos = doc.lastAutoTable.finalY + 10;

      if (data.length > 100) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Showing 100 of ${data.length} records. Full data available in Excel export.`, 20, yPos);
        yPos += 10;
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Confidential Information - Hammer-Tech Global', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 5, { align: 'center' });
    }

    return doc.output('blob');
  },

  // Generate Excel file with all displayed data
  async generateExcel(reportData, config = {}) {
    const { summary, data } = reportData;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Report Summary
    const summaryData = [
      ['Hammer-Tech Global'],
      ['AI-Enhanced Access Control & Compliance System'],
      ['CONFIDENTIAL REPORT'],
      [],
      [summary.report_type || 'Report'],
      [],
      ['Report Information'],
      ['Generated on:', summary.generated_at ? new Date(summary.generated_at).toLocaleString() : new Date().toLocaleString()],
      ['Generated by:', summary.generated_by || config.generated_by || 'System Administrator'],
      ['Report Type:', summary.report_type],
      ['Total Records:', summary.total_records || 'N/A'],
      ['Date Range:', summary.date_range?.start_date && summary.date_range?.end_date 
        ? `${summary.date_range.start_date} to ${summary.date_range.end_date}`
        : 'N/A'],
      [],
      ['Applied Filters']
    ];

    // Add filters
    if (summary.filters_applied && Object.keys(summary.filters_applied).length > 0) {
      Object.entries(summary.filters_applied).forEach(([key, value]) => {
        summaryData.push([key, value]);
      });
    } else {
      summaryData.push(['No filters applied', '']);
    }

    summaryData.push([], ['Key Metrics']);

    // Add key metrics
    if (summary.key_metrics && summary.key_metrics.length > 0) {
      summary.key_metrics.forEach(metric => {
        summaryData.push([metric]);
      });
    }

    summaryData.push([], ['Summary Statistics']);

    // Add summary statistics
    if (summary.summary_stats) {
      Object.entries(summary.summary_stats).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          summaryData.push([key, JSON.stringify(value)]);
        } else {
          summaryData.push([key, value]);
        }
      });
    }

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);

    // Apply styling
    const ws1Range = XLSX.utils.decode_range(ws1['!ref']);
    for (let R = ws1Range.s.r; R <= ws1Range.s.r + 3; R++) {
      for (let C = ws1Range.s.c; C <= ws1Range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws1[cellAddress]) continue;
        ws1[cellAddress].s = { font: { bold: true }, alignment: { horizontal: 'center' } };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws1, 'Report Summary');

    // Detailed Data Sheet
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      const detailedData = [
        headers,
        ...data.map(item => headers.map(header => {
          const value = item[header];
          if (value === null || value === undefined) return 'N/A';
          if (typeof value === 'object') return JSON.stringify(value);
          return value;
        }))
      ];

      const ws2 = XLSX.utils.aoa_to_sheet(detailedData);

      // Style header row
      const range = XLSX.utils.decode_range(ws2['!ref']);
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        ws2[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2980B9" } },
          alignment: { horizontal: 'center' }
        };
      }

      // Add alternating row colors
      for (let R = 1; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws2[cellAddress]) {
            ws2[cellAddress].s = {
              ...ws2[cellAddress].s,
              fill: {
                fgColor: {
                  rgb: R % 2 === 0 ? "F8F9FA" : "FFFFFF"
                }
              }
            };
          }
        }
      }

      // Auto-size columns
      const maxWidths = {};
      for (let R = 0; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws2[cellAddress];
          if (cell && cell.v) {
            const cellValue = String(cell.v);
            maxWidths[C] = Math.max(maxWidths[C] || 0, Math.min(cellValue.length, 50));
          }
        }
      }

      ws2['!cols'] = Object.keys(maxWidths).map(key => ({
        wch: maxWidths[key] + 2
      }));

      XLSX.utils.book_append_sheet(wb, ws2, 'Detailed Data');
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },

  // Generate CSV file with all displayed data
  async generateCSV(reportData, config = {}) {
    const { summary, data } = reportData;
    let csvContent = '';

    // Header
    csvContent += 'Hammer-Tech Global\n';
    csvContent += 'AI-Enhanced Access Control & Compliance System\n';
    csvContent += 'CONFIDENTIAL REPORT\n\n';
    csvContent += `${summary.report_type || 'Report'}\n\n`;

    // Report Info
    csvContent += 'Report Information\n';
    csvContent += `Generated on:,${summary.generated_at ? new Date(summary.generated_at).toLocaleString() : new Date().toLocaleString()}\n`;
    csvContent += `Generated by:,${summary.generated_by || config.generated_by || 'System Administrator'}\n`;
    csvContent += `Report Type:,${summary.report_type}\n`;
    csvContent += `Total Records:,${summary.total_records || 'N/A'}\n`;
    csvContent += `Date Range:,${summary.date_range?.start_date && summary.date_range?.end_date 
      ? `${summary.date_range.start_date} to ${summary.date_range.end_date}`
      : 'N/A'}\n\n`;

    // Applied Filters
    csvContent += 'Applied Filters\n';
    if (summary.filters_applied && Object.keys(summary.filters_applied).length > 0) {
      Object.entries(summary.filters_applied).forEach(([key, value]) => {
        csvContent += `${key},${value}\n`;
      });
    } else {
      csvContent += 'No filters applied,\n';
    }

    csvContent += '\nKey Metrics\n';
    if (summary.key_metrics && summary.key_metrics.length > 0) {
      summary.key_metrics.forEach(metric => {
        csvContent += `${metric}\n`;
      });
    }

    csvContent += '\nSummary Statistics\n';
    if (summary.summary_stats) {
      Object.entries(summary.summary_stats).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          csvContent += `${key},"${JSON.stringify(value).replace(/"/g, '""')}"\n`;
        } else {
          csvContent += `${key},${value}\n`;
        }
      });
    }

    // Detailed Data
    if (data && data.length > 0) {
      csvContent += '\n\nDetailed Data\n';
      const headers = Object.keys(data[0]);
      csvContent += headers.join(',') + '\n';
      
      data.forEach(row => {
        const csvRow = headers.map(header => {
          let cell = row[header];
          if (cell === null || cell === undefined) cell = 'N/A';
          if (typeof cell === 'object') cell = JSON.stringify(cell);
          cell = String(cell);
          
          // Escape quotes and commas
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        });
        csvContent += csvRow.join(',') + '\n';
      });
    }

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
};

// Custom Components (keep the same as before)
const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin mb-3`} />
      <span className="text-gray-600 font-medium">{text}</span>
    </div>
  );
};

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 text-center shadow-sm">
    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Process</h3>
    <p className="text-red-600 mb-5">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
      >
        <RefreshCw className="w-4 h-4 inline mr-2" />
        Try Again
      </button>
    )}
  </div>
);

const SuccessMessage = ({ message }) => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
    <div className="flex items-center">
      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
      <span className="text-green-800 font-medium">{message}</span>
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, change, description }) => {
  const colorClasses = {
    blue: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600' },
    purple: { bg: 'from-violet-500 to-violet-600', light: 'bg-violet-50', text: 'text-violet-600' },
    orange: { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', text: 'text-orange-600' },
    red: { bg: 'from-rose-500 to-rose-600', light: 'bg-rose-50', text: 'text-rose-600' }
  };

  const { bg, light, text } = colorClasses[color] || colorClasses.blue;
  const isPositive = change > 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${light}`}>
          <Icon className={`w-6 h-6 ${text}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

const ReportTypeCard = ({ title, description, icon: Icon, onSelect, isActive, isAvailable = true }) => (
  <button
    onClick={onSelect}
    disabled={!isAvailable}
    className={`relative group bg-white rounded-xl border ${isActive ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'} p-5 text-left transition-all duration-300 ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className="flex items-start space-x-4">
      <div className={`p-3 rounded-xl ${isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'} transition-colors`}>
        <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`} />
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-900'} mb-1`}>{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
        {!isAvailable && (
          <span className="text-xs text-red-500 mt-2 inline-block">Not available for your role</span>
        )}
      </div>
      <ChevronRight className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
    </div>
  </button>
);

// Data Table Component - Updated for dynamic data
const DataTable = ({ title, data, showCount = true }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Database className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">No records found for this report</p>
      </div>
    );
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !data) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle numbers
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortConfig.direction === 'asc'
          ? parseFloat(aValue) - parseFloat(bValue)
          : parseFloat(bValue) - parseFloat(aValue);
      }

      // Default comparison
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {showCount && (
              <p className="text-sm text-gray-600">{data.length} records</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort(header)}
                >
                  <div className="flex items-center">
                    {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {sortConfig.key === header && (
                      <ChevronUp className={`w-4 h-4 ml-1 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(() => {
                      const cell = row[header];
                      if (cell === null || cell === undefined) return 'N/A';
                      if (typeof cell === 'object') {
                        return JSON.stringify(cell);
                      }
                      if (typeof cell === 'string' && cell.length > 100) {
                        return cell.substring(0, 100) + '...';
                      }
                      return cell;
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
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
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Summary Table Component
const SummaryTable = ({ summaryStats, title = "Summary Statistics" }) => {
  if (!summaryStats || Object.keys(summaryStats).length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(summaryStats).map(([key, value], index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-500 mb-2">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h5>
              <div className="text-lg font-semibold text-gray-900">
                {typeof value === 'object' && value !== null ? (
                  <div className="space-y-1">
                    {Object.entries(value).map(([subKey, subValue], subIndex) => (
                      <div key={subIndex} className="text-sm">
                        <span className="font-medium">{subKey}:</span> {subValue}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>{value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Component
export function ReportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingReportTypes, setLoadingReportTypes] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Report State
  const [availableReportTypes, setAvailableReportTypes] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: new Date().toISOString().split('T')[0],
    role: '',
    status: '',
    department: '',
    severity: '',
    incident_status: '',
    audit_status: '',
    training_status: '',
    compliance_standard: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  
  // NEW: Real departments from backend
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // Load available report types on component mount
  useEffect(() => {
    loadAvailableReportTypes();
    // Load departments on mount
    loadDepartments();
  }, []);

  const loadAvailableReportTypes = async () => {
    try {
      setLoadingReportTypes(true);
      const data = await apiService.getAvailableReportTypes();
      setAvailableReportTypes(data.report_types || []);
      
      // Set default selected report if available
      if (data.report_types && data.report_types.length > 0) {
        const firstAvailable = data.report_types.find(rt => rt.available);
        if (firstAvailable) {
          setSelectedReport(firstAvailable.value);
        }
      }
    } catch (err) {
      console.error('Failed to load report types:', err);
      setError('Failed to load available report types');
    } finally {
      setLoadingReportTypes(false);
    }
  };

  // NEW: Load departments from backend based on user role
  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      
      // Use getMyDepartments to respect role-based access
      const response = await apiService.getMyDepartments('active');
      
      if (response.success && response.data) {
        // Transform departments to match the expected format
        const departments = response.data.map(dept => ({
          value: dept.id,
          label: dept.name,
          description: dept.description,
          status: dept.status
        }));
        
        setAvailableDepartments(departments);
        
        console.log(`✅ Loaded ${departments.length} departments for ${response.user_role}`);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
      // Don't show error to user, just log it
      // Departments dropdown will show "No departments available"
      setAvailableDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReportTypeChange = (reportType) => {
    setSelectedReport(reportType);
    setReportData(null);
    setError(null);
    setSuccess(null);
    setFilters({
      start_date: '',
      end_date: new Date().toISOString().split('T')[0],
      role: '',
      status: '',
      department: '',
      severity: '',
      incident_status: '',
      audit_status: '',
      training_status: '',
      compliance_standard: ''
    });
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      setError('Please select a report type first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🚀 Generating report:', selectedReport);
      console.log('📊 Filters:', filters);

      // Prepare filters for API
      const apiFilters = { ...filters };
      
      // Clean up empty filters
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === '' || apiFilters[key] === null || apiFilters[key] === undefined) {
          delete apiFilters[key];
        }
      });

      const data = await apiService.generateReport(selectedReport, apiFilters);

      if (data) {
        setReportData(data);
        setSuccess('Report generated successfully!');
        setActiveTab('summary');
        
        console.log('✅ Report generated successfully!');
        console.log('📈 Summary:', data.summary);
        console.log('📊 Data records:', data.data?.length || 0);
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format) => {
    if (!reportData || !selectedReport) {
      setError('Please generate a report first');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const config = {
        generated_by: user?.full_name || user?.names || 'System Administrator',
        organization: 'Hammer-Tech Global',
        system: 'AI-Enhanced Access Control & Compliance System'
      };

      let blob;
      let filename = `HammerTech_${selectedReport}_Report_${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'pdf':
          blob = await exportService.generatePDF(reportData, config);
          filename += '.pdf';
          break;
        case 'excel':
          blob = await exportService.generateExcel(reportData, config);
          filename += '.xlsx';
          break;
        case 'csv':
          blob = await exportService.generateCSV(reportData, config);
          filename += '.csv';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Create download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(`${format.toUpperCase()} report exported successfully!`);
      console.log(`✅ Exported ${filename} (${(blob.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error('Export error:', err);
      setError(`Failed to export ${format.toUpperCase()}: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getReportDisplayName = () => {
    if (!selectedReport) return 'Select Report';
    const reportType = availableReportTypes.find(rt => rt.value === selectedReport);
    return reportType ? reportType.label : selectedReport.replace(/_/g, ' ');
  };

  const renderFilterFields = () => {
    if (!selectedReport) return null;

    const reportType = availableReportTypes.find(rt => rt.value === selectedReport);
    if (!reportType?.filters) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Date Range Filters */}
        {reportType.filters.some(f => f.name === 'start_date') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        )}

        {reportType.filters.some(f => f.name === 'end_date') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        )}

        {/* Role Filter */}
        {reportType.filters.some(f => f.name === 'role') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Role Filter
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="employee">Employee</option>
              <option value="security_analyst">Security Analyst</option>
              <option value="compliance_officer">Compliance Officer</option>
              <option value="hr_manager">HR Manager</option>
            </select>
          </div>
        )}

        {/* Status Filter */}
        {reportType.filters.some(f => f.name === 'status') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Activity className="w-4 h-4 inline mr-2" />
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        )}

        {/* Department Filter - UPDATED WITH REAL DATA */}
        {reportType.filters.some(f => f.name === 'department') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              disabled={loadingDepartments}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingDepartments ? 'Loading departments...' : 'All Departments'}
              </option>
              {availableDepartments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            {availableDepartments.length === 0 && !loadingDepartments && (
              <p className="text-xs text-gray-500 mt-1">No departments available</p>
            )}
          </div>
        )}

        {/* Severity Filter */}
        {reportType.filters.some(f => f.name === 'severity') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertOctagon className="w-4 h-4 inline mr-2" />
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        )}

        {/* Incident Status Filter */}
        {reportType.filters.some(f => f.name === 'incident_status') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Incident Status
            </label>
            <select
              value={filters.incident_status}
              onChange={(e) => handleFilterChange('incident_status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {/* Audit Status Filter */}
        {reportType.filters.some(f => f.name === 'audit_status') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Audit Status
            </label>
            <select
              value={filters.audit_status}
              onChange={(e) => handleFilterChange('audit_status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {/* Training Status Filter */}
        {reportType.filters.some(f => f.name === 'training_status') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="w-4 h-4 inline mr-2" />
              Training Status
            </label>
            <select
              value={filters.training_status}
              onChange={(e) => handleFilterChange('training_status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        )}

        {/* Compliance Standard Filter */}
        {reportType.filters.some(f => f.name === 'compliance_standard') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Compliance Standard
            </label>
            <select
              value={filters.compliance_standard}
              onChange={(e) => handleFilterChange('compliance_standard', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Standards</option>
              <option value="iso_27001">ISO 27001</option>
              <option value="gdpr">GDPR</option>
              <option value="hipaa">HIPAA</option>
              <option value="pci_dss">PCI DSS</option>
              <option value="sox">SOX</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <FileBarChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Reporting System</h1>
              <p className="text-sm text-gray-600">
                Generate, analyze, and export comprehensive system reports
              </p>
            </div>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Generated By</p>
            <p className="text-sm font-semibold text-gray-900">{user?.full_name || user?.names || 'System Administrator'}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Error/Success Messages */}
        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
        {success && <SuccessMessage message={success} />}

        {/* Report Type Selection */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Select Report Type</h2>
            <p className="text-sm text-gray-600 mt-1">Choose the type of report you want to generate</p>
          </div>

          <div className="p-6">
            {loadingReportTypes ? (
              <LoadingSpinner text="Loading report types..." />
            ) : availableReportTypes.length === 0 ? (
              <ErrorMessage message="No report types available for your role" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableReportTypes.map((report) => (
                  <ReportTypeCard
                    key={report.value}
                    title={report.label}
                    description={report.description}
                    icon={FileBarChart}
                    onSelect={() => handleReportTypeChange(report.value)}
                    isActive={selectedReport === report.value}
                    isAvailable={report.available}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters Section */}
        {selectedReport && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Report Configuration</h3>
                  <p className="text-sm text-gray-600">Customize your report with filters and settings</p>
                </div>

                <div className="flex items-center gap-3">
                  {isGenerating && (
                    <div className="flex items-center text-blue-600 font-medium">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </div>
                  )}

                  <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileBarChart className="w-5 h-5 mr-2" />
                        Generate Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {renderFilterFields()}
              
              {/* Show active filters */}
              {Object.keys(filters).some(key => filters[key]) && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Active Filters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (value && value !== '') {
                        // If it's department, show department name
                        let displayValue = value;
                        if (key === 'department' && availableDepartments.length > 0) {
                          const dept = availableDepartments.find(d => d.value === parseInt(value));
                          displayValue = dept ? dept.label : value;
                        }
                        
                        return (
                          <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {key.replace(/_/g, ' ')}: {displayValue}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Results */}
        {reportData && (
          <>
            {/* Report Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex space-x-6">
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'summary' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      Summary
                    </button>
                    <button
                      onClick={() => setActiveTab('data')}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'data' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Database className="w-4 h-4 inline mr-2" />
                      Data View
                    </button>
                    <button
                      onClick={() => setActiveTab('export')}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'export' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      Export
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                      title="Print Report"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </button>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                        className="flex items-center px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export as PDF"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        disabled={isExporting}
                        className="flex items-center px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export as Excel"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                        )}
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                        className="flex items-center px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export as CSV"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileBarChart className="w-4 h-4 mr-2" />
                        )}
                        CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'summary' && (
                  <div className="space-y-8">
                    {/* Report Header */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {reportData.summary.report_type || getReportDisplayName()}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            Generated on {new Date(reportData.summary.generated_at).toLocaleDateString()} at {new Date(reportData.summary.generated_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Report Information</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-blue-100">
                              <span className="text-gray-600">Report Type:</span>
                              <span className="font-medium text-gray-900">{reportData.summary.report_type}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-blue-100">
                              <span className="text-gray-600">Generated By:</span>
                              <span className="font-medium text-gray-900">{reportData.summary.generated_by || user?.full_name || user?.names || 'System Administrator'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-blue-100">
                              <span className="text-gray-600">Total Records:</span>
                              <span className="font-medium text-gray-900">{reportData.summary.total_records}</span>
                            </div>
                            {reportData.summary.date_range?.start_date && (
                              <div className="flex justify-between py-2 border-b border-blue-100">
                                <span className="text-gray-600">Date Range:</span>
                                <span className="font-medium text-gray-900">
                                  {reportData.summary.date_range.start_date} to {reportData.summary.date_range.end_date}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between py-2 border-b border-blue-100">
                              <span className="text-gray-600">Organization:</span>
                              <span className="font-medium text-gray-900">Hammer-Tech Global</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Key Metrics</h4>
                          <div className="space-y-3">
                            {reportData.summary.key_metrics && reportData.summary.key_metrics.map((metric, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-700">{metric.split(':')[0]}:</span>
                                <span className="font-bold text-blue-600">{metric.split(':')[1]?.trim() || metric}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Statistics */}
                    {reportData.summary.summary_stats && Object.keys(reportData.summary.summary_stats).length > 0 && (
                      <SummaryTable 
                        summaryStats={reportData.summary.summary_stats} 
                        title="Summary Statistics"
                      />
                    )}

                    {/* Applied Filters */}
                    {reportData.summary.filters_applied && Object.keys(reportData.summary.filters_applied).length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                          <h4 className="font-semibold text-gray-900">Applied Filters</h4>
                        </div>
                        <div className="p-6">
                          <div className="flex flex-wrap gap-3">
                            {Object.entries(reportData.summary.filters_applied).map(([key, value], index) => (
                              <div key={index} className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
                                <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-8">
                    <DataTable
                      title="Detailed Report Data"
                      data={reportData.data || []}
                    />
                    
                    {/* Pagination Info */}
                    {reportData.pagination && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Page {reportData.pagination.current_page} of {reportData.pagination.total_pages} 
                            ({reportData.pagination.total_records} total records)
                          </div>
                          <div className="flex space-x-2">
                            <button
                              disabled={!reportData.pagination.has_previous}
                              className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            <button
                              disabled={!reportData.pagination.has_next}
                              className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'export' && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                    <div className="text-center max-w-2xl mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DownloadCloud className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Export Report</h3>
                      <p className="text-gray-600 mb-8">
                        Download your report in multiple formats for analysis, sharing, or archiving.
                        Reports will include both summary and detailed data.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-6 h-6 text-red-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">PDF Format</h4>
                          <p className="text-sm text-gray-600 mb-4">Best for printing and sharing</p>
                          <button
                            onClick={() => handleExport('pdf')}
                            disabled={isExporting}
                            className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {isExporting ? 'Exporting...' : 'Export PDF'}
                          </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">Excel Format</h4>
                          <p className="text-sm text-gray-600 mb-4">Best for data analysis</p>
                          <button
                            onClick={() => handleExport('excel')}
                            disabled={isExporting}
                            className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                          </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileBarChart className="w-6 h-6 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">CSV Format</h4>
                          <p className="text-sm text-gray-600 mb-4">Best for data import</p>
                          <button
                            onClick={() => handleExport('csv')}
                            disabled={isExporting}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Advanced Reporting System</h4>
                <p className="text-sm text-gray-300">Hammer-Tech Global v2.0</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Generated By</p>
              <p className="text-sm font-semibold">{user?.full_name || user?.names || 'System Administrator'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}