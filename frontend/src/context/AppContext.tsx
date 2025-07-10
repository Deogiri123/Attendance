import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Stats, Subject, Teacher } from '../types';
import { statsData } from '../data';
import axios from 'axios';

// Define Activity interface since it's used in the context
interface Activity {
  id: number;
  type: 'new_student' | 'attendance_update' | 'attendance_alert' | 'report';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface AppContextType {
  students: Student[];
  filteredStudents: Student[];
  date: string;
  lectures: Record<string, string[]>;
  setDate: (date: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stats: Stats;
  activities: Activity[];
  token: string | null;
  setToken: (token: string | null) => void;
  backendUrl: string;
  loading: boolean;
  error: string | null;
  toggleStudentAttendance: (studentId: number) => void;
  markAllAs: (status: boolean) => void;
  fetchStudents: () => Promise<void>;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: number) => Promise<void>;
  fetchTeachers: () => Promise<Teacher[]>;
  fetchSubjects: () => Promise<Subject[]>;
  addTeacher: (teacher: { name: string; email: string; phone: string }) => Promise<void>;
  updateTeacher: (id: string, teacher: { name: string; email: string; phone: string }) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addSubjectToTeacher: (teacherId: string, subjectId: string) => Promise<void>;
  removeSubjectFromTeacher: (teacherId: string, subjectId: string) => Promise<void>;
  selectedClass: string;
  setSelectedClass: (className: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>(statsData);
  const [date, setDate] = useState<string>('2025-05-08');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('All Years');
  // Initialize activities state (not currently used but required by context type)
  const [activities] = useState<Activity[]>([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Legacy lecture data - can be removed once subject API is fully integrated
  const [lectures] = useState<Record<string, string[]>>({
    '2': ['Data Structures', 'Algorithms', 'Database Systems'],
    '3': ['Computer Networks', 'Operating Systems', 'Software Engineering'],
    '4': ['Artificial Intelligence', 'Machine Learning', 'Cloud Computing'],
  });

  // Fetch students from the backend
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendUrl}/api/student/list-student`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.data && response.data.success && response.data.data) {
        // Transform backend student data to match our frontend Student interface
        const transformedStudents = response.data.data.map((student: any) => ({
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          phone: student.phone,
          parentsPhone: student.parentsPhone,
          present: false, // Default value
          image: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70), // Placeholder image
          year: student.year.toString(),
          lectureAttendance: [] // Initialize empty array
        }));

        setStudents(transformedStudents);
      }
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students when component mounts or token changes
  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  // Calculate stats based on current students
  useEffect(() => {
    const totalStudents = students.length;
    // For now, we'll set placeholder values for attendance stats
    // These will be updated when we integrate with the attendance API
    setStats({
      totalStudents,
      todayAttendance: 0,
      absentStudents: totalStudents,
      attendanceRate: 0,
    });
  }, [students]);

  // Direct toggle for student attendance (for dashboard)
  const toggleStudentAttendance = async (studentId: number) => {
    try {
      // Find the student
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      // Toggle the present status
      const updatedStudent = {
        ...student,
        present: !student.present
      };

      // Update in backend
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const studentData = {
        name: updatedStudent.name,
        rollNo: updatedStudent.rollNo,
        phone: updatedStudent.phone,
        parentsPhone: updatedStudent.parentsPhone,
        year: updatedStudent.year,
        attendance: updatedStudent.present
      };

      await axios.put(
        `${backendUrl}/api/student/update-student/${updatedStudent.id}`,
        studentData,
        config
      );

      // Update in frontend state
      setStudents(students.map(s =>
        s.id === studentId ? updatedStudent : s
      ));

      // Update stats
      const presentCount = students.filter(s => s.id === studentId ? updatedStudent.present : s.present).length;
      const absentCount = students.length - presentCount;
      const rate = students.length > 0 ? (presentCount / students.length) * 100 : 0;

      setStats({
        ...stats,
        todayAttendance: presentCount,
        absentStudents: absentCount,
        attendanceRate: parseFloat(rate.toFixed(1))
      });
    } catch (error) {
      console.error('Error toggling student attendance:', error);
    }
  };

  // Mark all students as present or absent
  const markAllAs = async (status: boolean) => {
    try {
      // Update all students in the state
      const updatedStudents = students.map(student => ({
        ...student,
        present: status
      }));

      // Update in backend
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      // Update each student in the backend
      const updatePromises = updatedStudents.map(student => {
        const studentData = {
          name: student.name,
          rollNo: student.rollNo,
          phone: student.phone,
          parentsPhone: student.parentsPhone,
          year: student.year,
          attendance: student.present
        };

        return axios.put(
          `${backendUrl}/api/student/update-student/${student.id}`,
          studentData,
          config
        );
      });

      await Promise.all(updatePromises);

      // Update frontend state
      setStudents(updatedStudents);

      // Update stats
      const presentCount = status ? students.length : 0;
      const absentCount = status ? 0 : students.length;
      const rate = status ? 100 : 0;

      setStats({
        ...stats,
        todayAttendance: presentCount,
        absentStudents: absentCount,
        attendanceRate: parseFloat(rate.toFixed(1))
      });
    } catch (error) {
      console.error('Error marking all students:', error);
    }
  };

  // Student management functions
  const addStudent = async (student: Student): Promise<void> => {
    try {
      const studentData = {
        name: student.name,
        rollNo: student.rollNo,
        phone: student.phone,
        parentsPhone: student.parentsPhone,
        year: student.year,
        attendance: student.present
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post(
        `${backendUrl}/api/student/add-student`,
        studentData,
        config
      );

      if (response.data && response.data.student) {
        // Add the new student to the state
        const newStudent = {
          ...student,
          id: response.data.student._id
        };
        setStudents([...students, newStudent]);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  };

  const updateStudent = async (student: Student): Promise<void> => {
    try {
      const studentData = {
        name: student.name,
        rollNo: student.rollNo,
        phone: student.phone,
        parentsPhone: student.parentsPhone,
        year: student.year,
        attendance: student.present
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.put(
        `${backendUrl}/api/student/update-student/${student.id}`,
        studentData,
        config
      );

      // Update the student in the state
      setStudents(students.map(s => s.id === student.id ? student : s));
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  };

  const deleteStudent = async (studentId: number): Promise<void> => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.delete(
        `${backendUrl}/api/student/delete-student/${studentId}`,
        config
      );

      // Remove the student from the state
      setStudents(students.filter(s => s.id !== studentId));
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  };

  // Teacher management functions
  const fetchTeachers = async (): Promise<Teacher[]> => {
    try {
      const response = await axios.get(`${backendUrl}/api/teacher/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching teachers:', err);
      return [];
    }
  };

  const fetchSubjects = async (): Promise<Subject[]> => {
    try {
      const years = ['2', '3', '4'];
      const allSubjects: Subject[] = [];

      for (const year of years) {
        const response = await axios.get(`${backendUrl}/api/subject/year/${year}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data) {
          allSubjects.push(...response.data);
        }
      }

      return allSubjects;
    } catch (err) {
      console.error('Error fetching subjects:', err);
      return [];
    }
  };

  const addTeacher = async (teacher: { name: string; email: string; phone: string }): Promise<void> => {
    try {
      await axios.post(
        `${backendUrl}/api/teacher/add`,
        teacher,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
    } catch (err) {
      console.error('Error adding teacher:', err);
      throw err;
    }
  };

  const updateTeacher = async (id: string, teacher: { name: string; email: string; phone: string }): Promise<void> => {
    try {
      await axios.put(
        `${backendUrl}/api/teacher/update/${id}`,
        teacher,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
    } catch (err) {
      console.error('Error updating teacher:', err);
      throw err;
    }
  };

  const deleteTeacher = async (id: string): Promise<void> => {
    try {
      await axios.delete(
        `${backendUrl}/api/teacher/delete/${id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    } catch (err) {
      console.error('Error deleting teacher:', err);
      throw err;
    }
  };

  const addSubjectToTeacher = async (teacherId: string, subjectId: string): Promise<void> => {
    try {
      await axios.post(
        `${backendUrl}/api/teacher/${teacherId}/add-subject/${subjectId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    } catch (err) {
      console.error('Error adding subject to teacher:', err);
      throw err;
    }
  };

  const removeSubjectFromTeacher = async (teacherId: string, subjectId: string): Promise<void> => {
    try {
      await axios.delete(
        `${backendUrl}/api/teacher/${teacherId}/remove-subject/${subjectId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    } catch (err) {
      console.error('Error removing subject from teacher:', err);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        students,
        filteredStudents: students,
        date,
        lectures,
        setDate,
        searchQuery,
        setSearchQuery,
        stats,
        activities,
        token,
        setToken,
        backendUrl,
        loading,
        error,
        toggleStudentAttendance,
        markAllAs,
        fetchStudents,
        // Student management functions
        addStudent,
        updateStudent,
        deleteStudent,
        // Teacher management functions
        fetchTeachers,
        fetchSubjects,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addSubjectToTeacher,
        removeSubjectFromTeacher,
        selectedClass,
        setSelectedClass
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};