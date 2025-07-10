import { Student, Stats, Activity, ClassOption } from '../types';

export const statsData: Stats = {
  totalStudents: 256,
  todayAttendance: 232,
  absentStudents: 24,
  attendanceRate: 90.6
};

export const studentsData: Student[] = [
  { id: 1, name: 'Emma Watson', rollNo: 'ST001', present: true, year: '2', image: '', phone: '9876543210', parentsPhone: '9876543211', lectureAttendance: [] },
  { id: 2, name: 'James Smith', rollNo: 'ST002', present: true, year: '2', image: '', phone: '9876543212', parentsPhone: '9876543213', lectureAttendance: [] },
  { id: 3, name: 'Sophia Chen', rollNo: 'ST003', present: false, year: '2', image: '', phone: '9876543214', parentsPhone: '9876543215', lectureAttendance: [] },
  { id: 4, name: 'Michael Brown', rollNo: 'ST004', present: true, year: '3', image: '', phone: '9876543216', parentsPhone: '9876543217', lectureAttendance: [] },
  { id: 5, name: 'Olivia Johnson', rollNo: 'ST005', present: true, year: '3', image: '', phone: '9876543218', parentsPhone: '9876543219', lectureAttendance: [] },
  { id: 6, name: 'William Davis', rollNo: 'ST006', present: false, year: '4', image: '', phone: '9876543220', parentsPhone: '9876543221', lectureAttendance: [] },
];

export const activityData: Activity[] = [
  { 
    id: 1, 
    type: 'new_student', 
    title: 'New student added', 
    description: 'Emma Watson was added to Class 10A', 
    timestamp: '2 hours ago',
    icon: 'user-plus',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  { 
    id: 2, 
    type: 'attendance_update', 
    title: 'Attendance updated', 
    description: 'Class 11A attendance marked for May 7', 
    timestamp: 'Yesterday',
    icon: 'clipboard-check',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  { 
    id: 3, 
    type: 'attendance_alert', 
    title: 'Attendance alert', 
    description: 'William Davis has missed 3 consecutive days', 
    timestamp: '2 days ago',
    icon: 'exclamation-triangle',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  { 
    id: 4, 
    type: 'report', 
    title: 'Report generated', 
    description: 'Monthly attendance report for April 2025', 
    timestamp: 'May 1, 2025',
    icon: 'file-alt',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  }
];

export const classOptions: ClassOption[] = [
  { id: 'all', name: 'All Years' },
  { id: '2', name: 'Year 2' },
  { id: '3', name: 'Year 3' },
  { id: '4', name: 'Year 4' }
];