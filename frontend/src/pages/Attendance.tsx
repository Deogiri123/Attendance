import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, AlertCircle, CheckCircle2, CheckCircle, Bell, QrCode, Smartphone, LogOut, X } from 'lucide-react';
import axios from 'axios';

interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    name: string;
    rollNo: string;
  };
  subject: {
    _id: string;
    name: string;
  };
  date: string;
  status: boolean;
  remarks: string;
  year: string;
}

interface Subject {
  _id: string;
  name: string;
  year: string;
  description?: string;
}

interface WhatsAppStatus {
  isReady: boolean;
  status: string;
  hasQR: boolean;
  connectionInfo?: {
    phoneNumber: string;
    platform: string;
    connected: boolean;
  };
  message: string;
}

const Attendance: React.FC = () => {
  const {
    students,
    date,
    setDate,
    searchQuery,
    setSearchQuery,
    token,
    backendUrl,
  } = useAppContext();

  const [selectedYear, setSelectedYear] = useState<string>('2');
  const years = ['2', '3', '4'];
  const [showAllYears, setShowAllYears] = useState<boolean>(false);
  
  // New state variables for the attendance API
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sendingNotification, setSendingNotification] = useState<boolean>(false);
  
  // WhatsApp authentication state
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  // WhatsApp QR Code Modal
  const WhatsAppQRModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [authStatus, setAuthStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

      const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use proxy URL (works with development server)
      const qrUrl = '/api/whatsapp/qr';
      
      console.log('Fetching QR code from:', qrUrl);
      
      const response = await fetch(qrUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('QR API Response:', data);
        
        if (data.success) {
          if (data.data.authenticated) {
            setError('WhatsApp is already authenticated');
            setQrCode(null);
          } else if (data.data.qrCode) {
            setQrCode(data.data.qrCode);
            setError(null);
          } else {
            // Bot is initializing or QR not ready yet
            const status = data.data.status;
            if (status.isInitializing) {
              const attemptInfo = status.initializationAttempts && status.maxAttempts 
                ? ` (attempt ${status.initializationAttempts}/${status.maxAttempts})`
                : '';
              setError(`WhatsApp bot is starting up${attemptInfo}, please wait...`);
            } else {
              setError(data.message || 'QR code not available yet');
            }
            setQrCode(null);
          }
          setAuthStatus(data.data.status);
        } else {
          setError(data.message || 'Failed to get QR code');
          setQrCode(null);
        }
      } catch (err) {
        console.error('Failed to fetch QR code:', err);
        if (err.message.includes('Failed to fetch')) {
          setError('Cannot connect to server. Make sure the backend is running on port 4000.');
        } else {
          setError(`Connection error: ${err.message}`);
        }
        setQrCode(null);
      } finally {
        setLoading(false);
      }
    };

    // Auto-refresh QR code every 5 seconds if initializing
    useEffect(() => {
      if (isOpen) {
        fetchQRCode();
        
        const interval = setInterval(() => {
          if (authStatus?.isInitializing || (!qrCode && !authStatus?.isReady)) {
            fetchQRCode();
          }
        }, 5000);

        return () => clearInterval(interval);
      }
    }, [isOpen, authStatus?.isInitializing, qrCode, authStatus?.isReady]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">WhatsApp Authentication</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center">
            {loading && (
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading QR code...</p>
              </div>
            )}

                         {error && (
               <div className={`border rounded-lg p-4 mb-4 ${
                 error.includes('Cannot connect') 
                   ? 'bg-red-50 border-red-200' 
                   : 'bg-yellow-50 border-yellow-200'
               }`}>
                 <div className="flex items-center">
                   <AlertCircle className={`w-5 h-5 mr-2 ${
                     error.includes('Cannot connect') 
                       ? 'text-red-600' 
                       : 'text-yellow-600'
                   }`} />
                   <div>
                     <p className={`font-medium ${
                       error.includes('Cannot connect') 
                         ? 'text-red-800' 
                         : 'text-yellow-800'
                     }`}>
                       {error.includes('Cannot connect') 
                         ? 'Server Connection Error' 
                         : error.includes('starting up') 
                           ? 'Bot Initializing' 
                           : 'Status'}
                     </p>
                     <p className={`text-sm mt-1 ${
                       error.includes('Cannot connect') 
                         ? 'text-red-700' 
                         : 'text-yellow-700'
                     }`}>{error}</p>
                     {error.includes('starting up') && (
                       <p className="text-yellow-600 text-xs mt-2">
                         This usually takes 30-90 seconds. The bot is downloading WhatsApp Web...
                       </p>
                     )}
                     {error.includes('Cannot connect') && (
                       <div className="text-red-600 text-xs mt-2">
                         <p>• Check if the backend server is running</p>
                         <p>• Try refreshing the page</p>
                         <p>• Contact support if the issue persists</p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             )}

            {qrCode && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                    alt="WhatsApp QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                
                <div className="text-left space-y-2">
                  <h4 className="font-medium text-gray-900">How to scan:</h4>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Open WhatsApp on your phone</li>
                    <li>2. Tap Menu (3 dots) → Settings</li>
                    <li>3. Tap "Linked devices"</li>
                    <li>4. Tap "Link a device"</li>
                    <li>5. Scan this QR code</li>
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> This will link your WhatsApp account to send notifications.
                    Messages will appear to come from your WhatsApp number.
                  </p>
                </div>
              </div>
            )}

            {authStatus?.isReady && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-green-800 font-medium">WhatsApp Connected!</p>
                    <p className="text-green-700 text-sm">Ready to send notifications</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex space-x-3">
              {!authStatus?.isReady && (
                <button
                  onClick={fetchQRCode}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Refresh QR Code'}
                </button>
              )}
              
              <button
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fetch subjects when year changes
  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, showAllYears]);
  
  // Fetch WhatsApp status on component mount and periodically
  useEffect(() => {
    fetchWhatsAppStatus();
    const interval = setInterval(fetchWhatsAppStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fetch attendance records when date, year, or subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchAttendanceRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, selectedYear, selectedSubject]);
  
  // Fetch subjects for the selected year
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${backendUrl}/api/subject/year/${selectedYear}`,
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      
      if (response.data) {
        setSubjects(response.data);
        // Set the first subject as selected if available
        if (response.data.length > 0 && !selectedSubject) {
          setSelectedSubject(response.data[0]._id);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching subjects:', error);
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch attendance records for the selected date, subject, and year
  const fetchAttendanceRecords = async () => {
    if (!selectedSubject) {
      setAttendanceRecords([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format date for API request
      const formattedDate = new Date(date).toISOString().split('T')[0];
      console.log(`Fetching attendance records for subject: ${selectedSubject}, date: ${formattedDate}, year: ${selectedYear}`);
      
      const response = await axios.get(
        `${backendUrl}/api/attendance/subject/${selectedSubject}`,
        {
          params: { date: formattedDate, year: selectedYear },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log('Attendance records response:', response.data);
      
      if (response.data && response.data.success) {
        // Filter out any records that don't have a valid student reference
        const validRecords = response.data.data.filter(
          (record: Partial<AttendanceRecord>) => record.student && record.student._id
        );
        console.log(`Found ${validRecords.length} valid attendance records`);
        setAttendanceRecords(validRecords as AttendanceRecord[]);
      } else {
        console.log('No attendance records found or invalid response');
        setAttendanceRecords([]);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching attendance records:', error);
      setError(`Failed to fetch attendance records: ${error.message || 'Unknown error'}`);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle showing all years
  const handleShowAllYears = () => {
    setShowAllYears(true);
    setSelectedYear('2'); // Default to year 2 when showing all years
  };
  
  // Handle selecting a specific year
  const handleSelectYear = (year: string) => {
    setShowAllYears(false);
    setSelectedYear(year);
  };

  // Filter students based on search query
  const filteredStudents = students
    // First filter by year
    .filter((student) => showAllYears || student.year === selectedYear)
    // Then filter by search query if it exists
    .filter(student => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase().trim();
      return (
        student.name.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query) ||
        student.phone.toLowerCase().includes(query) ||
        student.parentsPhone.toLowerCase().includes(query)
      );
    });

  // Check if a student is present in the attendance records
  const getAttendanceStatus = (studentId: number | string) => {
    // If no attendance records exist, show all students as present by default
    if (!attendanceRecords || attendanceRecords.length === 0) return true;
    const studentIdStr = studentId.toString();
    
    // Find the record matching the student ID
    const record = attendanceRecords.find(record => {
      // Make sure student and _id exist before trying to access them
      if (!record || !record.student || !record.student._id) return false;
      
      // Convert both IDs to strings for comparison
      const recordStudentId = record.student._id.toString();
      return recordStudentId === studentIdStr;
    });
    
    // Return the status from the record if it exists, or true (present) by default if no record found
    return record ? Boolean(record.status) : true;
  };
  
  // Toggle attendance status for a student
  const toggleAttendance = async (studentId: number | string) => {
    try {
      if (!selectedSubject) {
        setError('Please select a subject first');
        return;
      }
      
      // Prevent multiple clicks by checking if already loading
      if (loading) {
        return;
      }
      
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const studentIdStr = studentId.toString();
      
      // Find the existing record by student ID
      const existingRecord = attendanceRecords.find(record => {
        if (!record || !record.student || !record.student._id) return false;
        return record.student._id.toString() === studentIdStr;
      });
      
      try {
        let response;
        
        if (existingRecord && existingRecord._id) {
          // Get the current status
          const currentStatus = Boolean(existingRecord.status);
          // Toggle to the opposite status
          const newStatus = !currentStatus;
          
          console.log(`Updating attendance record ${existingRecord._id} from ${currentStatus} to ${newStatus}`);
          
          // Update existing record
          response = await axios.put(
            `${backendUrl}/api/attendance/update/${existingRecord._id}`,
            { status: newStatus },
            { 
              headers: { 'Authorization': `Bearer ${token}` },
              // Add timeout to prevent hanging requests
              timeout: 10000
            }
          );
        } else {
          // Create new record
          console.log(`Creating new attendance record for student ${studentIdStr}`);
          
          // Format the date properly
          const formattedDate = new Date(date).toISOString().split('T')[0];
          console.log(`Using formatted date: ${formattedDate}`);
          
          // Ensure student ID is properly formatted
          const studentIdFormatted = studentIdStr.trim();
          
          // Ensure subject ID is properly formatted
          const subjectIdFormatted = selectedSubject.trim();
          
          console.log(`Formatted IDs: studentId=${studentIdFormatted}, subjectId=${subjectIdFormatted}`);
          
          // Create attendance payload with explicit boolean status
          const payload = {
            studentId: studentIdFormatted,
            subjectId: subjectIdFormatted,
            date: formattedDate,
            year: selectedYear,
            status: true
          };
          
          console.log('Sending payload:', JSON.stringify(payload, null, 2));
          console.log('API URL:', `${backendUrl}/api/attendance/record`);
          
          response = await axios.post(
            `${backendUrl}/api/attendance/record`,
            payload,
            { 
              headers: { 'Authorization': `Bearer ${token}` },
              timeout: 10000
            }
          );
        }
        
        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || 'Failed to update attendance');
        }
        
        // Get the updated record from the response
        const updatedRecord = response.data.data;
        console.log('Successfully updated attendance:', updatedRecord);
        
        // Force a full refresh of attendance records
        await fetchAttendanceRecords();
        
        setSuccessMessage('Attendance updated successfully');
      } catch (apiError: unknown) {
        const error = apiError as Error & { 
          response?: { data?: { message?: string }; status?: number }; 
          code?: string 
        };
        console.error('API Error:', error);
        console.error('Error details:', error.response?.data);
        
        // Check if it's a network error
        if (error.code === 'ECONNABORTED') {
          setError('Request timed out. Please try again.');
        } 
        // Check if it's a server error (500)
        else if (error.response && error.response.status === 500) {
          setError(`Server error (500): ${error.response?.data?.message || 'Unknown error'}`);
          
          // Refresh the attendance records to get the latest state
          await fetchAttendanceRecords();
        } 
        // Handle other errors
        else {
          setError(`Failed to update attendance: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('General error in toggleAttendance:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };
  
  // Send notification to parents of absent students
  const sendAbsentNotification = async () => {
    try {
      if (!selectedSubject) {
        setError('Please select a subject first');
        return;
      }
      
      if (!whatsappStatus?.isReady) {
        setError('WhatsApp is not authenticated. Please scan QR code first.');
        return;
      }
      
      if (filteredStudents.length === 0) {
        setError('No students found to check attendance');
        return;
      }
      
      setSendingNotification(true);
      setError(null);
      setSuccessMessage(null);
      
      // Get list of absent students
      const absentStudents = filteredStudents.filter(student => !getAttendanceStatus(student.id));
      
      if (absentStudents.length === 0) {
        setError('No absent students found to notify');
        setSendingNotification(false);
        return;
      }
      
      // Format date for API request
      const formattedDate = new Date(date).toISOString().split('T')[0];
      
      // Get subject name
      const subjectName = subjects.find(s => s._id === selectedSubject)?.name || 'Unknown Subject';
      
      // Get teacher name (you can add this to context or get from token)
      const teacherName = 'Teacher'; // TODO: Get actual teacher name from context
      
      // Prepare notification data
      const notificationData = {
        subjectId: selectedSubject,
        subjectName,
        date: formattedDate,
        year: selectedYear,
        absentStudentIds: absentStudents.map(student => student.id.toString()),
        teacherName
      };
      
      // Send notification request
      const response = await axios.post(
        `${backendUrl}/api/attendance/notify-absent`,
        notificationData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success) {
        const { successful, failed, total } = response.data.data;
        setSuccessMessage(`Notifications processed: ${successful} sent successfully${failed > 0 ? `, ${failed} failed` : ''} out of ${total} parents`);
      } else {
        throw new Error(response.data?.message || 'Failed to send notifications');
      }
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      console.error('Error sending notifications:', error);
      
      if (error.response?.status === 503) {
        setError('WhatsApp authentication required. Please scan QR code first.');
      } else {
        setError(`Failed to send notifications: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      }
    } finally {
      setSendingNotification(false);
    }
  };

  // Mark all students as present or absent
  const markAllAs = async (status: boolean) => {
    try {
      if (!selectedSubject) {
        setError('Please select a subject first');
        return;
      }
      
      if (filteredStudents.length === 0) {
        setError('No students found to mark attendance');
        return;
      }
      
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Prepare attendance records for all students
      const attendanceData = {
        subjectId: selectedSubject,
        date,
        year: selectedYear,
        attendanceRecords: filteredStudents.map(student => ({
          studentId: student.id.toString(),
          status
        }))
      };
      
      // Send bulk attendance update
      await axios.post(
        `${backendUrl}/api/attendance/record-bulk`,
        attendanceData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Refresh attendance records
      await fetchAttendanceRecords();
      setSuccessMessage(`All students marked as ${status ? 'present' : 'absent'}`);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error marking all students:', error);
      setError('Failed to update attendance for all students');
    } finally {
      setLoading(false);
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  // Fetch WhatsApp status
  const fetchWhatsAppStatus = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/whatsapp/status`,
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      
      if (response.data && response.data.success) {
        setWhatsappStatus(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching WhatsApp status:', err);
      setWhatsappStatus(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">📘 Attendance Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Mark attendance for <span className="font-medium text-indigo-600">{date}</span></p>
          </div>
          <div className="hidden sm:block">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Today
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="date"
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 w-full"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* Year Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {/* Individual Year Buttons */}
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleSelectYear(year)}
                    className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                      !showAllYears && selectedYear === year
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Year {year}
                  </button>
                ))}
                {/* All Years Button */}
                <button
                  onClick={handleShowAllYears}
                  className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                    showAllYears
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Years
                </button>
              </div>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white text-sm border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={loading}
              >
                {subjects.length === 0 && <option value="">No subjects available</option>}
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Quick Actions
          </h2>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, roll number, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>
          
                      {/* WhatsApp Authentication Status */}
            {whatsappStatus && (
              <div className={`border px-4 py-3 rounded-lg mb-4 ${
                whatsappStatus.isReady 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className={`h-5 w-5 mr-2 ${whatsappStatus.isReady ? 'text-green-600' : 'text-blue-600'}`} />
                    <div>
                      <span className="text-sm font-medium">
                        WhatsApp: {whatsappStatus.isReady ? 'Authenticated' : 'Not Authenticated'}
                      </span>
                      {whatsappStatus.connectionInfo && (
                        <div className="text-xs text-gray-600">
                          Connected: {whatsappStatus.connectionInfo.phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!whatsappStatus.isReady && (
                      <button
                        onClick={() => setShowQRCode(true)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-blue-600 transition"
                      >
                        <QrCode className="h-4 w-4" />
                        Show QR Code
                      </button>
                    )}
                    {whatsappStatus.isReady && (
                      <button
                        onClick={() => {}}
                        className="bg-red-500 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-red-600 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Switch Account
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center mb-4">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {successMessage}
            </div>
          )}
          
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => markAllAs(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1.5 rounded-md shadow-sm transition-all hover:shadow active:scale-[0.98] text-xs font-medium flex items-center justify-center"
              disabled={loading || !selectedSubject}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark All Present
            </button>
            <button
              onClick={() => markAllAs(false)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1.5 rounded-md shadow-sm transition-all hover:shadow active:scale-[0.98] text-xs font-medium flex items-center justify-center"
              disabled={loading || !selectedSubject}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Mark All Absent
            </button>
            <button
              onClick={sendAbsentNotification}
              className={`w-full sm:w-auto px-4 py-2 rounded-md shadow-sm transition-all hover:shadow active:scale-[0.98] text-sm font-medium flex items-center justify-center ${
                whatsappStatus?.isReady 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={sendingNotification || loading || !selectedSubject || !whatsappStatus?.isReady}
              title={!whatsappStatus?.isReady ? 'Please authenticate WhatsApp first' : 'Send WhatsApp notifications to absent students parents'}
            >
              <Bell className="h-4 w-4 mr-2" />
              {sendingNotification ? 'Sending...' : 'Send WhatsApp Notifications'}
              {sendingNotification && (
                <svg className="animate-spin h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Student Attendance Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {showAllYears ? 
                `All Years - ${subjects.find(s => s._id === selectedSubject)?.name || 'Select Subject'}` : 
                `Year ${selectedYear} - ${subjects.find(s => s._id === selectedSubject)?.name || 'Select Subject'}`
              }
            </h2>
            <div className="flex items-center">
              {loading && (
                <div className="mr-3 text-xs text-indigo-600 flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              )}
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filteredStudents.length} Students</span>
            </div>
          </div>

          <div className="overflow-hidden overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Student</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Roll No</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">Attendance</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Phone</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Parents Phone</th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 break-words">{student.name}</div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="text-sm text-gray-500 break-words">{student.rollNo}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleAttendance(student.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          getAttendanceStatus(student.id) ? 'bg-indigo-600' : 'bg-gray-300'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading || !selectedSubject}
                        aria-label={getAttendanceStatus(student.id) ? 'Mark as absent' : 'Mark as present'}
                        key={`toggle-${student.id}-${getAttendanceStatus(student.id)}-${Date.now()}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                            getAttendanceStatus(student.id) ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                        <span className="sr-only">Toggle attendance</span>
                      </button>
                      <span className={`ml-2 text-xs sm:text-sm font-medium ${getAttendanceStatus(student.id) ? 'text-green-600' : 'text-red-600'}`}>
                        {getAttendanceStatus(student.id) ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="text-xs sm:text-sm text-gray-500 break-words">{student.phone}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="text-xs sm:text-sm text-gray-500 break-words">{student.parentsPhone}</div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* WhatsApp QR Code Modal */}
      {showQRCode && (
        <WhatsAppQRModal isOpen={showQRCode} onClose={() => setShowQRCode(false)} />
      )}
    </main>
  );
};

export default Attendance;
